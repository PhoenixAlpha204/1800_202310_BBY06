// Get the current user's ID
const userId = firebase.auth().currentUser.uid;

// Get a reference to the user's Firestore document
const userDocRef = firebase.firestore().collection("users").doc(userId);

// Check if the user has any collections in their Firestore database
userDocRef
  .listCollections()
  .then((collections) => {
    if (collections.length > 0) {
      // Display a button if the user has collections
      const buttonContainer = document.getElementById("button-container");
      const button = document.createElement("button");
      button.innerText = "View Collections";
      buttonContainer.appendChild(button);
    }
  })
  .catch((error) => {
    console.error("Error checking for collections: ", error);
  });
