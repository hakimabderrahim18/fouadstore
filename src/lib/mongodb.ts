import mongoose from "mongoose";

export const CLOUD_MONGODB_URI =
  "mongodb+srv://hakimaitabderrahim18_db_user:EGoghmmqLaOL0OHm@cluster0.xppqnzk.mongodb.net/fouadstore?retryWrites=true&w=majority&appName=Cluster0";

export function getMongoUri(): string {
  const envUri = process.env.MONGODB_URI?.trim();

  // If not set, or contains placeholder text, or points to localhost/127.0.0.1, always use the verified Atlas URI
  if (
    !envUri ||
    envUri === "undefined" ||
    envUri === "null" ||
    envUri.includes("xxxxxxx") ||
    envUri.includes("<password>") ||
    envUri.includes("127.0.0.1") ||
    envUri.includes("localhost")
  ) {
    return CLOUD_MONGODB_URI;
  }

  return envUri;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (cached.conn && cached.conn.connection.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  const uri = getMongoUri();

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 15000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      const host = mongooseInstance.connection.host || "MongoDB Atlas";
      console.log(`[MongoDB] Connected successfully to host: ${host}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("[MongoDB] Connection error:", e);
    throw e;
  }

  return cached.conn;
}
