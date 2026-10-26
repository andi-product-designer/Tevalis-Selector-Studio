import type { TreeNode } from "./selection";

const regions: Record<string, string[]> = {
  Yorkshire: ["Leeds", "Sheffield"],
  "North West": ["Manchester", "Liverpool"],
  London: ["Central London", "East London"],
  Midlands: ["Birmingham", "Nottingham"],
  Scotland: ["Glasgow", "Edinburgh"],
  "South West": ["Bristol", "Exeter"],
};
const brands = ["The Crown", "The Red Lion", "Kings Arms", "The Plough", "Station Bar", "Market Tavern", "The Swan", "Rose & Crown", "The Anchor", "Guys Testing", "The Bell", "The George"];
const suffix = ["", " Central", " Quay", " Retail Park", " Station", " Airport", " Old Town", " North", " South", " Express", " Riverside", " Arena"];

export type Site = { id: string; name: string; region: string; area: string };
export const sites: Site[] = [];
let n = 1001;
Object.entries(regions).forEach(([region, areas]) =>
  areas.forEach((area, ai) =>
    for25(ai).forEach((k) => {
      const town = area.replace(/^(Central|East) /, "");
      sites.push({ id: `S${n++}`, name: `${brands[k % brands.length]} – ${town}${suffix[(k * 7 + ai) % suffix.length]}`, region, area });
    }),
  ),
);
function for25(seed: number) {
  return Array.from({ length: 25 }, (_, i) => i + seed * 3);
}

export const siteTree: TreeNode[] = Object.entries(regions).map(([region, areas]) => ({
  id: `r:${region}`,
  name: region,
  children: areas.map((area) => ({
    id: `a:${area}`,
    name: area,
    children: sites.filter((s) => s.area === area).map((s) => ({ id: s.id, name: s.name, code: s.id, meta: area })),
  })),
}));

const groups: Record<string, string[]> = {
  Draught: ["Carling", "Corona Draught", "Guinness", "Peroni", "Madri", "Camden Hells", "Aspall Cider", "Stella Artois"],
  Bottles: ["Corona Extra", "Budweiser", "Heineken 0.0", "Becks", "Desperados", "Sol"],
  Spirits: ["Gordons Gin", "Smirnoff", "Jack Daniels", "Captain Morgan", "Jameson", "Bacardi"],
  "Soft Drinks": ["Coca-Cola", "Diet Coke", "Lemonade", "J2O Apple", "Fever-Tree Tonic", "Orange Juice"],
  Food: ["Fish & Chips", "Burger", "Cheese Sandwich", "Caesar Salad", "Sunday Roast", "Chips"],
  Hot: ["Americano", "Latte", "Cappuccino", "Tea", "Hot Chocolate"],
};
export type Product = { id: string; name: string; code: string; group: string; price: number };
export const products: Product[] = [];
let p = 2001;
Object.entries(groups).forEach(([g, items]) =>
  items.forEach((name, i) => products.push({ id: `P${p}`, name, code: `SC${p++}`, group: g, price: 2.5 + ((i * 37) % 60) / 10 })),
);
export const productTree: TreeNode[] = Object.keys(groups).map((g) => ({
  id: `g:${g}`,
  name: g,
  children: products.filter((x) => x.group === g).map((x) => ({ id: x.id, name: x.name, code: x.code })),
}));
export const productGroups = Object.keys(groups);
export const measures = ["Pint", "Half", "Two-thirds", "Bottle", "Single", "Double", "Regular", "Large"];

const dNames = ["Staff 50%", "Happy Hour", "Student 10%", "Manager Comp", "NHS 20%", "Loyalty 15%", "Birthday Free Dessert", "Staff 25%", "Happy Hour Draught", "Weekday Lunch", "Senior 10%", "Wastage", "Happy Hour Spirits", "Staff Meal", "Military 15%"];
export type Rec = { id: string; name: string; value: string };
export const discounts: Rec[] = dNames.map((d, i) => ({ id: `D${301 + i}`, name: d, value: `${[50, 20, 10, 100, 20, 15, 100, 25, 30, 15, 10, 100, 25, 50, 15][i]}%` }));
export const promotions: Rec[] = ["2 for £10 Cocktails", "Meal Deal", "Pint & Pizza", "Buy 2 Get 1 Free", "Sunday Roast Deal", "2 for 1 Burgers", "Coffee & Cake", "Pint & Burger"].map((x, i) => ({ id: `PR${71 + i}`, name: x, value: "Mix & match" }));
export const companyGroups: Rec[] = ["North Estate", "South Estate", "Franchise", "Managed Houses", "Test Sites", "Airports"].map((x, i) => ({ id: `CG${11 + i}`, name: x, value: "Group" }));
export const priceGroups = ["Standard", "Premium", "City Centre", "Airport", "Happy Hour", "Staff", "Event", "Delivery", "Takeaway", "Student"].map((x, i) => ({ id: `PG${i + 1}`, name: x }));

export const managerFunctions = ["Void Item", "Void Transaction", "Apply Discount", "Remove Discount", "Refund", "No Sale", "Open Drawer", "Price Override", "Staff Discount", "Manager Discount", "Reprint Receipt", "Transfer Table", "Split Bill", "Cash Up", "X Read", "Z Read", "Edit Tips", "Promotion Override", "Wastage", "Change Price Level"].map((x, i) => ({ id: `F${i + 1}`, name: x }));
