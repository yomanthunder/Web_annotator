import express from "express";
import cors from "cors";

const routes = express.Router();
routes.use(cors());
routes.use(express.json());
routes.use(express.urlencoded({ extended: true }));

export default routes;