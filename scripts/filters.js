var userID;

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    var currentUser = db.collection("users").doc(user.uid);
    userID = user.uid;

    //get the document for current user.
    currentUser.get().then((userDoc) => {
      var filters = userDoc.data().filters;
      if (!filters[0]) {
        document.getElementById("driving").checked = false;
      }
      if (!filters[1]) {
        document.getElementById("transit").checked = false;
      }
      if (!filters[2]) {
        document.getElementById("cycling").checked = false;
      }
      if (!filters[3]) {
        document.getElementById("walking").checked = false;
      }
    });
  } else {
    console.log("No user is signed in");
    window.location.href = "index.html";
  }
});

function changeFilters() {
  db.collection("users")
    .doc(userID)
    .update({
      filters: [
        document.getElementById("driving").checked,
        document.getElementById("transit").checked,
        document.getElementById("cycling").checked,
        document.getElementById("walking").checked
      ],
    })
    .then(() => {
      console.log("filters updated");
      window.location.href = "map.html";
    })
    .catch((error) => {
      console.log("error " + error);
    });
}
