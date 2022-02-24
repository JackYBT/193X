import bodyParser from "body-parser";
import express from "express";

const api = express.Router();

const initAPI = app => {
  app.set("json spaces", 2);
  app.use("/api", api);
};

api.use(bodyParser.json());

api.get("/", (req, res) => {
  res.json({ db: "local_api", numUsers: 1, numPosts: 1 });
});

api.get("/users", (req, res) => {
  res.json({ users: ["mchang"] });
});

api.get("/users/mchang", (req, res) => {
  res.json({
    id: "mchang",
    name: "Michael",
    avatarURL: "images/stanford.png",
    following: []
  });
});

api.get("/users/mchang/feed", (req, res) => {
  res.json({
    posts: [{
      user: {
        id: "mchang",
        name: "Michael",
        avatarURL: "images/stanford.png"
      },
      time: new Date(),
      text: "Welcome to the Generic Social Media App!"
    }]
  });
});

/* This is a catch-all route that logs any requests that weren't handled above.
   Useful for seeing whether other requests are coming through correctly */
api.all("/*", (req, res) => {
  let data = {
    method: req.method,
    path: req.url,
    query: req.query,
    body: req.body
  };
  console.log(data);
  res.status(500).json({ error: "Not implemented" });
});

export default initAPI;
