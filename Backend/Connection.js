import { MongoClient } from "mongodb";
import { Socket } from "socket.io";

let db;

const dbConnect = async (uri) => {
  try {
    if (db) {
      return db;
    }
    console.log("Connecting to MongoDB...");
    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to db");
    db = client;
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    throw error;
  }
};

// function for connecting a new socket
 const connectSocket = (socket) => {
  socket.on("disconnect", () => {
    console.log("disconnected");
  });
}

export default { dbConnect, connectSocket };