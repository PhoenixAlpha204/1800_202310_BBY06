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

// top right search button
var control = L.Control.geocoder({
  query: "",
  placeholder: "Search here...",
  geocoder: geocoder,
}).addTo(map);
var marker;

setTimeout(function () {
  control.setQuery("");
}, 12000);

// initializes map
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// displays nearest address on map on click
map.on("click", function (e) {
  geocoder.reverse(e.latlng, map.options.crs.scale(18), function (results) {
    var r = results[0];
    if (r) {
      if (marker) {
        marker
          .setLatLng(r.center)
          .setPopupContent(r.html || r.name)
          .openPopup();
      } else {
        marker = L.marker(r.center).bindPopup(r.name).addTo(map).openPopup();
      }
    }
  });
});

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

// four types of incident marker
var marker = L.Icon.extend({
  options: {
    iconSize: [80, 80], // size of the icon
    iconAnchor: [40, 40], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -40], // point from which the popup should open relative to the iconAnchor
  },
});
var carIcon = new marker({ iconUrl: "./images/car.png" }),
  bikeIcon = new marker({ iconUrl: "./images/bike.png" }),
  transitIcon = new marker({ iconUrl: "./images/transit.png" }),
  walkingIcon = new marker({ iconUrl: "./images/walking.png" });

// collection of markers for grouping
var markers = L.markerClusterGroup();
var markerTemp;

// initialize dummy markers for demo purposes and add to the collection
markerTemp = L.marker([49.248594, -123.004452], { icon: carIcon }).bindPopup(
  "Placeholder."
);
markers.addLayer(markerTemp);
markerTemp.on("click", function (e) {
  window.location.href = "/report_template.html"; // append report ID to this URL later
});
markerTemp = L.marker([49.2499, -122.998001], { icon: bikeIcon }).bindPopup(
  "Placeholder."
);
markers.addLayer(markerTemp);
markerTemp.on("click", function (e) {
  window.location.href = "/report_template.html"; // append report ID to this URL later
});
markerTemp = L.marker([49.25364, -123.004277], { icon: transitIcon }).bindPopup(
  "Placeholder."
);
markers.addLayer(markerTemp);
markerTemp.on("click", function (e) {
  window.location.href = "/report_template.html"; // append report ID to this URL later
});
markerTemp = L.marker([49.254645, -123.000533], { icon: walkingIcon }).bindPopup(
  "Placeholder."
);
markers.addLayer(markerTemp);
markerTemp.on("click", function (e) {
  window.location.href = "/report_template.html"; // append report ID to this URL later
});

map.addLayer(markers);
