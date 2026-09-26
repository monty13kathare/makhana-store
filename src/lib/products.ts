export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  mrp: number;
  image: string;
  badge?: string;
  rating: number;
  reviews: number;
  weight: string;
  heat: "None" | "Mild" | "Medium" | "Hot";
  /** Three short pills shown on the product card, as in the Figma. */
  tags: string[];
  nutrition: { label: string; value: string }[];
  ingredients: string;
};

export const products: Product[] = [
  {
    slug: "classic-himalayan-salt",
    name: "Classic Himalayan Salt",
    tagline: "Slow-roasted fox nuts blended with pink salt",
    description:
      "White Himalayan Pink Salt, Slow Roasted in A2 cow ghee. Light, airy & perfectly crunchy. Whole 6-suta makhana roasted to perfection.",
    price: 11,
    mrp: 14,
    image: "/img/bowl-classic.jpg",
    badge: "Bestseller",
    rating: 4.9,
    reviews: 1284,
    weight: "200g",
    heat: "None",
    tags: ["Roasted in Ghee", "Gluten-Free", "High Protein"],
    nutrition: [
      { label: "Energy", value: "347 kcal" },
      { label: "Protein", value: "9.7 g" },
      { label: "Carbs", value: "76 g" },
      { label: "Fat", value: "0.1 g" },
    ],
    ingredients: "Lotus seeds (98%), A2 cow ghee, Himalayan pink salt.",
  },
  {
    slug: "peri-peri-roast",
    name: "Peri Peri Roast",
    tagline: "A smoky fiery blend of authentic roasted spices",
    description:
      "A smoky fiery blend of authentic roasted spices and African bird's eye chili. Light & crunchy with an addictive spice kick.",
    price: 14,
    mrp: 17,
    image: "/img/bowl-peri.jpg",
    badge: "Spicy",
    rating: 4.8,
    reviews: 942,
    weight: "200g",
    heat: "Hot",
    tags: ["Spicy", "Source of Iron", "Zero Trans Fat"],
    nutrition: [
      { label: "Energy", value: "352 kcal" },
      { label: "Protein", value: "9.4 g" },
      { label: "Carbs", value: "74 g" },
      { label: "Fat", value: "1.2 g" },
    ],
    ingredients:
      "Lotus seeds (94%), sunflower oil, peri peri blend, tomato powder, lime.",
  },
  {
    slug: "truffle-black-pepper",
    name: "Truffle Black Pepper",
    tagline: "Aromatic black truffle flakes with cracked pepper",
    description:
      "Aromatic European black truffle flakes combined with cracked Malabar black pepper. A refined gourmet snacking experience.",
    price: 16,
    mrp: 20,
    image: "/img/bowl-cheese.jpg",
    badge: "Gourmet",
    rating: 4.9,
    reviews: 613,
    weight: "200g",
    heat: "Mild",
    tags: ["Aromatic", "Non-GMO", "Gourmet"],
    nutrition: [
      { label: "Energy", value: "364 kcal" },
      { label: "Protein", value: "10.8 g" },
      { label: "Carbs", value: "71 g" },
      { label: "Fat", value: "2.4 g" },
    ],
    ingredients:
      "Lotus seeds (92%), sunflower oil, black truffle flakes, cracked black pepper.",
  },
  {
    slug: "smoked-paprika-cheddar",
    name: "Smoked Paprika & Cheddar",
    tagline: "Spanish oak-smoked pimentón tossed with aged white cheddar",
    description:
      "Rich Spanish oak-smoked paprika dusted over crisp lotus pops with sharp aged white cheddar. A deep, savory umami burst.",
    price: 15,
    mrp: 19,
    image: "/img/roasting-fire.jpg",
    badge: "Chef's Special",
    rating: 4.9,
    reviews: 524,
    weight: "200g",
    heat: "Medium",
    tags: ["Smoked Paprika", "Aged Cheddar", "Rich Umami"],
    nutrition: [
      { label: "Energy", value: "358 kcal" },
      { label: "Protein", value: "10.2 g" },
      { label: "Carbs", value: "72 g" },
      { label: "Fat", value: "1.8 g" },
    ],
    ingredients:
      "Lotus seeds (91%), grass-fed cow ghee, aged white cheddar seasoning, Spanish smoked paprika, sea salt, garlic powder.",
  },
  {
    slug: "tangy-pudina-chaat",
    name: "Tangy Pudina Chaat",
    tagline: "Crisp fox nuts tossed in garden mint, raw mango & black salt",
    description:
      "A vibrant Indian street chaat profile featuring sun-dried garden mint, tangy amchur (dry mango), roasted cumin, and black rock salt.",
    price: 12,
    mrp: 15,
    image: "/img/hero-makhana.jpg",
    badge: "Desi Chaat",
    rating: 4.8,
    reviews: 816,
    weight: "200g",
    heat: "Medium",
    tags: ["Garden Mint", "Tangy Amchur", "Zero Sugar"],
    nutrition: [
      { label: "Energy", value: "345 kcal" },
      { label: "Protein", value: "9.6 g" },
      { label: "Carbs", value: "75 g" },
      { label: "Fat", value: "0.6 g" },
    ],
    ingredients:
      "Lotus seeds (95%), cold-pressed olive oil, sun-dried mint leaves, dry mango powder (amchur), black salt, roasted cumin.",
  },
  {
    slug: "superfood-makhana-trail-mix",
    name: "Makhana Superfood Trail Mix",
    tagline: "Roasted lotus pops with California almonds & cranberries",
    description:
      "An energizing power blend combining slow-roasted lotus seeds with California almonds, pumpkin seeds, tart dried cranberries, and chia.",
    price: 18,
    mrp: 22,
    image: "/img/lifestyle-snack.jpg",
    badge: "Superfood Mix",
    rating: 5.0,
    reviews: 638,
    weight: "250g",
    heat: "None",
    tags: ["Makhana + Nuts", "Omega-3 Rich", "High Fiber"],
    nutrition: [
      { label: "Energy", value: "420 kcal" },
      { label: "Protein", value: "14.5 g" },
      { label: "Carbs", value: "58 g" },
      { label: "Fat", value: "6.8 g" },
    ],
    ingredients:
      "Roasted lotus seeds (45%), roasted California almonds (20%), roasted pumpkin seeds (15%), dried cranberries (15%), chia seeds (5%).",
  },
  {
    slug: "organic-raw-jumbo-seeds",
    name: "Organic Raw Jumbo Makhana",
    tagline: "Direct single-origin Grade 6+ unroasted jumbo lotus seeds",
    description:
      "Handpicked, unroasted jumbo lotus seeds direct from Mithila wetlands. Perfect for home roasting, traditional kheer puddings, and curries.",
    price: 13,
    mrp: 16,
    image: "/img/grading-seeds.jpg",
    badge: "100% Raw & Pure",
    rating: 4.9,
    reviews: 742,
    weight: "400g",
    heat: "None",
    tags: ["Grade 6+ Suta", "Direct from Farms", "Pantry Essential"],
    nutrition: [
      { label: "Energy", value: "332 kcal" },
      { label: "Protein", value: "9.8 g" },
      { label: "Carbs", value: "77 g" },
      { label: "Fat", value: "0.1 g" },
    ],
    ingredients:
      "100% Pure single-origin raw lotus seeds (Euryale ferox). No added oils, salts, or preservatives.",
  },
  {
    slug: "stone-ground-makhana-flour",
    name: "Stone-Ground Makhana Flour",
    tagline: "100% gluten-free lotus seed flour (atta) for rotis & baking",
    description:
      "Stone-ground roasted makhana flour rich in essential minerals and protein. Low glycemic index alternative for diabetic-friendly rotis and gluten-free baking.",
    price: 15,
    mrp: 19,
    image: "/img/hero-platter.jpg",
    badge: "Gluten-Free Flour",
    rating: 4.9,
    reviews: 395,
    weight: "500g",
    heat: "None",
    tags: ["Gluten-Free Flour", "Low Glycemic", "Stone Milled"],
    nutrition: [
      { label: "Energy", value: "340 kcal" },
      { label: "Protein", value: "10.4 g" },
      { label: "Carbs", value: "76 g" },
      { label: "Fat", value: "0.2 g" },
    ],
    ingredients:
      "100% Pure stone-ground roasted lotus seeds (Euryale ferox). Zero wheat, zero preservatives.",
  },
  {
    slug: "dark-chocolate-makhana-crunch",
    name: "Belgian Dark Chocolate Pops",
    tagline: "Slow-roasted lotus pops enrobed in 70% dark chocolate",
    description:
      "Crisp puffed fox nuts generously drenched in 70% dark Belgian cocoa with a hint of Maldon sea salt. A guilt-free dessert indulgence.",
    price: 16,
    mrp: 20,
    image: "/img/farm-harvest.jpg",
    badge: "Artisanal Sweet",
    rating: 4.9,
    reviews: 588,
    weight: "180g",
    heat: "None",
    tags: ["70% Dark Cocoa", "Antioxidant Rich", "Guilt-Free Sweet"],
    nutrition: [
      { label: "Energy", value: "395 kcal" },
      { label: "Protein", value: "8.9 g" },
      { label: "Carbs", value: "64 g" },
      { label: "Fat", value: "5.2 g" },
    ],
    ingredients:
      "Roasted lotus seeds (55%), dark chocolate (cocoa mass, cocoa butter, organic cane sugar, sunflower lecithin) (44%), sea salt.",
  },
];

export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);

/** Store prices are quoted in USD for the international storefront. */
export function formatUSD(n: number): string {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function formatINR(n: number): string {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export const FREE_SHIPPING_OVER = 49;
export const SHIPPING_FEE = 6;
