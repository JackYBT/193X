import bodyParser from "body-parser";
import cors from "cors";
import express from "express";

const api = express.Router();

const initApi = async app => {
  app.set("json spaces", 2);
  app.use("/api", api);
};

api.use(bodyParser.json());
api.use(cors());

api.get("/", (req, res) => {
  res.json({ message: "Hello, world!" });
});

export default initApi;
