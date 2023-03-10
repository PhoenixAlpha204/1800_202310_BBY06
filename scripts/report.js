function writeReport() {
  console.log("inside write report")
  let Level = document.getElementById("level").value;
  let Method = document.getElementById("method").value;
  let Description = document.getElementById("description").value;
  let Blocked = document.querySelector('input[name="blocked"]:checked').value;
  let Fixes = document.querySelector('input[name="fixes"]:checked').value;
  console.log(Level, Method, Description, Blocked, Fixes);

  firebase.auth().onAuthStateChanged(user => {
      if (user) {
          var currentUser = db.collection("users").doc(user.uid)
          var userID = user.uid;
          //get the document for current user.
          currentUser.get()
              .then(userDoc => {
                  db.collection("report").add({
                      userID: userID,
                      level: Level,
                      method: Method,
                      description: Description,
                      blocked: Blocked,
                      fixes: Fixes,
                      timestamp: firebase.firestore.FieldValue.serverTimestamp()
                  }).then(() => {
                      window.location.href = "thanks.html"; //new line added
                  })
              })
      } else {
          console.log("No user is signed in");
          window.location.href = 'report.html';
      }
  });
}