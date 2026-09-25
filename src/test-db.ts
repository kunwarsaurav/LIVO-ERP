import "dotenv/config";
import mongoose from "mongoose";

async function test() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log("URI:", uri ? "Exists" : "Missing");
    if (!uri) throw new Error("No MONGODB_URI");

    await mongoose.connect(uri);
    console.log("Connected to MongoDB!");

    const db = mongoose.connection.db;
    const products = await db!.collection("products").find({}).limit(5).toArray();
    console.log("Found products:", products.length);
    console.log(JSON.stringify(products[0], null, 2));

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

test();
