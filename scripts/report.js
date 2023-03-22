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

function writeReport() {
  console.log("inside write report");
  let Level = document.getElementById("level").value;
  let Method = document.getElementById("method").value;
  let Description = document.getElementById("description").value;
  let Blocked = document.querySelector('input[name="blocked"]:checked').value;
  let Fixes = document.querySelector('input[name="fixes"]:checked').value;
  let Latitude = map.getCenter().lat;
  let Longitude = map.getCenter().lng;
  let Address;
  //find address with geocoder, wait for result before logging to Firestore
  geocoder.reverse(
    map.getCenter(),
    map.options.crs.scale(18),
    function (results) {
      var r = results[0];
      if (r) {
        Address = r.name;
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
            db.collection("report")
              .add({
                userID: userID,
                level: Level,
                method: Method,
                description: Description,
                blocked: Blocked,
                fixes: Fixes,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                latitude: Latitude,
                longitude: Longitude,
                address: Address,
              })
              .then(() => {
                window.location.href = "thanks.html"; //new line added
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
