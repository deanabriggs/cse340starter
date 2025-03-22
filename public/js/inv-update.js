const form = document.querySelector("#editForm");
form.addEventListener("change", function () {
  const updateBtn = document.querySelector("button");
  updateBtn.removeAttribute("disabled");
});
