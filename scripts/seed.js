// Usage: npm run seed
// Creates the first admin account (from .env) and a few sample products if the shop is empty.
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Product = require("../models/product");
const { PLACEHOLDER_IMAGE } = require("../utils/constants");

const sampleProducts = [
  { name: "Men's Cozy Fleece Hoodie", description: "Soft fleece hoodie with a kangaroo pocket, perfect for cool evenings.", price: 1499, category: "Clothing", stock: 25 },
  { name: "Cotton T-Shirt (Pack of 2)", description: "Breathable 100% cotton plain t-shirts in a regular fit.", price: 699, category: "Clothing", stock: 60 },
  { name: "Women's Summer Denim Shorts", description: "Lightweight stretch denim shorts with a high waist.", price: 999, category: "Clothing", stock: 30 },
  { name: "Flat Leather Sneakers", description: "Everyday leather sneakers with a cushioned insole.", price: 2499, category: "Footwear", stock: 18 },
  { name: "Skateboard Shoes", description: "Durable grip-sole shoes built for skating and street wear.", price: 2799, category: "Footwear", stock: 12 },
  { name: "2-Slot Toaster", description: "Two-slot toaster with 6 browning levels and a removable crumb tray.", price: 1899, category: "Home & Kitchen", stock: 15 },
  { name: "Espresso Maker", description: "15-bar espresso machine with a steam wand for lattes and cappuccinos.", price: 8999, category: "Home & Kitchen", stock: 8 },
  { name: "Smartphone 256GB", description: "6.7-inch display, triple camera system and all-day battery life.", price: 69999, category: "Electronics", stock: 10 },
];

async function seed() {
  if (!process.env.MONGO_URL) throw new Error("MONGO_URL is missing in .env");
  await mongoose.connect(process.env.MONGO_URL);

  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";

  let admin = await User.findOne({ email });
  if (admin) {
    console.log(`Admin already exists: ${email}`);
  } else {
    admin = await User.create({
      name: process.env.ADMIN_NAME || "Admin User",
      email,
      password: await bcrypt.hash(password, 10),
      phoneNo: process.env.ADMIN_PHONE || "9999999999",
      role: "admin",
      address: { street: "1 Main Street", city: "Bareilly", state: "Uttar Pradesh", pincode: "243001", country: "India" },
    });
    console.log(`Admin created -> email: ${email}  password: ${password}`);
  }

  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany(sampleProducts.map((p) => ({ ...p, image: [PLACEHOLDER_IMAGE], createdBy: admin._id })));
    console.log(`Added ${sampleProducts.length} sample products`);
  } else {
    console.log("Products already exist, skipping sample products");
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
