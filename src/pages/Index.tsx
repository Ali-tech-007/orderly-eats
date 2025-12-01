import { useState, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import type { MenuItem, OrderItem, Table, TableStatus, PaymentData, Receipt } from "@/types/pos";
import { categories, menuItems } from "@/data/menuData";
import { tables as initialTables } from "@/data/tableData";
import { POSHeader } from "@/components/pos/POSHeader";
import { CategoryNav } from "@/components/pos/CategoryNav";
import { MenuGrid } from "@/components/pos/MenuGrid";
import { OrderPanel } from "@/components/pos/OrderPanel";
import { SearchBar } from "@/components/pos/SearchBar";
import { TableMap } from "@/components/pos/TableMap";
import { ModifierDialog } from "@/components/pos/ModifierDialog";
import { DiscountDialog } from "@/components/pos/DiscountDialog";
import { PaymentDialog } from "@/components/pos/PaymentDialog";
import { SplitBillDialog } from "@/components/pos/SplitBillDialog";
import { ReceiptDialog } from "@/components/pos/ReceiptDialog";
import { modifierPresets } from "@/data/tableData";

type ViewMode = 'menu' | 'tables';

const Index = () => {
  // View & Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Order State
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderItem[][]>([]);
  const [discount, setDiscount] = useState<{ amount: number; type: 'percentage' | 'fixed' } | undefined>();

  // Table State
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // Dialog State
  const [modifierItem, setModifierItem] = useState<MenuItem | null>(null);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSplitBillDialog, setShowSplitBillDialog] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null);
  const [paymentTip, setPaymentTip] = useState(0);

  // Favorites & Recently Added
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<string[]>([]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    let items = menuItems;
    
    // Filter by category
    if (activeCategory !== "all") {
      items = items.filter((item) => item.category === activeCategory);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    // Sort favorites first
    return [...items].sort((a, b) => {
      const aFav = favorites.includes(a.id) ? -1 : 0;
      const bFav = favorites.includes(b.id) ? -1 : 0;
      return aFav - bFav;
    });
  }, [activeCategory, searchQuery, favorites]);

  // Save to history for undo
  const saveToHistory = useCallback(() => {
    setOrderHistory((prev) => [...prev.slice(-10), orderItems]);
  }, [orderItems]);

  // Handlers
  const handleAddToOrder = (item: MenuItem) => {
    setModifierItem(item);
  };

  const handleConfirmAddItem = (item: MenuItem, modifiers: string[], notes: string) => {
    saveToHistory();
    
    const modifierNames = modifiers.map((id) => {
      const preset = modifierPresets.find((m) => m.id === id);
      return preset?.name || id;
    });

    setOrderItems((prev) => {
      // Check if same item with same modifiers exists
      const existingIndex = prev.findIndex(
        (i) =>
          i.id === item.id &&
          JSON.stringify(i.modifiers) === JSON.stringify(modifierNames) &&
          i.notes === notes
      );

      if (existingIndex >= 0 && !notes) {
        // Increment quantity if no special notes
        return prev.map((i, idx) =>
          idx === existingIndex ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      return [...prev, { ...item, quantity: 1, modifiers: modifierNames, notes }];
    });

    // Show recently added highlight
    setRecentlyAdded((prev) => [...prev, item.id]);
    setTimeout(() => {
      setRecentlyAdded((prev) => prev.filter((id) => id !== item.id));
    }, 1500);

    toast.success(`Added ${item.name}`, {
      duration: 1500,
      position: "bottom-center",
    });
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    saveToHistory();
    setOrderItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    saveToHistory();
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
    toast.info("Item removed", { duration: 1500, position: "bottom-center" });
  };

  const handleClearOrder = () => {
    saveToHistory();
    setOrderItems([]);
    setDiscount(undefined);
    toast.info("Order cleared", { duration: 1500, position: "bottom-center" });
  };

  const handleCheckout = () => {
    setShowPaymentDialog(true);
  };

  const handlePaymentComplete = (paymentData: PaymentData) => {
    // Generate receipt
    const receipt: Receipt = {
      id: `RCP-${Date.now()}`,
      orderItems: [...orderItems],
      payment: paymentData,
      tableName: selectedTableName,
      timestamp: new Date(),
      orderNumber: `${Date.now().toString().slice(-6)}`,
    };

    setCurrentReceipt(receipt);
    setShowPaymentDialog(false);
    setShowSplitBillDialog(false);

    // Clear order
    setOrderItems([]);
    setDiscount(undefined);
    setOrderHistory([]);
    setPaymentTip(0);
    setIsCartOpen(false);

    // Update table status if selected
    if (selectedTable) {
      setTables((prev) =>
        prev.map((t) => (t.id === selectedTable ? { ...t, status: 'dirty' as TableStatus } : t))
      );
    }

    toast.success(`Payment complete! Total: $${paymentData.total.toFixed(2)}`, {
      duration: 3000,
      position: "bottom-center",
    });
  };

  const handleOpenSplitBill = () => {
    setShowPaymentDialog(false);
    setShowSplitBillDialog(true);
  };

  const handleSendToKitchen = () => {
    toast.success("Order sent to kitchen!", {
      duration: 2000,
      position: "bottom-center",
      icon: "🍳",
    });
  };

  const handleSplitBill = () => {
    setShowSplitBillDialog(true);
  };

  const handleApplyDiscount = () => {
    setShowDiscountDialog(true);
  };

  const handleConfirmDiscount = (amount: number, type: 'percentage' | 'fixed') => {
    setDiscount({ amount, type });
    toast.success(`${type === 'percentage' ? `${amount}%` : `$${amount}`} discount applied!`, {
      duration: 2000,
      position: "bottom-center",
    });
  };

  const handleUndo = () => {
    if (orderHistory.length > 0) {
      const previousState = orderHistory[orderHistory.length - 1];
      setOrderItems(previousState);
      setOrderHistory((prev) => prev.slice(0, -1));
      toast.info("Undo successful", { duration: 1500, position: "bottom-center" });
    }
  };

  const handleToggleFavorite = (itemId: string) => {
    setFavorites((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSelectTable = (tableId: string) => {
    setSelectedTable(tableId === selectedTable ? null : tableId);
  };

  const handleUpdateTableStatus = (tableId: string, status: TableStatus) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status } : t))
    );
  };

  const handleUpdateTablePosition = (tableId: string, position: { x: number; y: number }) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, position } : t))
    );
  };

  const handleMergeTables = (tableIds: string[]) => {
    if (tableIds.length < 2) return;
    
    const [primaryId, ...otherIds] = tableIds;
    const primaryTable = tables.find(t => t.id === primaryId);
    const otherTables = tables.filter(t => otherIds.includes(t.id));
    
    if (!primaryTable) return;
    
    const mergedSeats = primaryTable.seats + otherTables.reduce((sum, t) => sum + t.seats, 0);
    
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === primaryId) {
          return { ...t, seats: mergedSeats, mergedWith: otherIds };
        }
        if (otherIds.includes(t.id)) {
          return { ...t, parentTableId: primaryId, isMerged: true };
        }
        return t;
      })
    );
    
    toast.success(`Merged ${tableIds.length} tables into Table ${primaryTable.number}`, {
      duration: 2000,
      position: "bottom-center",
    });
  };

  const handleUnmergeTables = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table?.mergedWith) return;
    
    const originalSeats = initialTables.find(t => t.id === tableId)?.seats || table.seats;
    
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          return { ...t, seats: originalSeats, mergedWith: undefined };
        }
        if (table.mergedWith?.includes(t.id)) {
          return { ...t, parentTableId: undefined, isMerged: false };
        }
        return t;
      })
    );
    
    toast.success("Tables unmerged", {
      duration: 2000,
      position: "bottom-center",
    });
  };

  const orderCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectedTableData = tables.find((t) => t.id === selectedTable);
  const selectedTableName = selectedTableData ? `Table ${selectedTableData.number}` : undefined;

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = discount
    ? discount.type === 'percentage'
      ? (subtotal * discount.amount) / 100
      : discount.amount
    : 0;
  const tax = (subtotal - discountAmount) * 0.1;

  return (
    <>
      <Helmet>
        <title>RestoPOS - Restaurant Point of Sale System</title>
        <meta
          name="description"
          content="Modern restaurant POS system for efficient order management and table service."
        />
      </Helmet>

      <div className="flex flex-col h-screen bg-background overflow-hidden">
        <POSHeader
          orderCount={orderCount}
          onOpenCart={() => setIsCartOpen(true)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedTableName={selectedTableName}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <main className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 lg:pr-0">
            {viewMode === 'menu' ? (
              <>
                {/* Search Bar */}
                <div className="mb-3 sm:mb-4">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search menu items..."
                  />
                </div>

                {/* Category Navigation */}
                <div className="mb-3 sm:mb-4">
                  <CategoryNav
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                  />
                </div>

                {/* Menu Grid */}
                <div className="flex-1 overflow-y-auto pr-2">
                  <MenuGrid
                    items={filteredItems}
                    onAddToOrder={handleAddToOrder}
                    recentlyAdded={recentlyAdded}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
              </>
            ) : (
              /* Table Map View */
              <TableMap
                tables={tables}
                selectedTable={selectedTable}
                onSelectTable={handleSelectTable}
                onUpdateStatus={handleUpdateTableStatus}
                onUpdatePosition={handleUpdateTablePosition}
                onMergeTables={handleMergeTables}
                onUnmergeTables={handleUnmergeTables}
              />
            )}
          </main>

          {/* Order Panel - Desktop */}
          <div className="hidden lg:flex w-96">
            <OrderPanel
              items={orderItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearOrder={handleClearOrder}
              onCheckout={handleCheckout}
              onSendToKitchen={handleSendToKitchen}
              onSplitBill={handleSplitBill}
              onApplyDiscount={handleApplyDiscount}
              onUndo={handleUndo}
              canUndo={orderHistory.length > 0}
              discount={discount}
              tableName={selectedTableName}
            />
          </div>

          {/* Order Panel - Mobile */}
          <div className="lg:hidden">
            <OrderPanel
              items={orderItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearOrder={handleClearOrder}
              onCheckout={handleCheckout}
              onSendToKitchen={handleSendToKitchen}
              onSplitBill={handleSplitBill}
              onApplyDiscount={handleApplyDiscount}
              onUndo={handleUndo}
              canUndo={orderHistory.length > 0}
              discount={discount}
              tableName={selectedTableName}
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
            />
          </div>

          {/* Mobile Cart Overlay */}
          {isCartOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setIsCartOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Modifier Dialog */}
      {modifierItem && (
        <ModifierDialog
          item={modifierItem}
          onConfirm={handleConfirmAddItem}
          onClose={() => setModifierItem(null)}
        />
      )}

      {/* Discount Dialog */}
      {showDiscountDialog && (
        <DiscountDialog
          subtotal={subtotal}
          onApply={handleConfirmDiscount}
          onClose={() => setShowDiscountDialog(false)}
        />
      )}

      {/* Payment Dialog */}
      {showPaymentDialog && (
        <PaymentDialog
          items={orderItems}
          subtotal={subtotal}
          discount={discountAmount}
          tableName={selectedTableName}
          onComplete={handlePaymentComplete}
          onSplitBill={handleOpenSplitBill}
          onClose={() => setShowPaymentDialog(false)}
        />
      )}

      {/* Split Bill Dialog */}
      {showSplitBillDialog && (
        <SplitBillDialog
          items={orderItems}
          subtotal={subtotal}
          discount={discountAmount}
          tip={paymentTip}
          tableName={selectedTableName}
          onComplete={handlePaymentComplete}
          onClose={() => setShowSplitBillDialog(false)}
        />
      )}

      {/* Receipt Dialog */}
      {currentReceipt && (
        <ReceiptDialog
          receipt={currentReceipt}
          onClose={() => setCurrentReceipt(null)}
        />
      )}
    </>
  );
};

export default Index;
