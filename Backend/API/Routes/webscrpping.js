import express from "express";
import cors from "cors";
import {Worker, isMainThread,parentPort,workerData} from "node:worker_threads";


const routes = express.Router();
routes.use(cors());
routes.use(express.json());
routes.use(express.urlencoded({ extended: true }));


export default routes;