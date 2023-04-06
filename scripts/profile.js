// to check if the user is logged in:
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    var currentUser = db.collection("users").doc(user.uid); // will to to the firestore and go to the document of the user
    currentUser.get().then((userDoc) => {
      // change page text to reflect user logged in status
      document.getElementById("name-goes-here").innerText = userDoc.data().name;
      document.getElementById("signout").innerText = "Sign Out";
      displayProfilePicture(userDoc);
      let file = document.getElementById("fileField");
      // if user uploads new profile pic, store it on Firebase
      document
        .querySelector("input[type=file]")
        .addEventListener("change", function () {
          // do nothing if user clicks cancel
          if (file.files.length) {
            deleteOldPicture(userDoc);
            // configure the file metadata before uploading
            let fileName = file.files[0].name;
            let contentType = "image/" + fileName.split(".").pop();
            uploadImage(file, user.uid, fileName, contentType, currentUser);
          }
        });
    });
  } else {
    document.getElementById("fileField").remove(); // don't allow user to upload files if not logged in
  }
});

// grab and display the profile picture, if it exists
// userDoc: the user's document on Firestore
function displayProfilePicture(userDoc) {
  if ("profilePicUrl" in userDoc.data()) {
    firebase
      .storage()
      .refFromURL(firebase.storage().ref() + userDoc.data().profilePicUrl)
      .getDownloadURL()
      .then((url) => {
        document.getElementById("pictureContainer").innerHTML =
          '<img src="' + url + '" alt="" />';
      });
  }
}

// delete old pic, if it exists
// userDoc: the user's document on Firestore
function deleteOldPicture(userDoc) {
  if ("profilePicUrl" in userDoc.data()) {
    firebase
      .storage()
      .ref()
      .child(userDoc.data().profilePicUrl)
      .delete()
      .then(() => {
        console.log("deleted");
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

// upload the image to Firebase storage
// file: the element containing the uploaded file
// userId: the user's Firebase ID
// fileName: the name of the uploaded file
// contentType: the type of the uploaded file
// currentUser: the user's document on Firestore
function uploadImage(file, userId, fileName, contentType, currentUser) {
  firebase
    .storage()
    .ref()
    .child("users/" + userId)
    .child(fileName)
    .put(file.files[0], { contentType: contentType })
    .then((doc) => {
      currentUser
        .update({
          profilePicUrl: doc.metadata.fullPath, //put the URL in the user collection for future fetching
        })
        .then(() => {
          window.location.href = "profile.html";
        });
    })
    .catch((error) => {
      console.error(error);
    });
}
