import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import routes from "./routes/index.js";

const app: Express = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(helmet());

app.use("/", routes);

export default app;
