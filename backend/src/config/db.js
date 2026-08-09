import mongoose from "mongoose";

export async function connectToDatabase(mongoUri) {
  mongoose.set("strictQuery", true);
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(mongoUri, { autoIndex: true });
}
