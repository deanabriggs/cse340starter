document.addEventListener("DOMContentLoaded", function () {
  console.log("script loaded");
  const pwBtn = document.querySelector("#pwBtn");
  if (pwBtn) {
    pwBtn.addEventListener("click", function () {
      const pwInput = document.getElementById("account_password");
      const type = pwInput.getAttribute("type");
      if (type == "password") {
        pwInput.setAttribute("type", "text");
        pwBtn.innerHTML = "Hide Password";
      } else {
        pwInput.setAttribute("type", "password");
        pwBtn.innerHTML = "Show Password";
      }
    });
  }
});
