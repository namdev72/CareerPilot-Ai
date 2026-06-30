import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));

//////routes import
import authRouter from "./routes/auth.routes.js";
import interviewRouter from "./routes/interview.routes.js";


//#usinng all routes here
app.use("/api/auth",authRouter)
app.use("/api/interview",interviewRouter)


export default app