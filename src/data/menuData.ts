import burgerImg from "@/assets/burger.jpg";
import saladImg from "@/assets/caesar-salad.jpg";
import friesImg from "@/assets/fries.jpg";
import lemonadeImg from "@/assets/lemonade.jpg";
import pizzaImg from "@/assets/pizza.jpg";
import steakImg from "@/assets/steak.jpg";
import cakeImg from "@/assets/chocolate-cake.jpg";
import coffeeImg from "@/assets/coffee.jpg";

import type { MenuItem, Category } from "@/types/pos";

export const categories: Category[] = [
  { id: "all", name: "All Items", icon: "Grid3X3" },
  { id: "burgers", name: "Burgers", icon: "Sandwich" },
  { id: "pizza", name: "Pizza", icon: "Pizza" },
  { id: "mains", name: "Mains", icon: "UtensilsCrossed" },
  { id: "sides", name: "Sides", icon: "Salad" },
  { id: "drinks", name: "Drinks", icon: "Coffee" },
  { id: "desserts", name: "Desserts", icon: "Cake" },
];

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Classic Burger",
    price: 12.99,
    category: "burgers",
    image: burgerImg,
    description: "Juicy beef patty with cheese, lettuce & tomato",
  },
  {
    id: "2",
    name: "Caesar Salad",
    price: 9.99,
    category: "sides",
    image: saladImg,
    description: "Fresh romaine, parmesan, croutons",
  },
  {
    id: "3",
    name: "Golden Fries",
    price: 4.99,
    category: "sides",
    image: friesImg,
    description: "Crispy seasoned fries",
  },
  {
    id: "4",
    name: "Fresh Lemonade",
    price: 3.99,
    category: "drinks",
    image: lemonadeImg,
    description: "Freshly squeezed with mint",
  },
  {
    id: "5",
    name: "Pepperoni Pizza",
    price: 16.99,
    category: "pizza",
    image: pizzaImg,
    description: "Classic pepperoni with mozzarella",
  },
  {
    id: "6",
    name: "Ribeye Steak",
    price: 28.99,
    category: "mains",
    image: steakImg,
    description: "12oz ribeye with herb butter",
  },
  {
    id: "7",
    name: "Lava Cake",
    price: 8.99,
    category: "desserts",
    image: cakeImg,
    description: "Molten chocolate with ice cream",
  },
  {
    id: "8",
    name: "Cappuccino",
    price: 4.49,
    category: "drinks",
    image: coffeeImg,
    description: "Espresso with steamed milk",
  },
];
