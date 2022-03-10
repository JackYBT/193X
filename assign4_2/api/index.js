import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
//import res from "express/lib/response";
import { MongoClient } from "mongodb";

let DATABASE_NAME = "cs193x_assign4";

let client = null;
let database = null;
let Users = null;
let Posts = null;

/* Do not modify or remove this line. It allows us to change the database for grading */
if (process.env.DATABASE_NAME) DATABASE_NAME = process.env.DATABASE_NAME;

const api = express.Router();

const initAPI = async app => {
  app.set("json spaces", 2);
  app.use("/api", api);

  const uri = "mongodb://localhost";

  client = await MongoClient.connect(uri);
  database = client.db(DATABASE_NAME);
  Users = database.collection("users");
  Posts = database.collection("posts");
  //console.log(Users);
};

api.use(bodyParser.json());
api.use(cors());

api.get("/", (req, res) => {
  res.json({ db: DATABASE_NAME });
});

/**
 * Function: api.get("/users")
 * Usage: Returns a an object with a key "users"
 * mapping to all the users in the database to the client side
 */
api.get("/users", async (req,res) => {
  //find() returns everything
  let users = await Users.find().toArray();
  users = users.map(x => x["id"]);
  
  res.json({users});
  return {users};
});

/**
 * Function: api.use("/users/:id")
 * Usage: Middleware function for all api methods that require searching up the 
 * information of a specific user
 */
api.use("/users/:id", async (req,res,next) => {
  let id = req.params.id;
  console.log("1");
  //id is the format of {"id": "jackyuan"}
  let user = await Users.findOne({ id });

  if (!user) {
    //If user cannot be found, throw a 404 error
    res.status(404).json({error: `No student with ID ${id}`});
    return;
  } 
  res.locals.user = user;
  next();
});

/**
 * Function: api.get("/users/:id")
 * Usage: Bridging off the middleware function, returns the specific information
 * of that user to the client frontend
 */
api.get("/users/:id", async(req, res) => {
  let user_final = res.locals.user;
  delete user_final._id;
  // "..." expands the object array & makes a copy of it 
  res.json(...user_final);
  return {...user_final};
});

/**
 * Function: api.patch("/users/:id")
 * Usage: Bridging off the middleware function, updates the backend user information
 * according to the requested username or avatarLink
 */
api.patch("/users/:id", async(req,res) => {
  let user_final = res.locals.user;
 

  //Updating the name and avatarURL if necessary
  if (req.body.name || req.body.name === "") {
    if (req.body.name === "") {
      user_final.name = user_final.id;
    } else {
      user_final.name = req.body.name;
    }
  } else if (req.body.avatarURL || req.body.avatarURL === "") {
    if (req.body.avatarURL === "") {
      user_final.avatarURL = "images/default.png";
    } else {
      user_final.avatarURL = req.body.avatarURL;
    }
  }
  await Users.updateOne({"_id" : user_final._id}, {$set:{"name": user_final.name, "avatarURL" : user_final.avatarURL}});
  delete user_final._id;
  res.json(user_final);

  return user_final;        
  
});

/**
 * Function: api.post("/users/:id/posts")
 * Usage: Takes the input from the front end, adds the following post
 * under the user in the backend. 
 */

api.post("/users/:id/posts", async(req,res) => {
  let user_final = res.locals.user;
  let userId = user_final.id;
  let time = new Date();
  let post_text = req.body.text;

  if (!post_text || post_text === "") {
    res.status(400).json({error:"The requesting body is misisng a text property or the text is empty"});
    return;
  }

  await Posts.insertOne({userId: userId, time: time, text: post_text});
  res.json({ success: true});
  return {"success": true};
});

/**
 * Function: api.post("/users")
 * Usage: Takes an input from the front end client to create a new user in the 
 * backend database. 
 */
api.post("/users", async(req,res) => {
  let id = req.body.id;
  if (!id) {
    res.status(400).json({error: `Request body missing an id property, or id missing`});
    return;
  } 
  let user = await Users.findOne({ id });
  if (user){
    res.status(400).json({error: `id: ${id} already exists`});
    return;
  }
  await Users.insertOne({id: id, name: id, avatarURL: "images/default.png", following: []});
  
  let user_final = await Users.findOne({ id });
  delete user_final._id;
  res.json(user_final);
  return user_final;
});

/**
 * Function: api.get("/users/:id/feed")
 * Usage: Takes the specific user request from the front end, displays the 
 * feed of all the posts of the user, including their own posts as well as the posts
 * of people they follow. 
 */
api.get("/users/:id/feed", async(req,res) => {
  let user_final = res.locals.user;
  let user_following = user_final.following;
  user_following.push(user_final.id);

  //let post_list = await Posts.find(); 
  //console.log(post_list);
  let feed = await Posts.find({userId:{$in: user_following}}).toArray();
  //feed.delete("_id");
  //console.log(feed);

  feed = feed.sort(compareFn);
  let final_result = new Object();
  final_result.posts = [];
  for (var i = 0; i < feed.length; i++) {
    delete feed[i]["_id"];
    let user_final_name = feed[i]["userId"];
    console.log("user_final_name");
    console.log(user_final_name);
    let user = await Users.findOne({"id":user_final_name});
    delete user["following"];
    delete user["_id"];

    //console.log(user);
    delete feed[i]["userId"];
    let final = {user,...feed[i]};
    final_result.posts.push(final);
  }
  res.json(final_result);
  return final_result;
});

/** Function: compareFn
 * Usage: Comparison function used to sort the posts of the user's feed
 * in chronological order, from the most recent to the least recent.
 */
function compareFn (a,b) {
  if (a.time.getTime() > b.time.getTime()) {
    return -1;
  } else {
    return 1;
  }
};

/**
 * Function: api.post("/users/:id/follow")
 * Usage: Takes in the target user from the front end, 
 * updates the following list of the user to include the target user in the backend
 */
api.post("/users/:id/follow", async(req,res) => {
  let user_final = res.locals.user;


  let target_user_name = req.query.target;
  console.log(target_user_name);

  if (!target_user_name || target_user_name === "") {
    res.status(400).json({error: `The target is empty or missing`});
    return;
  }; 

  let target_user = await Users.findOne({ "id": target_user_name });
  console.log(target_user);

  if (!target_user) {
    res.status(404).json({error: `The target user does not exist`});
    return;
  };

  if (user_final.following.includes(target_user_name)) {
    res.status(400).json({error:"The user is already following the target"});
    return;
  }

  if (target_user_name === user_final.id) {
    res.status(400).json({error: "The requesting user is the same as target"});
    return;
  }

  let following_list = user_final.following;
  following_list.push(target_user_name);

  await Users.updateOne({"_id" : user_final._id}, {$set:{"following" : following_list}});
  delete user_final._id;
  //res.json(user_final);
  res.json({"success": true});
  return {"success": true};
});

/**
 * Function: api.delete("/users/:id/follow")
 * Usage: Takes the input target user, and remove the target
 * from the user's following list
 */
api.delete("/users/:id/follow", async(req,res) => {
  let user_final = res.locals.user;
  let target_user_name = req.query.target;

  if (!target_user_name || target_user_name === "") {
    res.status(400).json({error: `The target is empty or missing`});
    return;
  };
  
  if (!user_final.following.includes(target_user_name)) {
    res.status(400).json({error:"The target user isn't being followed by the requesting user"});
    return;
  };

  let following_list = user_final.following;
  let index = following_list.indexOf(target_user_name);
  //removing one element at the specific index
  following_list.splice(index,1);
  await Users.updateOne({"_id" : user_final._id}, {$set:{"following" : following_list}});
  delete user_final._id;
  //res.json(user_final);
  res.json({"success": true});
  return {"success": true};
});

/* Catch-all route to return a JSON error if endpoint not defined */
api.all("/*", (req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.url}` });
});


export default initAPI;
