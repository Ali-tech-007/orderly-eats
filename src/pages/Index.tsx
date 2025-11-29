import { useState, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import type { MenuItem, OrderItem, Table, TableStatus } from "@/types/pos";
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
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = discount
      ? discount.type === 'percentage'
        ? (subtotal * discount.amount) / 100
        : discount.amount
      : 0;
    const total = (subtotal - discountAmount) * 1.1;
    
    toast.success(`Order placed! Total: $${total.toFixed(2)}`, {
      duration: 3000,
      position: "bottom-center",
    });
    setOrderItems([]);
    setDiscount(undefined);
    setOrderHistory([]);
    setIsCartOpen(false);
    
    // Update table status if selected
    if (selectedTable) {
      setTables((prev) =>
        prev.map((t) => (t.id === selectedTable ? { ...t, status: 'dirty' as TableStatus } : t))
      );
    }
  };

  const handleSendToKitchen = () => {
    toast.success("Order sent to kitchen!", {
      duration: 2000,
      position: "bottom-center",
      icon: "🍳",
    });
  };

  const handleSplitBill = () => {
    toast.info("Split bill feature coming soon!", {
      duration: 2000,
      position: "bottom-center",
    });
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

  const orderCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectedTableData = tables.find((t) => t.id === selectedTable);
  const selectedTableName = selectedTableData ? `Table ${selectedTableData.number}` : undefined;

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
    </>
  );
};

export default Index;
