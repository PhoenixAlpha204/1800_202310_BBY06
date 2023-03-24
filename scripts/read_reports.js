firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log(user.uid);
    var currentUser = db.collection("users").doc(user.uid); //global

    // the following functions are always called when someone is logged in
    let cardTemplate = document.getElementById("hikeCardTemplate");

    db.collection("report")
      .where("userID", "==", user.uid)
      .get()
      .then((allReports) => {
        allReports.forEach((doc) => {
          //iterate thru each doc
          var title = doc.data().method; // get value of the "name" key
          var details = doc.data().description; // get value of the "details" key
          //var hikeCode = doc.data().code; //get unique ID to each hike to be used for fetching right image
          var blocked = doc.data().blocked; //gets the length field
          var address = doc.data().address;
          let newcard = cardTemplate.content.cloneNode(true);

          //update title and text and image etc.
          newcard.querySelector(".card-title").innerHTML = title;
          //newcard.querySelector('.card-length').innerHTML = hikeLength + "km";
          newcard.querySelector(".card-text").innerHTML = details;
          //newcard.querySelector('.card-image').src = `./images/${hikeCode}.jpg`; //Example: NV01.jpg

          //NEW LINE: update to display length, duration, last updated
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

//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
// function displayCardsDynamically(collection) {

//   let cardTemplate = document.getElementById("hikeCardTemplate");

//   db.collection(collection)
//     .where("userID", "==", "gHB9bXqKYgbL3MMp5lxfq18tXlu2")
//     .get()
//     .then((allReports) => {
//       allReports.forEach((doc) => {
//         //iterate thru each doc
//         var title = doc.data().method; // get value of the "name" key
//         var details = doc.data().description; // get value of the "details" key
//         //var hikeCode = doc.data().code; //get unique ID to each hike to be used for fetching right image
//         var blocked = doc.data().blocked; //gets the length field
//         let newcard = cardTemplate.content.cloneNode(true);

//         //update title and text and image etc.
//         newcard.querySelector(".card-title").innerHTML = title;
//         //newcard.querySelector('.card-length').innerHTML = hikeLength + "km";
//         newcard.querySelector(".card-text").innerHTML = details;
//         //newcard.querySelector('.card-image').src = `./images/${hikeCode}.jpg`; //Example: NV01.jpg

//         //NEW LINE: update to display length, duration, last updated
//         newcard.querySelector(".card-length").innerText =
//           "Blocked: " +
//           doc.data().blocked +
//           "\n" +
//           "Last updated: " +
//           doc.data().timestamp;

//         document.getElementById(collection + "-go-here").appendChild(newcard);

//       });
//     });
// }
