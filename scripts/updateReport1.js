const myURL = new URLSearchParams(document.location.search);
const id = myURL.get("id");

function yes() {
  window.location.href = "updateReport2.html?id=" + id;
}

function no() {
  db.collection("reports")
    .doc(id)
    .delete()
    .then(() => {
      window.location.href = "thanks.html";
    });
}
