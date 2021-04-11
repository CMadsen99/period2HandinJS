import express from "express";
import dotenv from "dotenv";
import path from "path";
import {Request, Response, NextFunction} from "express";
import cors from "cors";
import d from 'debug';
import {ApiError} from "./errors/errors";
import logger, { stream } from "./middleware/logger";
import friendRoutes from "./routes/friendRoutesAuth";

dotenv.config()
const app = express();
app.use(express.json());

//const debug = d('app');

const morganFormat = process.env.NODE_ENV == "production" ? "combined" : "dev"
app.use(require("morgan")(morganFormat, { stream }));
app.set("logger", logger);

app.use(express.static(path.join(process.cwd(), "public")));

app.use(cors());

app.get("/demo", (req, res) => {
  res.send("Server is up");
});

app.use("/api/friends", friendRoutes);

app.use("/api", (req,res,next) => {
  res.status(404).json({errorCode: 404, msg: "Not found"});  
});

app.use((err:any, req:Request, res:Response, next:NextFunction) => {
  if(err instanceof (ApiError)) {  
    res.status(err.errorCode).json({errorCode: err.errorCode, msg: err.message});        
  } else {
    next(err);
  }
});

export default app;

