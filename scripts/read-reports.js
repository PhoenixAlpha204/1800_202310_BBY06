firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log(user.uid);

    // The following functions are always called when someone is logged in
    let cardTemplate = document.getElementById("reportCardTemplate");

    // Reads from report collection and creates card in "Your Reports"
    db.collection("reports")
      .where("userID", "==", user.uid)
      .get()
      .then((allReports) => {
        allReports.forEach((doc) => {
          //Iterate through each doc
          var method = doc.data().method; // get value of the "method" key
          var type = doc.data().type; // get value of the "type" key
          var details = doc.data().description; // get value of the "description" key
          var image = doc.data().image; //get unique image to each report
          var blocked = doc.data().blocked; //gets the blocked field
          var address = doc.data().address; // gets address
          var fixed = doc.data().fixes; // gets fixes field
          let newcard = cardTemplate.content.cloneNode(true);

          //Assigns variables to sections on report cards
          newcard.querySelector('.card-image').src = image;
          newcard.querySelector(".card-title").innerHTML = type;
          newcard.querySelector(".card-text").innerHTML = "Description: " + details;
          newcard.querySelector(".update").addEventListener("click", function (e) {
            window.location.href = window.location.href = "update-report.html?id=" + doc.id;
          });

          //Delete button removes card and redirectst to "Your Reports" page
          newcard.querySelector(".delete").addEventListener("click", function (e) {
            db.collection("reports").doc(doc.id).delete().then(() => {
              window.location.href = "read-reports.html";
            })
          });

          //Sets text to a card
          newcard.querySelector(".card-length").innerText =
            "Transport method: " +
            method +
            "\n\n" +
            "Address: " +
            address +
            "\n\n" +
            "Path blocked: " +
            blocked +
            "\n" +
            "Fixes underway: " +
            fixed +
            "\n" +
            "Last updated: " +
            doc.data().timestamp.toDate().toDateString();


          //Adds text to a card
          document.getElementById("report-go-here").appendChild(newcard);
        });
      });

  } else {
    // No user is signed in.
    console.log("No user is signed in");
    window.location.href = "login.html";
  }
});

