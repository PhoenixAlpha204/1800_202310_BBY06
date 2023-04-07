//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
var firebaseConfig = {
  apiKey: "AIzaSyBkkTdqOUf3mLu_XTg-HeirP2ePAOgMuRQ",
  authDomain: "comp1800-3b636.firebaseapp.com",
  projectId: "comp1800-3b636",
  storageBucket: "comp1800-3b636.appspot.com",
  messagingSenderId: "756420661225",
  appId: "1:756420661225:web:3827131b75a8f9277dc578",
};

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
