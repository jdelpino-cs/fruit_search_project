/**
 *	Fruit Search Project
 *	Unit [11] of Springboard SWE Bootcamp
 *
 *	Solution by José Delpino
 *
 */

//** Global variables */

/** The main data structure is a map with the fruit categories as keys.
 * There are also two arrays: one with the fruit categories and
 * one with the fruits, both ordered alphabetically.
 */
import {
  fruitsArray,
  fruitCategoriesArray,
  categoryFeatures,
  categoriesByFruit,
  // categoriesByFruit,
} from "./fruits.js";

//** DOM elements */

/** @type {HTMLInputElement} */
const input = document.querySelector("#fruit-input");

/** @type {HTMLUListElement} */
const suggestions = document.querySelector(".suggestions");

//** Main program */
initializeApp();

//** Subroutines */

/**
 * This fuctions initializes the app and loads
 * the info saved in local storage in case it is available.
 *
 * @param {paramType} paramName - Description of the parameter.
 * @returns {returnType} Description of the return value.
 */
function initializeApp() {
  loadStettings();
  loadStorage();
  registerEventListeners();
}

/** Main program subroutines */

/** This function registers the event listeners for the app.
 * @returns {undefined}
 */
function registerEventListeners() {
  input.addEventListener("keyup", searchHandler);
  suggestions.addEventListener("click", useSuggestion);
}

/** This function handles the search event.
 * @param {Event} event - The event object.
 * @returns {undefined}
 */
function searchHandler(event) {
  if (event !== undefined) {
    event.preventDefault(); // Prevents the input field default behavior.
  }
  clearSuggestions(); // Clears the suggestions list from the DOM.
  // Gets the input value
  const inputField = document.querySelector("#fruit-input");
  const inputVal = cleanInput(inputField.value);
  // Filters the fruit array using the input value.
  let results = getSearchSuggestions(inputVal);
  // Shows or hides the suggestions list.
  if (inputVal !== "") {
    // Sorts the results by relevance and shows them.
    results = sortResults(results, inputVal);
    showSuggestions(results, inputVal);
    return;
  }
  hideSuggestions();
}

/** This function cleans the input value.
 * @param {string} string - The input value.
 * @returns {string} - The cleaned input value.
 */
function cleanInput(string) {
  // Cleans the input value from most emojis and all trailing spaces.
  let cleanInputVal = string.replace(
    /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
    ""
  );
  cleanInputVal = cleanInputVal.toLowerCase().trim();
  return cleanInputVal;
}

/** This function searches for the string in the fruit array
 * and in the fruit categories array.
 * @param {string} string - The string to search for.
 * @returns {Set.<Array.<string>>} - A set with the results.
 */
function getSearchSuggestions(inputVal) {
  let resultsArray = [];
  console.log("input", inputVal, "resultsArray", resultsArray);

  // Gets fruit suggestions from the fruit array and label them as fruits.
  // Then adds them to the results array.
  const resultsFromFruits = searchFruits(inputVal);
  console.log("input", inputVal, "resultsFromFruits", resultsFromFruits);
  resultsArray.push(...resultsFromFruits);
  console.log("resultsArray", resultsArray);

  // Gets category suggestions from the category array and labels
  // them as categories. Then adds them to the results array.
  const relevantCategories = searchRelevantCategories(
    inputVal,
    resultsFromFruits
  );
  resultsArray.push(...relevantCategories);

  // Gets fruit suggestions from the categories features map
  // and label them as fruits. Then adds them to the results array.
  const relatedFruits = searchRelatedFruits(
    resultsFromFruits,
    relevantCategories
  );
  resultsArray.push(...relatedFruits);

  // Creates the results set and adds the no results message if needed.
  const results = new Set(resultsArray);
  if (resultsArray.length === 0) {
    results.add(["No results available", "no-results-message"]);
  }
  // console.log("relevantCategories", relevantCategories);
  // console.log("resultsFromCategoriesMap", resultsFromCategoriesMap);
  return results;
}

function searchFruits(inputVal) {
  return fruitsArray.reduce((results, fruit) => {
    const fruitName = fruit.toLowerCase();
    if (fruitName.includes(inputVal) || inputVal.includes(fruitName)) {
      results.push([fruit, "fruit-suggestion"]);
    }
    return results;
  }, []);
}

function searchRelevantCategories(inputVal, resultsFromFruits) {
  // console.log("searchRelevantCategories", inputVal, resultsFromFruits);
  const relevantCategories = [];

  // Gets the possible categories are directly searched from the categories array.
  const searchedCategories = fruitCategoriesArray.reduce(
    (searchedCategories, category) => {
      if (category.toLowerCase().includes(inputVal)) {
        searchedCategories.push([category, "category-suggestion"]);
        return searchedCategories;
      }
      return searchedCategories;
    },
    []
  );
  // Adds the searched categories to the relevant categories array.
  relevantCategories.push(...searchedCategories);

  // If the resultsFromFruits array contains only 1 element
  // adds the categories of that fruit to the relevant categories array.
  if (resultsFromFruits.length === 1) {
    const onlyFruit = resultsFromFruits[0][0];
    const categoriesFromFruit = categoriesByFruit
      .get(onlyFruit)
      .map((category) => [category, "category-suggestion"]);
    relevantCategories.push(...categoriesFromFruit);
  }
  return relevantCategories;
}

/** This fuction searches for the related fruits in the categories features map.
 * @param {Array.<Array.<string>>} relevantCategories - The array with
 * @param {Array.<Array.<string>>} resultsFromFruits - The array with
 * the relevant categories and their labels.
 * @returns {Array.<Array.<string>>} - The array with the related fruits and theit labels
 */
function searchRelatedFruits(resultsFromFruits, relevantCategories) {
  // If there are no relevant categories, returns an empty array.
  if (relevantCategories.length === 0) {
    return [];
  }

  // Reduces the relevant categories array to an array with the related fruits.
  const relatedFruits = relevantCategories.reduce(
    (relatedFruits, categoryArray) => {
      // Gets the category name from the category array –[name, label].
      const categoryName = categoryArray[0];

      // Gets the category object from the categories features map.
      const categoryObject = categoryFeatures.get(categoryName);

      // If the category object is undefined returns
      // the related fruits array with no additions.
      if (categoryObject === undefined) {
        return relatedFruits;
      }
      // Gets the fruits array from the category object.
      let fruitsFromCategory = categoryObject.fruits;
      // If the the fruits array is empty, returns the related
      // fruits array with no additions.
      if (categoryObject === undefined || fruitsFromCategory.length === 0) {
        return relatedFruits;
      }

      // Gets the fruit relationship string from the category object
      // to include it in the related fruit name.
      const fruitRelationship = categoryObject.forRelationship;
      // Recuces the fruits array to an array with the related fruits.
      // Only add fruits to the new arrayif it is not the same as
      // the input value. The name of the fruit includes
      // the fruit relationship string. The respective label is also added.
      fruitsFromCategory = fruitsFromCategory.reduce(
        (fruitsFromCategory, fruit) => {
          if (!resultsFromFruits.includes(fruit)) {
            fruitsFromCategory.push([
              fruit + ` (${fruitRelationship})`, // The name and relationship
              "related-fruit", // The label
            ]);
          }
          return fruitsFromCategory;
        },
        []
      );
      relatedFruits.push(...fruitsFromCategory);
      return relatedFruits;
    },
    []
  );
  return relatedFruits;
}

/** This funtion turns the results set into an array and sorte it by relevance.
 * @param {Set.<string>} results - The results to sort.
 * @param {string} inputVal - The value of the input field.
 * @returns {Array.<string>} - The sorted results in the form of an array.
 * @todo Implement this function.
 */
function sortResults(results, inputVal) {
  return results;
}

/** This function shows the suggestions in the suggestions list.
 * @param {Array.<string>} results - The results to show.
 * @param {string} inputVal - The value of the input field.
 * @returns {undefined}
 * @todo Implement this function.
 */
function showSuggestions(results, inputVal) {
  addSuggestionsToDOM(results, inputVal);
  suggestions.classList.remove("visually-hidden");
}

/** This function hides the suggestions list.
 * @returns {undefined}
 */
function hideSuggestions() {
  suggestions.classList.add("visually-hidden");
  clearSuggestions();
}

/** This function adds the suggestions to the DOM.
// FOR NOW IT TAKE A SET BUT IT EVENTUALLY WILL DO IT WITH A SORTED ARRAY
* @param {Array.<string>} results - The results to add.
 * @param {string} inputVal - The value of the input field.
 * @returns {undefined}
 */
function addSuggestionsToDOM(results, inputVal) {
  const suggestionsList = document.createElement("ul");
  results.forEach((result) => {
    const suggestion = document.createElement("li");
    suggestion.textContent = result[0];
    suggestion.classList.add(result[1]);
    suggestionsList.appendChild(suggestion);
  });
  suggestions.appendChild(suggestionsList);
}

/** This function clears the suggestions list.
 * @returns {undefined}
 * @todo Implement this function.
 */
function clearSuggestions() {
  // suggestions.outerHTML = "";
  suggestions.innerHTML = "";
}

/** This function uses the suggestion selected by the user.
 * @param {Event} event - The event object.
 * @returns {undefined}
 * @todo Implement this function.
 */
function useSuggestion(event) {
  const selectedSuggestionElement = event.target;
  const selectedSuggestionClass = event.target.classList;
  // console.log("selectedSuggestion", selectedSuggestionElement);
  // console.log("selectedSuggestionClass", selectedSuggestionClass);
  // console.log("event.target", event.target);
  // console.log("className", selectedSuggestionElement.className);
  if (selectedSuggestionElement === "No results available") {
    // console.log("Results available");
    // console.log("input.value", input.value);
    // console.log("clearSuggestions", "hideSuggestions");
    clearSuggestions();
    hideSuggestions;
    return;
  }
  if (selectedSuggestionClass.contains("fruit")) {
    // console.log("isFruit");
    // console.log("hideSuggestions");
    hideSuggestions();
  } else {
    // console.log("isCategory");
    // console.log("searchHandler");
    searchHandler(undefined);
  }
}

//** Settings subroutines */

/** This function loads the settings from local storage.
 * @returns {undefined}
 * @todo Implement this function.
 */
function loadStettings() {
  // TODO
}

/** This function creates the settings in local storage.
 * @returns {undefined}
 * @todo Implement this function.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 */

//** Local storage subroutines */

/** This function loads the data from local storage.
 * @returns {undefined}
 * @todo Implement this function.
 */
function loadStorage() {
  // TODO
}

/** This function saves the data to local storage.
 * @returns {undefined}
 * @todo Implement this function.
 */
function saveStorage() {
  // TODO
}

/** This function clears the data from local storage.
 * @returns {undefined}
 * @todo Implement this function.
 */
function clearStorage() {
  // TODO
}

/** This function checks if local storage is available.
 * @returns {boolean} - True if local storage is available, false otherwise.
 * @todo Implement this function.
 */
function isStorageAvailable() {
  // TODO
}

/** This function checks if local storage is empty.
 * @returns {boolean} - True if local storage is empty, false otherwise.
 * @todo Implement this function.
 */

function isStorageEmpty() {
  // TODO
}

/** This function checks if local storage is full.
 * @returns {boolean} - True if local storage is full, false otherwise.
 * @todo Implement this function.
 */
function isStorageFull() {
  // TODO
}

/** This function checks if local storage is supported.
 * @returns {boolean} - True if local storage is supported, false otherwise.
 * @todo Implement this function.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
 */
function isStorageSupported() {
  // TODO
}
