// to check if the user is logged in:
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log(user.uid); // let me to know who is the user that logged in to get the UID
    var currentUser = db.collection("users").doc(user.uid); // will to to the firestore and go to the document of the user
    currentUser.get().then((userDoc) => {
      //get the user name
      var userName = userDoc.data().name;
      var userID = user.uid;
      console.log(userName);
      //$("#name-goes-here").text(userName); //jquery
      document.getElementById("name-goes-here").innerText = userName;
      document.getElementById("signout").innerText = "Sign Out";
      //grab and display the profile picture, if it exists
      if ("profilePicUrl" in userDoc.data()) {
        var profPicURL = firebase
          .storage()
          .refFromURL(firebase.storage().ref() + userDoc.data().profilePicUrl)
          .getDownloadURL();
        Promise.all([profPicURL]).then((snapshot) => {
          document.getElementById("pictureContainer").innerHTML =
            '<img src="' + snapshot[0] + '" alt="" />';
        });
      }
      let file = document.getElementById("fileField");
      //put the uploaded file on Firebase
      document
        .querySelector("input[type=file]")
        .addEventListener("change", function () {
          if (file.files.length) {
            var storageRef = firebase
              .storage()
              .ref()
              .child("users/" + userID);
            //delete old pic, if it exists
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
            let fileName = file.files[0].name;
            let fileExt = fileName.split(".").pop();
            let contentType = "image/" + fileExt;
            var profilePicUrl = storageRef
              .child(fileName)
              .put(file.files[0], { contentType: contentType });
            Promise.all([profilePicUrl])
              .then((snapshot) => {
                const picUrl = snapshot[0].metadata.fullPath;
                currentUser
                  .update({
                    //put the URL in the user collection for future fetching
                    profilePicUrl: picUrl,
                  })
                  .then(() => {
                    window.location.href = "profile.html";
                  });
              })
              .catch((error) => {
                console.error(error);
              });
          }
        });
    });
  } else {
    document.getElementById("fileField").remove();
  }
});
