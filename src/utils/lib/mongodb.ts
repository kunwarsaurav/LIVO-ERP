import mongoose from "mongoose";
// import "@/app/api/auth/auth.model";
// import "@/app/api/projects/project.model";
// import "@/app/api/products/product.model";
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error("Please provide MONGO_URI in .env file");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache =
  global.mongooseCache ??
  (global.mongooseCache = { conn: null, promise: null });

export default async function MongoDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI!, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log("mongoDB is connected");
        return mongooseInstance;
      });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.log("mongodb connection failed: ");
    throw err;
  }
  return cached.conn;
}
