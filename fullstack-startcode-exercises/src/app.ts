import express from "express";
import dotenv from "dotenv";
import path from "path";
import friendRoutes from "./routes/FriendRoutes";
dotenv.config()
const app = express();

app.use(express.json());

app.use(express.static(path.join(process.cwd(), "public")));

// Something has to go in here
app.use("/api/friends", friendRoutes)

app.get("/demo", (req, res) => {
  res.send("Server is really up");
});

export default app;

