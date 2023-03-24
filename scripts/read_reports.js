firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log(user.uid);
    var currentUser = db.collection("users").doc(user.uid); //global

    // the following functions are always called when someone is logged in
    let cardTemplate = document.getElementById("reportCardTemplate");

    db.collection("report")
      .where("userID", "==", user.uid)
      .get()
      .then((allReports) => {
        allReports.forEach((doc) => {
          //iterate thru each doc
          var title = doc.data().method; // get value of the "method" key
          var details = doc.data().description; // get value of the "description" key
          //var image = doc.data().code; //get unique image to each report to be used for fetching right image
          var blocked = doc.data().blocked; //gets the blocked field
          var address = doc.data().address;
          let newcard = cardTemplate.content.cloneNode(true);

          newcard.querySelector(".card-title").innerHTML = title;
          newcard.querySelector(".card-text").innerHTML = details;
          //newcard.querySelector('.card-image').src = `./images/${image}.jpg`; //Example: NV01.jpg

          newcard.querySelector(".card-length").innerText =
            "Address: " +
            doc.data().address +
            "\n\n" +
            "Blocked: " +
            doc.data().blocked +
            "\n" +
            "Last updated: " +
            doc.data().timestamp.toDate().toDateString();

          document.getElementById("report-go-here").appendChild(newcard);
        });
      });

  } else {
    // No user is signed in.
    console.log("No user is signed in");
    window.location.href = "login.html";
  }
});