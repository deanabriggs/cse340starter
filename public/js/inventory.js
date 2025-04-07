"use strict";

// Get the list of items in inventory based on the classification_id
let classificationList = document.querySelector("#classificationList");
classificationList.addEventListener("change", function () {
  let classification_id = classificationList.value;
  console.log(`classification_id is: ${classification_id}`);

  // Clear the inventory display if "Choose a Classification" is selected
  if (classification_id === "") {
    let inventoryDisplay = document.getElementById("inventoryDisplay");
    inventoryDisplay.innerHTML = "";
    return;
  }

  let classIdURL = "/inv/getInventory/" + classification_id;
  fetch(classIdURL)
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      throw Error("Network response was not OK");
    })
    .then(function (data) {
      console.log(data);
      buildInventoryList(data);
    })
    .catch(function (error) {
      console.log("There was a problem: ", error.message);
    });
});

// Build inventory items into HTML table components and inject into DOM
function buildInventoryList(data) {
  let inventoryDisplay = document.getElementById("inventoryDisplay");
  // Set up the table labels
  let dataTable = "<thead>";
  dataTable += "<tr>";
  dataTable += "<th>Vehicle Name</th>";
  dataTable += "<th>Actions</th>";
  dataTable += "</tr>";
  dataTable += "</thead>";
  // Set up the table body
  dataTable += "<tbody>";
  // Iterate over all vehicles in the array and put each in a row
  data.forEach(function (element) {
    console.log(element.inv_id + ", " + element.inv_model);
    dataTable += "<tr>";
    dataTable += `<td>${element.inv_make} ${element.inv_model}</td>`;
    dataTable += "<td class='action-buttons'>";
    dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`;
    dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td>`;
    dataTable += "</td>";
    dataTable += "</tr>";
  });
  dataTable += "</tbody>";
  // Display the contents in the Inventory Management view
  inventoryDisplay.innerHTML = dataTable;
}

// Could be built in public/js/inventory.js and reference a DOM element,
// it doesn't need to dynamically update on user interaction,
// so it can be built directly into the function to populate the "editClassifications" section
// this should be done in the utilities/index.js file
/*
// Build classification items into HTML table components
function buildClassificationTable(data) {
  let classificationDisplay = document.getElementById("classificationDisplay");
  // Set up the table labels
  let dataTable = "<thead>";
  dataTable += "<tr><th>Classification</th><td>&nbsp;</td><td>&nbsp;</td></tr>";
  dataTable += "</thead>";
  // Set up the table body
  dataTable += "<tbody>";
  // Iterate over all classifications in the array and put each in a row
  data.forEach(function (element) {
    console.log(element.classification_id + ", " + element.classifcationName);
    dataTable += `<tr><td>${element.classificationName}</td>`;
    dataTable += `<td><a href='/inv/classEdit/${element.classification_id}' title='Click to update'>Modify</a></td>`;
    dataTable += `<td><a href='/inv/classDelete/${element.classification_id}' title='Click to delete'>Delete</a></td></tr>`;
  });
  dataTable += "</tbody>";
  // Display the contents in the Inventory Management view
  classificationDisplay.innerHTML = dataTable;
}
*/
