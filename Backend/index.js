import express from "express";
import cors from "cors";
import route1 from "./API/Routes/capture.js";
import dbConnect from "./Connection.js";
import dotenv from 'dotenv';

dotenv.config();
const url = process.env.MONGODB_URI;
const PORT = 3000;
const app = express();
app.use(cors());
// instances of routes from different files
app.use("/capture", route1);

app.listen(PORT, async () => {
  try {
    await dbConnect(url);
    console.log('node version', process.version);
    console.log(`Port: ${PORT}`);
  } catch (err) {
    console.log(err);
  }
});