import mongoose from "mongoose";

export const CLOUD_MONGODB_URI =
  "mongodb+srv://hakimaitabderrahim18_db_user:EGoghmmqLaOL0OHm@cluster0.xppqnzk.mongodb.net/fouadstore?retryWrites=true&w=majority&appName=Cluster0";

export function getMongoUri(): string {
  const envUri = process.env.MONGODB_URI?.trim();

  // If not set, or contains placeholder text (xxxxxxx, <password>, etc.), use the verified Atlas URI
  if (!envUri || envUri.includes("xxxxxxx") || envUri.includes("<password>")) {
    return CLOUD_MONGODB_URI;
  }

  // If running in production or on Render, never try 127.0.0.1 or localhost (causes ECONNREFUSED)
  if (
    (process.env.NODE_ENV === "production" || process.env.RENDER) &&
    (envUri.includes("127.0.0.1") || envUri.includes("localhost"))
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
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
