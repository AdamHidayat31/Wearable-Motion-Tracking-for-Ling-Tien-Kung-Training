import express from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./routes/index.js";

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routing
app.use("/api", router);

export default app;
