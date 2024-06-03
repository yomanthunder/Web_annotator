import express from "express";
import cors from "cors";
import puppeteer from 'puppeteer';
import {dbConnect} from "../../Connection.js";
import { Screenshot } from "../Modal/capture,js";  


const route1 = express.Router();
route1.use(cors());
route1.use(express.json());
route1.use(express.urlencoded({ extended: true }));

route1.post("/capture", async (req, res) => {
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    const { selection, device } = req.body;
    // viewport changes from device to device
    let viewport = {
        width: device.width,
        height: device.height,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: false
    }
    // some template code peppetter
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport(viewport); // Set viewport size based on device type
    await page.goto(fullUrl); // Adjust URL as needed
    const buffer = await page.screenshot({
        clip: {
          x: selection.x,
          y: selection.y,
          width: selection.width,
          height: selection.height,
        },
      });
    
      await browser.close();
      
      try {
        const db = await dbConnect(process.env.MONGODB_URI); // Get the database instance
        const collection = db.collection("screenshots"); // Access the "screenshots" collection

        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
        const formattedTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
        const dateTime = `${formattedDate} ${formattedTime}`;
    
        // Save the screenshot to the database using the schema
        await collection.insertOne({ screenshot: buffer, dateTime });
        res.send("Screenshot saved to database.");
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to save screenshot to database.");
      }
 
})

export default route1;