import express from "express";
import d from 'debug';

const app = express();
const debug = d('app');

app.use((req,res,next)=>{
    debug("(Time:)",new Date().toLocaleString(), "(Method:)",req.method, "(URL:)",req.originalUrl, "(IP:)",req.ip);
    next();
  });