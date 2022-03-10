import User, { Post } from "./User.js";
import EditableText from "./EditableText.js";
import DynamicList from "./DynamicList.js";
class App {
  constructor() {
    this._user = null;
    this._loginForm = null;
    this._postForm = null;
    this._onListUsers = this._onListUsers.bind(this);
    this._onLogin = this._onLogin.bind(this);

    this._loadProfile = this._loadProfile.bind(this);
    this._namecontainer = null;
    this._avatarurlcontainer = null;
    this._followingList = null;
    this._namesave = this._namesave.bind(this);
    this._avatarsave = this._avatarsave.bind(this);
    this._followeradd = this._followeradd.bind(this);
    this._followerdelete = this._followerdelete.bind(this);
    this._onListUsers = this._onListUsers.bind(this);
    this._postUpdate = this._postUpdate.bind(this);
  }

  setup() {
    //Finds the Form, which includes the User ID and the Login <div> and the List Users <div>
    this._loginForm = document.querySelector("#loginForm");
    //Once i click the Login <div>, which has a button with the type <submit>, this._onLogin is called
    this._loginForm.addEventListener("submit", this._onLogin);
    // _loginForm has a button called listUsers, equivalent to .queryselector
    this._loginForm.listUsers.addEventListener("click", this._onListUsers);
    this._postForm = document.querySelector("#postForm");
    this._postForm.querySelector("#postButton").addEventListener("click", this._postUpdate);
    //TODO: Complete the setup of remaining components
    this._namecontainer = new EditableText("name");
    this._avatarURLcontainer = new EditableText("avatarURL");
    this._followingList = new DynamicList("following","");
    this._namecontainer.addToDOM(document.querySelector("#nameContainer"), this._namesave);
    this._avatarURLcontainer.addToDOM(document.querySelector("#avatarContainer"), this._avatarsave);
    this._followingList.addToDOM(document.querySelector("#followContainer"), this._followeradd, this._followerdelete);
    

  }

  _displayPost(post) {
    /* Make sure we receive a Post object. */
    if (!(post instanceof Post)) throw new Error("displayPost wasn't passed a Post object");

    let elem = document.querySelector("#templatePost").cloneNode(true);
    elem.id = "";

    let avatar = elem.querySelector(".avatar");
    avatar.src = post.user.avatarURL;
    avatar.alt = `${post.user.name}'s avatar`;

    elem.querySelector(".name").textContent = post.user.name;
    elem.querySelector(".userid").textContent = post.user.id;
    elem.querySelector(".time").textContent = post.time.toLocaleString();
    elem.querySelector(".text").textContent = post.text;

    document.querySelector("#feed").append(elem);
  }

  /**Function: _loadProfile()
   * Usage: Used to update the frontend of the page wuith the updated avatarURL, name, userID
   * All pulled from the instance User, which has recently updated with the backend.
   * 
   */

  async _loadProfile() {
    document.querySelector("#welcome").classList.add("hidden");
    document.querySelector("#main").classList.remove("hidden");
    document.querySelector("#idContainer").textContent = this._user.id;
    /* Reset the feed */
    document.querySelector("#feed").textContent = "";

    /* Update the avatar, name, and user ID in the new post form */
    this._postForm.querySelector(".avatar").src = this._user.avatarURL;
    this._postForm.querySelector(".name").textContent = this._user.name;
    this._postForm.querySelector(".userid").textContent = this._user.id;

    //
    // Big Picture: Find the "Display Name" and attach a DOM
    
    //Grabbing the new values from the instance and updating the sidebar
    this._namecontainer.setValue(this._user.name);
    this._avatarURLcontainer.setValue(this._user.avatarURL);
    this._followingList.setList(this._user.following);

    //Displaying all posts
    let posts = await this._user.getFeed();
    for (let post of posts) {
      this._displayPost(post);
    }
  }

  /*** Event Handlers ***/


  /**
   * Function: _onListUsers()
   * Usage: Grab all list of users and display them in the front end 
   */
  async _onListUsers() {
    let users = await User.listUsers();
    let users_final = users.join("\n");
    alert(`List of users:\n ${users_final}`);
  }

  /**
   * Function: _followeradd(id)
   * Usage: Takes the id that the this User instance wants to follow, and update it 
   * on this User's instance following list, then updates the backend as well
   */
  async _followeradd(id) {
    this._user.addFollow(id);
    this._user = await User.loadOrCreate(this._user.id);
    this._loadProfile();
  }
 /**
   * Function: _followerdelete(id)
   * Usage: Takes the id that the this User instance wants to unfollow, and update it 
   * on this User's instance following list, then updates the backend as well
   */
  async _followerdelete(id) {
    this._user.deleteFollow(id);
    this._user = await User.loadOrCreate(this._user.id);
    this._loadProfile();
  }

  /**
   * Function: _postUpdate(event)
   * Usage: An eventhandler onCall function, that when a click is posted, grabs the 
   * value oft he new post, make a new Post, update it to the backend, then refreshes
   */

  async _postUpdate(event) {
    event.preventDefault();
    let postContent = this._postForm.querySelector("#newPost").value;
    this._user.makePost(postContent);
    this._postForm.reset();
    this._user = await User.loadOrCreate(this._user.id);
    this._loadProfile();
  }

  /**
   * Function: _namesave()
   * Usage: Event Handler that's called when the user clicks on the "edit" button of the 
   * display name (from Editable Text). Saves the new_edited name to the backend, and refreshes the frontend
   */

  async _namesave() {
    this._user.name = this._namecontainer.value;
    this._user.save();
    this._loadProfile();
  }
/**
   * Function: _avatarsave()
   * Usage: Event Handler that's called when the user clicks on the "edit" button of the 
   * display avatarURL(from Editable Text). Saves the new_edited avatarURL to the backend, and refreshes the frontend
   */
  async _avatarsave() {
    this._user.avatarURL = this._avatarURLcontainer.value;
    this._user.save();
    this._loadProfile();
  }

  /**
   * Function: _onLogin(evnet)
   * Usage: eventhandler when the login button is clicked. Grabs the frontend userid
   * Then updates the User instance with the login User. 
   */

  async _onLogin(event) {
    event.preventDefault();
    let user_id = document.querySelector("#loginForm").userid.value;
    this._user = await User.loadOrCreate(user_id);
  
    //launch the sidebar with the user's information
    this._loadProfile();
  }
  
}

let app = new App();
app.setup();
