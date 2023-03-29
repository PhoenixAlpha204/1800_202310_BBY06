const MAX_DESCRIPTION_CHARS = 1000;

// map will be initialized centered on BCIT campus
var map = L.map("map").setView([49.251, -123], 15);

// initializes the geocoder
var geocoder = L.Control.Geocoder.nominatim();
if (typeof URLSearchParams !== "undefined" && location.search) {
  // parse /?geocoder=nominatim from URL
  var params = new URLSearchParams(location.search);
  var geocoderString = params.get("geocoder");
  if (geocoderString && L.Control.Geocoder[geocoderString]) {
    console.log("Using geocoder", geocoderString);
    geocoder = L.Control.Geocoder[geocoderString]();
  } else if (geocoderString) {
    console.warn("Unsupported geocoder", geocoderString);
  }
}

// initializes map
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// Get the user's current location
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(function (position) {
    // Center the map on the user's location
    map.setView([position.coords.latitude, position.coords.longitude], 15);
  });
} else {
  // Geolocation is not supported
  alert("Geolocation is not supported by your browser");
}

var circle = L.circle(map.getCenter(), {
  color: "#fff",
  opacity: 0.9,
  fillColor: "#fff",
  fillOpacity: 0.95,
  radius: 30,
}).addTo(map);

map.on("move", function () {
  circle.setLatLng(map.getCenter());
  //console.log(map.getCenter());
});

var ImageFile;
function listenFileSelect() {
      // listen for file selection
      var fileInput = document.getElementById("mypic-input"); // pointer #1
      const image = document.getElementById("mypic-goes-here"); // pointer #2

			// When a change happens to the File Chooser Input
      fileInput.addEventListener('change', function (e) {
          ImageFile = e.target.files[0];   //Global variable
          var blob = URL.createObjectURL(ImageFile);
          image.src = blob; // Display this image
      })
}
listenFileSelect();

// Submits information from report page to Firestore collection
function writeReport() {
  console.log("Inside write report");
  let Type = document.getElementById("type").value;
  let Level = document.getElementById("level").value;
  let Method = document.getElementById("method").value;
  let Description = document.getElementById("description").value;
  let Blocked = document.querySelector('input[name="blocked"]:checked').value;
  let Fixes = document.querySelector('input[name="fixes"]:checked').value;
  let Latitude = map.getCenter().lat;
  let Longitude = map.getCenter().lng;
  let Address;
  
  if (Description.length > MAX_DESCRIPTION_CHARS) {showError(`Your description cannot be over ${MAX_DESCRIPTION_CHARS} characters long. It is currently ${descriptionChars} characters long.`); return;};

  //find address with geocoder, wait for result before logging to Firestore
  geocoder.reverse(
    map.getCenter(),
    map.options.crs.scale(18),
    function (results) {
      var r = results[0];
      if (r) {
        const regex = /, [A-Za-z]+, Metro Vancouver [\w\d\s,]+/ig;
        Address = r.name.replaceAll(regex, "");
        if (Address === "") {
          Address = "No known address";
        }
      } else {
        Address = "No known address";
      }
      console.log(Level, Method, Description, Blocked, Fixes, Address);

      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          var currentUser = db.collection("users").doc(user.uid);
          var userID = user.uid;

          //get the document for current user.
          currentUser.get().then((userDoc) => {
            db.collection("reports")
              .add({
                id: (Math.floor(Math.random() * Math.pow(10, 8))).toString(),
                userID: userID,
                type: Type,
                level: Level,
                method: Method,
                description: Description,
                blocked: Blocked,
                fixes: Fixes,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                location: [Latitude, Longitude],
                address: Address,
                likers: [],
                dislikers: [],
                reviews: [],
              })
              .then(doc => {
                console.log("1. Post document added!");
                console.log(doc.id);
                uploadPic(doc.id);
              });
          });
        } else {
          console.log("No user is signed in");
          window.location.href = "report.html";
        }
      });
    }
  );
}

// uploads image to Firestore
function uploadPic(postDocID) {
  console.log("inside uploadPic " + postDocID);
  var storageRef = storage.ref("images/" + postDocID + ".jpg");

  storageRef.put(ImageFile)   //global variable ImageFile
 
       // AFTER .put() is done
      .then(function () {
          console.log('2. Uploaded to Cloud Storage.');
          storageRef.getDownloadURL()

               // AFTER .getDownloadURL is done
              .then(function (url) { // Get URL of the uploaded file
                  console.log("3. Got the download URL.");

                  // Now that the image is on Storage, we can go back to the
                  // post document, and update it with an "image" field
                  // that contains the url of where the picture is stored.
                  db.collection("reports").doc(postDocID).update({
                          "image": url // Save the URL into users collection
                      })
                       // AFTER .update is done
                      .then(function () {
                          console.log('4. Added pic URL to Firestore.');
                          alert ("Submission !");
                          window.location.href = "thanks.html";
                      })
              })
      })
      .catch((error) => {
           console.log("error uploading to cloud storage");
      })
}
