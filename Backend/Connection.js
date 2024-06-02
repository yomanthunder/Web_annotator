import { MongoClient } from "mongodb";

let db;

const dbConnect = async (url) => {
  try {
    if (db) {
      return db;
    }
    console.log("Connecting to MongoDB...");
    console.log('MongoDB URI:', url); // Add this line to debug
    const client = new MongoClient(url);
    await client.connect();
    console.log("Connected to db");
    db = client;
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    throw error;
  }
};

export default dbConnect;