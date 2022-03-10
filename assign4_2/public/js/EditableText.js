
/* A DOM component that displays text and allows the user to edit it, turning into an input.
   The current text value is exposed through .value, and it can be set directly with .setValue(). */

/** Class: EditableText
 *  Usage: Creates an instance of a div that contains text, of which the user can edit & change on the website.
 */
export default class EditableText {
  /* id is the name and id for the input element, needed to associate a label with it. */
  constructor(id) {
    this.id = id;
    this.value = "";

    //instance variables
    this.state = null;
    this.container = null;
    //Binding event handlers
    this._onChange = null;
    this._createDisplay = this._createDisplay.bind(this);
    this._createInput = this._createInput.bind(this);
    this._createImageButton = this._createImageButton.bind(this);
    this.onSwitch = this.onSwitch.bind(this);
  }

  /* Add the component (in display state) to the DOM tree under parent. When the value changes, onChange is called
     with a reference to this object as argument. */
  addToDOM(parent, onChange) {
    //Need to recreate a new container and replace the old container
    let new_container = this._createDisplay();
    this.state = "display";
    this.container = new_container;
    //Adding a copy of this.container to the DOM tree 
    parent.append(this.container);
    //Taking the function passed in externally and save it as a variable in the "this" instance 
    this._onChange = onChange;
  }

  /* Set the value of the component and switch to display state if necessary. Does not call onChange. */
  setValue(value) {
    //modifying the state and value of the instance
    this.value = value;
    this.state = "display";

    //Need to recreate a new container and replace the old container
    let new_container = this._createDisplay();
    this.container.replaceWith(new_container);
    this.container = new_container;
  }

  /* Create and return a DOM element representing this component in display state. */
  _createDisplay() {
    let container = document.createElement("div");
    container.classList.add("editableText");

    let text = document.createElement("span");
    text.textContent = this.value;
    container.append(text);

    let button = this._createImageButton("edit");
    button.type = "button";
    container.append(button);

    //Add event listener for edit button
    button.addEventListener("click", this.onSwitch);
    return container;
  }

  /* Create and return a DOM element representing this component in input state. */
  _createInput() {
    let form = document.createElement("form");
    form.classList.add("editableText");

    let input = document.createElement("input");
    input.type = "text";
    input.name = this.id;
    input.id = this.id;
    input.value = this.value;
    form.append(input);

    let button = this._createImageButton("save");
    button.type = "submit";
    form.append(button);

    //Add event listener for form submit
    button.addEventListener("click", this.onSwitch);

    return form;
  }

  /* Helper to create a button containi ng an image. name is the name of the image, without directory or extension. */
  _createImageButton(name) {
    let button = document.createElement("button");
    let img = document.createElement("img");
    img.src = `images/${name}.svg`;
    img.alt = name;
    button.append(img);
    return button;
  }



  //Define event handlers
  /**
   * Function: onSwitch()
   * Usage: Called on a specific instance of the class Editable Text, to change the state of the usage, and to
   * update the state of the new_container in the DOM and the this instance. 
   */
  onSwitch(event) {
    event.preventDefault();
    if (this.state === "input") {
      this.state = "display"; 
      //accessing the value of the input, before publishing a new div. Using queryselector 
      this.value = this.container[this.id].value;
      //this.value = this.container.querySelector(rand_text.concat(text_id)).value;

      //replacing the original div
      let new_container = this._createDisplay();
      this.container.replaceWith(new_container);
      this.container = new_container;
      //Use the earlier function to broadcast you have made the relevant changes
      this._onChange(this);
    } else {
      this.state = "input";

      //replacing the original div
      let new_container = this._createInput();
      this.container.replaceWith(new_container);
      this.container = new_container;
      //focusing on the specific keyboard input
      this.container.focus();
    }

  }

}
