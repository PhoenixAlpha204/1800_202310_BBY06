const errorPrompt = document.getElementById("errorPrompt");

function showError(message) {
  errorPrompt.innerText = message;
  errorPrompt.hidden = false;
  setTimeout(function () {
    errorPrompt.hidden = true;
  }, 5000);
}
