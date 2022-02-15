// Version 1.0.0

// @ts-check
// NOTE: FUNCTIONS IN ALPHABETICAL ORDER

/**
 * Add classname to an element
 * @param {HTMLElement} elem Element reference
 * @param {string} className class to be added to element
 */
function addClass(elem, className) {
  elem.className += " " + (className || "nothingAtAll");
}

/**
 * Eliminate duplicate elements in an array
 * @param {any[]} arr array to be singulized
 * @returns singulized array
 */
function arraySingulizer(arr){
  let currentelement, diff, prevLen;
  let elementCounter = arr.length;

  while (elementCounter !== 0) {
    currentelement = arr[0];
    prevLen=arr.length;

    arr = arr.filter(element => element !== currentelement);
    arr.push(currentelement);
    diff = prevLen - arr.length;
    elementCounter = (elementCounter - diff) - 1;
  }
  return arr;

}

/**
 *
 * @param {HTMLElement|string} element can be an HTMLElement reference or the id of the element
 */
function callAttention(element) {
  if (!element) console.error("No valid element to call attention to");

  if (element instanceof HTMLElement) {
    process(element)
  } else if (typeof element == "string") {
    process(document.getElementById(element))
  } else {
    console.error("No valid element to call attention to");
  }

  /**
   * 
   * @param {HTMLElement} elementRef 
   */
  function process(elementRef){
    elementRef.className += " attention";
    elementRef.focus();
    setTimeout(function () {
      elementRef.className = elementRef.className.replace(" attention", "");
    }, 4000);
  }
}

/**
 * Use to determine the index of an object in the `array` that the value of the provided `property`
 * is equal to the `searchTerm`
 * @param {[]} array The object array to be searched
 * @param {string} property The object property to be searched
 * @param {any} searchTerm The value to be looked for
 * @returns {number} The index of the object in the `array`.
 */
function indexOfObject(array, property, searchTerm){
  for(var i=0,len=array.length;i<len;i++){
    if(array[i][property]===searchTerm)return i;
  }
  return -1;
}

/**
 * Remove a classname from an element
 * @param {HTMLElement} elem Element reference
 * @param {string} className class to be removed from element
 */
function removeClass(elem, className) {
  elem.className = elem.className.replace(
    " " + (className || "nothingAtAll"),
    ""
  );
}

/**
 * 
 * @param {string} snackMsg message to show in snack
 * @param {string} extra extra message to add to snack
 */
function snack(snackMsg, extra) {
  // Get the snackbar DIV
  var snackElem = document.getElementById("snackbar");

  if (extra) {
    snackMsg = snackMsg.replace("++snackExtra++",extra)
  }
  // Add the snack message
  snackElem.innerHTML = snackMsg;

  // Add the "show" class to DIV
  snackElem.className += " show";
  // After 3 seconds, remove the show class from DIV
  setTimeout(function () {
    snackElem.className = snackElem.className.replace(" show", "");
  }, 3000);
}



/**
 * TODO: type-checking functions
 */
"use strict";var snackBarMsgObj={testToast:"💌 Toast successful with sample text of : <b>++snackExtra++</b>",shoutName:"😎 Muizz!!!!!"};function showMessage(){document.getElementById("message-modal").classList.toggle("show")}function hideMessage(){document.getElementById("message-modal").classList.toggle("show")}