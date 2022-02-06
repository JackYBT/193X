
/* Text to add to the move here button */
const MOVE_HERE_TEXT = "— Move here —";

/* Function: addColumn Helper function
   Parameter: Takes in a column name input, and adds it to the board, returns the column element
 */
const addColumn = (title) => {
  //copying the template
  let template_column = document.querySelector(".template.column");
  let new_template_column = template_column.cloneNode(true); 

  //removing "template" class & setting new name 
  new_template_column.classList.remove('template');
  new_template_column.querySelector(".columnTitle").textContent = title;

  //adding column to the main board
  let main_board = document.querySelector("#board");
  main_board.append(new_template_column);

  return new_template_column;
}

/* 
Function: addColumnFunction
Usage: Triggered by click on the "add column button", checks title requirements and add columns
 */
const addColumnFunction = (event) => {

  //cleans up the board
  cleanUpSelection();

  //Accessing the user input
  let title_name = document.querySelector("#columnTitle");
  /*Checking if the titles are empty */
  if (title_name.value === ""){
    alert("The title cannot be empty");
    event.preventDefault();
    return;
  }
  //Checking if the titles are unique
  all_titles = document.querySelectorAll(".columnTitle");
  for (let title of all_titles) {
    if (title.textContent === title_name.value) {
      event.preventDefault();
      alert("Name already exists");
      return;
    }
  }
  //calling helper function
  addColumn(title_name.value);
  /* House cleaning, resetting the form and preventing the page from refreshing */
  document.querySelector("#columnForm").reset();
  event.preventDefault(); 
}

/**
 * Function: deleteFunction
 * Usage: Triggered when delete button is hit, and removes the closest card.
 */
const deleteFunction = (event) => {
  //cleans up the board
  cleanUpSelection();

  event.currentTarget.closest(".card").remove();
}
/**
 * Function: addCard
 * Usage: Helper function to add card to the table, when given input of the basic information of the car,
 * and which column to add it to.
 */
const addCard = (title, description, color, column) => {

  //Select the tenplate
  let template_card = document.querySelector(".template.card");
  //Clone 
  let new_card = template_card.cloneNode(true);

  //Adds in basic information to the card
  new_card.querySelector(".title").textContent = title;
  new_card.querySelector(".description").textContent = description;
  new_card.style.backgroundColor= color;
  new_card.classList.remove('template');

  column.append(new_card);

  //need to begin listening to delete & move requests
  let delete_button = new_card.querySelector(".delete");
  delete_button.addEventListener("click", deleteFunction);

  let move_button = new_card.querySelector(".startMove");
  move_button.addEventListener("click", moveFunction);
}

/**
 * Function: adCardFunction
 * Usage: Triggered when "addfunction" is clicked by user. Takes basic informtion
 * of the card from the user and adds such information to the left-most column in th
 * graph. Checks basic requirements of cards.
 */
const addCardFunction = (event) => {
  //cleans up board
  cleanUpSelection();
  //prevents refreshing
  event.preventDefault();

  //Extract information from the survey
  let new_card_name = document.querySelector("#cardForm #cardTitle").value;
  let new_card_description = document.querySelector("#cardForm #cardDescription").value;
  let new_card_color = document.querySelector("#cardForm #cardColor").value;

  /* Checking if there's any column on the board or title is empty */
  if (new_card_name === "") {
    alert("The title cannot be empty");
    return;
  }
  first_column = document.querySelectorAll("#board .column").item(0);
  if (!first_column) {
    alert("No columns exist");
    return;
  }

  //calls helper to add the card with the specified
  addCard(new_card_name, new_card_description, new_card_color, first_column);

  //resetting the forms and prevent refresh
  document.querySelector("#cardForm").reset();
  event.preventDefault();

}


/**
 * Function: importFunction
 * Usage: Takes an input json and recreate it on the webpage. 
 */
const importFunction = (new_board) => {

  //cleans up the board
  cleanUpSelection();

  //Clearing all contents
  let main_board = document.querySelector("#board");
  main_board.textContent = "";

  //looping through all the columns of the JSON object
  for (let key of Object.keys(new_board)){
    //adding Column
    column = addColumn(key);
    //looping through the cards for that column
    for (let card of new_board[key]) {
      title = card.title;
      description = card.description;
      color = card.color;
      //adding card
      addCard(title,description,color,column);
    }
  }
}
/** Function: exportFunction
 * Usage: Scrapes through the entire board, and create a json and exports it. 
 */
const exportFunction = (event) => {
  let result = {};
  //Finding all columns that are already on the board
  let column_list = document.querySelectorAll("#board .column");

  for (let column of column_list){

    //Figuring out the column title
    let column_title = column.querySelector(".columnTitle").textContent;
    result[column_title] = [];

    //Grabbing list of cards under that column
    let card_list = column.querySelectorAll(".card");

    for (let card of card_list){
      card_name = card.querySelector(".title").textContent;
      card_description = card.querySelector(".description").textContent;
      card_color = card.style.backgroundColor;

      attributes = {};
      attributes["title"] = card_name;
      attributes["description"] = card_description;
      attributes["color"] = card_color;

      result[column_title].push(attributes);
    }

  }

  return result;

}

/** Function: moveFunction
 * Usage: Called when the "move" button on one of the cards is clicked, and calls all helper 
 * functions to prepare the card to be moved.
 */
const moveFunction = (event) => {

  //Call the clean up board helper function
  cleanUpSelection();

  //Find the current card that is selected
  let cur_button = event.currentTarget;
  let cur_card = cur_button.closest(".card");

  cur_card.classList.add("selected");
  addMoveHereButton();

}

/** Function: addMoveHereButton
 *  Usage: Adds all possible MoveHere buttons on the board 
 */
const addMoveHereButton = () => {
  let column_list = document.querySelectorAll(".column");
  //Goes through all the cards and appends a button at the end of every button
  for (let column of column_list) {
    
    //Adds single move here button at least for every column
    addSingleMoveHereButton(column);

    let card_list = column.querySelectorAll(".card");

    for (let card of card_list) {
      addSingleMoveHereButton(card);
    }
  }
}

/** Function: addSingleMoveHereButton(element)
 *  Usage: Takes input of an element, and creates a moveHere Button and append 
 * the newly created moveHere button to after the current element. 
 */

const addSingleMoveHereButton = (elem) => {

  //Creating a new button
  let new_button = document.createElement("button");
  new_button.innerHTML = MOVE_HERE_TEXT;
  new_button.classList.add("moveHere");
  new_button.addEventListener("click", moveCardFunction);
  

  if (elem.classList.contains("column")) {
    let firstChild = elem.children[1];
    elem.insertBefore(new_button, firstChild);
    //elem.prepend(new_button);
  }
  else {
    elem.after(new_button);
  }
}

/**Function: moveCardFunction
 * Usage:   When one of the "move here" buttons are actually clicked, move
 *  the "selected" card from original location to this new_buttons location
 */
const moveCardFunction = (event) => {

  //Copy over the node's information
  let selected_node = document.querySelector(".selected");
  let copied_node = selected_node.cloneNode(true);

  let delete_button = copied_node.querySelector(".delete");
  delete_button.addEventListener("click", deleteFunction);

  let move_button = copied_node.querySelector(".startMove");
  move_button.addEventListener("click", moveFunction);



  //Remove the node from the original location
  selected_node.remove();

  //Finds the move_Here button that was clicked
  let selected_move_button = event.currentTarget; 
  //Add the element right after the move_button
  selected_move_button.after(copied_node);
  //Call the cleanUpSelection to clear everything
  cleanUpSelection();

}

/**
 * Function: cleanUpSelection
 * Usage: Unselects already selected card, and remove all the "move here" buttons
 */
const cleanUpSelection = () => {

  console.log("Cleaning up");
  //Goes through all the cards, and removes the selected class of any selected cards already
  card_list = document.querySelectorAll(".card");

  for (let card of card_list) {
    if (card.classList.contains("selected")) {
      card.classList.remove("selected");
    }
  }
  //Deletes all the "move" here buttons

  move_button_list = document.querySelectorAll(".moveHere");
  for (let button of move_button_list) {
    button.remove();
  }
}

//Part 4: 
//1. Add event_listener to the move buttons, go through all the cards, unselect the selected card & remove all the "move here buttons"
//2. Add the selected class to the closest card, 
//3. Iterate through all the columns, & the cards per column to add the "Move Here" card 
//4. Add a listener to every "Move Here", so that if they're clicked on, the original card gets appended to the parent column of that move
//5. Remove the "seleceted" CSS class from the card, iterate through all the columns, find all the "Mover Here" and remove them
//6. If any other functions "add_card" "deletes_card" or import is called, remove all the "move here" buttons & 

const main = () => {

  let button_add_column = document.querySelector("#addColumn");
  button_add_column.addEventListener('click', addColumnFunction);

  let button_add_card = document.querySelector("#addCard");
  button_add_card.addEventListener('click', addCardFunction);

  setupImportExport(importFunction,exportFunction);

};

main();
