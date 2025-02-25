import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import userRoutes from "./routes/userRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";

const app = express();

app.use(cors({
  origin: "*",
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true
}));

app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(200).end();
});

app.use(express.json());

app.use("/users", userRoutes);
app.use("/customers", customerRoutes);

export default app;  // ✅ Add this line for Jest tests
export const handler = serverless(app);  // ✅ Keep this for deployment
