import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChefHat, Clock, CheckCircle2, ArrowLeft, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderItem } from "@/types/pos";

interface KitchenOrder {
  id: string;
  orderNumber: string;
  tableId: string | null;
  items: OrderItem[];
  status: "sent" | "preparing" | "ready";
  sentAt: Date;
  notes: string | null;
}

export default function Kitchen() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .in("status", ["sent", "preparing", "ready"])
        .order("sent_to_kitchen_at", { ascending: true });

      if (error) throw error;

      const mapped: KitchenOrder[] = (data || []).map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        tableId: order.table_id,
        items: (order.items as unknown as OrderItem[]) || [],
        status: order.status as KitchenOrder["status"],
        sentAt: new Date(order.sent_to_kitchen_at || order.created_at),
        notes: order.notes,
      }));

      setOrders(mapped);
    } catch (error) {
      console.error("Error fetching kitchen orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    fetchOrders();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    // Play sound on new order
    const handleNewOrder = () => {
      // Could add audio notification here
      toast({
        title: "New Order!",
        description: "A new order has arrived.",
      });
    };

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, authLoading, navigate]);

  const updateStatus = async (orderId: string, newStatus: KitchenOrder["status"]) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Order marked as ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const getTimeSince = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes === 1) return "1 min ago";
    return `${minutes} mins ago`;
  };

  const getStatusColor = (status: KitchenOrder["status"]) => {
    switch (status) {
      case "sent":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "preparing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "ready":
        return "bg-success/20 text-success border-success/30";
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const sentOrders = orders.filter((o) => o.status === "sent");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");

  return (
    <>
      <Helmet>
        <title>Kitchen Display | Restaurant POS</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold">Kitchen Display</h1>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchOrders}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </header>

        {/* Main Content - 3 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 h-[calc(100vh-80px)]">
          {/* New Orders Column */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className={getStatusColor("sent")}>
                New Orders
              </Badge>
              <span className="text-muted-foreground text-sm">
                ({sentOrders.length})
              </span>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {sentOrders.map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={updateStatus}
                    getTimeSince={getTimeSince}
                  />
                ))}
                {sentOrders.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No new orders
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Preparing Column */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className={getStatusColor("preparing")}>
                Preparing
              </Badge>
              <span className="text-muted-foreground text-sm">
                ({preparingOrders.length})
              </span>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {preparingOrders.map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={updateStatus}
                    getTimeSince={getTimeSince}
                  />
                ))}
                {preparingOrders.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No orders being prepared
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Ready Column */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className={getStatusColor("ready")}>
                Ready
              </Badge>
              <span className="text-muted-foreground text-sm">
                ({readyOrders.length})
              </span>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {readyOrders.map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={updateStatus}
                    getTimeSince={getTimeSince}
                  />
                ))}
                {readyOrders.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No orders ready
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  );
}

interface KitchenOrderCardProps {
  order: KitchenOrder;
  onStatusChange: (id: string, status: KitchenOrder["status"]) => void;
  getTimeSince: (date: Date) => string;
}

function KitchenOrderCard({ order, onStatusChange, getTimeSince }: KitchenOrderCardProps) {
  const getNextStatus = (): KitchenOrder["status"] | null => {
    switch (order.status) {
      case "sent":
        return "preparing";
      case "preparing":
        return "ready";
      default:
        return null;
    }
  };

  const getButtonText = () => {
    switch (order.status) {
      case "sent":
        return "Start Preparing";
      case "preparing":
        return "Mark Ready";
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus();

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {order.orderNumber}
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {getTimeSince(order.sentAt)}
          </div>
        </div>
        {order.tableId && (
          <p className="text-sm text-muted-foreground">
            Table {order.tableId}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-4">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex justify-between text-sm">
              <span>
                <span className="font-medium text-primary mr-2">
                  {item.quantity}x
                </span>
                {item.name}
              </span>
              {item.modifiers && item.modifiers.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {item.modifiers.join(", ")}
                </span>
              )}
            </li>
          ))}
        </ul>
        {order.notes && (
          <p className="text-xs text-amber-400 mb-3 p-2 bg-amber-500/10 rounded">
            Note: {order.notes}
          </p>
        )}
        {nextStatus && (
          <Button
            className="w-full"
            variant={order.status === "preparing" ? "default" : "secondary"}
            onClick={() => onStatusChange(order.id, nextStatus)}
          >
            {order.status === "preparing" && (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            {getButtonText()}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
