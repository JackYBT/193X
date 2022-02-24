//import { json } from "express/lib/response";
import apiRequest from "./api.js";

/* A small class to represent a Post */
export class Post {
  /* data is the post data from the API. */
  constructor(data) {
    this.user = new User(data.user);
    this.time = new Date(data.time);
    this.text = data.text;
  }
}

/* A data model representing a user of the app. */
export default class User {
  /* Returns an array of user IDs */
  static async listUsers() {
    let data = await apiRequest("GET", "/users");
    return data.users;
  }
  
  /* Returns a User object, creating the user if necessary. */
  static async loadOrCreate(id) {
    //Gets all users and check if the user exists already
    let listOfUsers = await this.listUsers();
    //if not, post the user
    if (!listOfUsers.includes(id)) {
      await apiRequest("POST", "/users", {"id": id});
    }
    
    let data = await apiRequest("GET", "/users/" + id); 
    return new User(data);
  }

  /** Function: Constructor
   * Usage://Copies over all the JSON "id:key" pairs over to this 
   */
  constructor(data) {
    //For example, this.id would be assigned to what's returned by the JSON object
    Object.assign(this,data);
  }

  /* Returns an Object containing only the public instances variables (i.e. the ones sent to the API). */
  toJSON() {
    return {
      'id': this.id,
      'name': this.name,
      'avatarURL': this.avatarURL
    };
  }

  /* Save the current state (name and avatar URL) of the user to the server. */
  async save() {
    //Query this instance of the User to figure out how to update to the backend of the server
    let data = this.toJSON();
    let new_state = await apiRequest("PATCH", `/users/${this.id}`, data); 
  }

  /* Returns an Array of Post objects. Includes the user's own posts as well as those of users they are following. */
  async getFeed() {
    let result = await apiRequest("GET", `/users/${this.id}/feed`);
    let posts = result.posts;
    let arr = [];
    for (let post of posts) {
      arr.push(new Post(post));
    } 
    return arr;
  }

  /* Create a new post with hte given text. */
  async makePost(text) {
    let result = await apiRequest("POST", `/users/${this.id}/posts`, {'text':text});
  }

  /* Start following the specified user id. Throws an HTTPError if the specified user ID does not exist. */
  async addFollow(id) {
    let result = await apiRequest("POST", `/users/${this.id}/follow?target=${id}`);
  }

  /* Stop following the specified user id. Throws an HTTPError if the user isn't following them. */
  async deleteFollow(id) {
    let result = await apiRequest("DELETE", `/users/${this.id}/follow?target=${id}`);
  }
}
