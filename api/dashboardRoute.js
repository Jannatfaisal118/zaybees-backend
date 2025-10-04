import express from "express";
import { getDashboardKPIs, getSalesData, getOrdersByCountry } from "../controllers/dashboardController.js";

const dashboardRouter= express.Router();

// GET /api/dashboard/kpis
dashboardRouter.get("/kpis", getDashboardKPIs);

// GET /api/dashboard/sales
dashboardRouter.get("/sales", getSalesData);

// GET /api/dashboard/orders-by-country
dashboardRouter.get("/orders-by-country", getOrdersByCountry);

export default dashboardRouter;
