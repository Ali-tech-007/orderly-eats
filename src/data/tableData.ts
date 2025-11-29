import type { Table } from "@/types/pos";

export const tables: Table[] = [
  { id: "t1", number: 1, seats: 2, status: "available", position: { x: 10, y: 10 }, shape: "square" },
  { id: "t2", number: 2, seats: 2, status: "occupied", position: { x: 30, y: 10 }, shape: "square" },
  { id: "t3", number: 3, seats: 4, status: "available", position: { x: 50, y: 10 }, shape: "square" },
  { id: "t4", number: 4, seats: 4, status: "reserved", position: { x: 70, y: 10 }, shape: "square" },
  { id: "t5", number: 5, seats: 6, status: "available", position: { x: 10, y: 40 }, shape: "rectangle" },
  { id: "t6", number: 6, seats: 6, status: "occupied", position: { x: 40, y: 40 }, shape: "rectangle" },
  { id: "t7", number: 7, seats: 4, status: "dirty", position: { x: 70, y: 40 }, shape: "round" },
  { id: "t8", number: 8, seats: 8, status: "available", position: { x: 25, y: 70 }, shape: "rectangle" },
  { id: "t9", number: 9, seats: 4, status: "available", position: { x: 60, y: 70 }, shape: "round" },
];

export const modifierPresets = [
  { id: "no-onions", name: "No Onions" },
  { id: "extra-spice", name: "Extra Spicy", price: 0.50 },
  { id: "no-salt", name: "No Salt" },
  { id: "gluten-free", name: "Gluten Free", price: 2.00 },
  { id: "no-cheese", name: "No Cheese" },
  { id: "extra-cheese", name: "Extra Cheese", price: 1.50 },
  { id: "well-done", name: "Well Done" },
  { id: "medium-rare", name: "Medium Rare" },
  { id: "no-ice", name: "No Ice" },
  { id: "extra-sauce", name: "Extra Sauce", price: 0.75 },
];
