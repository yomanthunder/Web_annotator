import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { dbConnect, connectSocket } from "./dbclient";
const url = process.env.MONGODB_URI;
const PORT = 3000;
const app = express();
app.use(cors());


app.listen(PORT, dbConnect(url), () => {
  console.log(`Server is running on port ${PORT}`);
});