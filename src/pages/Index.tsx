import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import type { MenuItem, OrderItem } from "@/types/pos";
import { categories, menuItems } from "@/data/menuData";
import { POSHeader } from "@/components/pos/POSHeader";
import { CategoryNav } from "@/components/pos/CategoryNav";
import { MenuGrid } from "@/components/pos/MenuGrid";
import { OrderPanel } from "@/components/pos/OrderPanel";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return menuItems;
    return menuItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const handleAddToOrder = (item: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`Added ${item.name}`, {
      duration: 1500,
      position: "bottom-center",
    });
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setOrderItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
    toast.info("Item removed", { duration: 1500, position: "bottom-center" });
  };

  const handleClearOrder = () => {
    setOrderItems([]);
    toast.info("Order cleared", { duration: 1500, position: "bottom-center" });
  };

  const handleCheckout = () => {
    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    toast.success(`Order placed! Total: $${(total * 1.1).toFixed(2)}`, {
      duration: 3000,
      position: "bottom-center",
    });
    setOrderItems([]);
    setIsCartOpen(false);
  };

  const orderCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

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
        <POSHeader orderCount={orderCount} onOpenCart={() => setIsCartOpen(true)} />

        <div className="flex flex-1 overflow-hidden">
          {/* Main Menu Area */}
          <main className="flex-1 flex flex-col overflow-hidden p-4 lg:pr-0">
            <div className="mb-4">
              <CategoryNav
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <MenuGrid items={filteredItems} onAddToOrder={handleAddToOrder} />
            </div>
          </main>

          {/* Order Panel - Desktop */}
          <div className="hidden lg:flex w-96">
            <OrderPanel
              items={orderItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearOrder={handleClearOrder}
              onCheckout={handleCheckout}
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
    </>
  );
};

export default Index;
