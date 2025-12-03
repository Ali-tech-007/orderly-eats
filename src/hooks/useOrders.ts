import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem } from "@/types/pos";
import { useToast } from "@/hooks/use-toast";

// We use unknown for items since Supabase returns Json type

const OFFLINE_ORDERS_KEY = "pos_offline_orders";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineOrders();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fetch orders from database
  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedOrders: Order[] = (data || []).map((order) => ({
        id: order.id,
        tableId: order.table_id || undefined,
        items: (order.items as unknown as OrderItem[]) || [],
        status: order.status as Order["status"],
        createdAt: new Date(order.created_at),
        discount: order.discount || undefined,
        discountType: order.discount_type as Order["discountType"],
      }));

      setOrders(mappedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  // Generate order number
  const generateOrderNumber = () => {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timePart = now.getTime().toString().slice(-4);
    return `ORD-${datePart}-${timePart}`;
  };

  // Save order (online or offline)
  const saveOrder = async (
    items: OrderItem[],
    tableId?: string,
    discount?: number,
    discountType?: "percentage" | "fixed"
  ): Promise<string | null> => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = discount
      ? discountType === "percentage"
        ? subtotal * (discount / 100)
        : discount
      : 0;
    const total = subtotal - discountAmount;

    const orderData = {
      table_id: tableId || null,
      status: "active" as const,
      items: JSON.parse(JSON.stringify(items)),
      subtotal,
      discount: discountAmount,
      discount_type: discountType || null,
      total,
      order_number: generateOrderNumber(),
      is_synced: isOnline,
    };

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from("orders")
          .insert(orderData)
          .select()
          .single();

        if (error) throw error;
        return data.id;
      } catch (error) {
        console.error("Error saving order:", error);
        // Fall back to offline storage
        saveOfflineOrder(orderData);
        return null;
      }
    } else {
      saveOfflineOrder(orderData);
      toast({
        title: "Offline Mode",
        description: "Order saved locally. Will sync when online.",
      });
      return null;
    }
  };

  // Save to local storage for offline mode
  const saveOfflineOrder = (orderData: Record<string, unknown>) => {
    const offlineOrders = JSON.parse(localStorage.getItem(OFFLINE_ORDERS_KEY) || "[]");
    offlineOrders.push({ ...orderData, offline_id: crypto.randomUUID() });
    localStorage.setItem(OFFLINE_ORDERS_KEY, JSON.stringify(offlineOrders));
  };

  // Sync offline orders when back online
  const syncOfflineOrders = async () => {
    const offlineOrders = JSON.parse(localStorage.getItem(OFFLINE_ORDERS_KEY) || "[]");
    
    if (offlineOrders.length === 0) return;

    let syncedCount = 0;
    const failedOrders: typeof offlineOrders = [];

    for (const order of offlineOrders) {
      const { offline_id, ...orderData } = order;
      orderData.is_synced = true;

      try {
        const { error } = await supabase.from("orders").insert(orderData);
        if (error) throw error;
        syncedCount++;
      } catch (error) {
        console.error("Error syncing order:", error);
        failedOrders.push(order);
      }
    }

    localStorage.setItem(OFFLINE_ORDERS_KEY, JSON.stringify(failedOrders));

    if (syncedCount > 0) {
      toast({
        title: "Orders Synced",
        description: `${syncedCount} offline order(s) synced successfully.`,
      });
      fetchOrders();
    }
  };

  // Update order status
  const updateOrderStatus = async (
    orderId: string,
    status: Order["status"]
  ) => {
    const updates: Record<string, unknown> = { status };
    
    if (status === "sent") {
      updates.sent_to_kitchen_at = new Date().toISOString();
    } else if (status === "paid") {
      updates.completed_at = new Date().toISOString();
    }

    try {
      const { error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", orderId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  };

  // Send order to kitchen
  const sendToKitchen = async (orderId: string) => {
    await updateOrderStatus(orderId, "sent");
  };

  // Get active orders for kitchen display
  const getKitchenOrders = () => {
    return orders.filter(
      (order) => order.status === "sent" || order.status === "active"
    );
  };

  // Get pending offline orders count
  const getOfflineOrdersCount = () => {
    const offlineOrders = JSON.parse(localStorage.getItem(OFFLINE_ORDERS_KEY) || "[]");
    return offlineOrders.length;
  };

  return {
    orders,
    isLoading,
    isOnline,
    saveOrder,
    updateOrderStatus,
    sendToKitchen,
    getKitchenOrders,
    getOfflineOrdersCount,
    syncOfflineOrders,
    refetch: fetchOrders,
  };
}
