let user;
let userID;

// markers will only be shown when user is logged in
// initializes a user constant to be used by all other functions without needing to initialize one each time
firebase.auth().onAuthStateChanged((userP) => {
  if (userP) {
    user = userP;
    userID = user.uid;
    showReportsOnMap();
    showUserMarker();
  }
});

// defining incident markers, with type of transportation and severity
let marker = L.Icon.extend({
  options: {
    iconSize: [80, 80], // size of the icon
    iconAnchor: [40, 40], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -40], // point from which the popup should open relative to the iconAnchor
  },
});

// all the icons used for map markers
const icons = {
  Cycling: {
    Minor: new marker({ iconUrl: "./images/cycling1.png" }),
    Moderate: new marker({ iconUrl: "./images/cycling2.png" }),
    Severe: new marker({ iconUrl: "./images/cycling3.png" }),
  },
  Driving: {
    Minor: new marker({ iconUrl: "./images/driving1.png" }),
    Moderate: new marker({ iconUrl: "./images/driving2.png" }),
    Severe: new marker({ iconUrl: "./images/driving3.png" }),
  },
  Transit: {
    Minor: new marker({ iconUrl: "./images/transit1.png" }),
    Moderate: new marker({ iconUrl: "./images/transit2.png" }),
    Severe: new marker({ iconUrl: "./images/transit3.png" }),
  },
  Walking: {
    Minor: new marker({ iconUrl: "./images/walking1.png" }),
    Moderate: new marker({ iconUrl: "./images/walking2.png" }),
    Severe: new marker({ iconUrl: "./images/walking3.png" }),
  },
  userMarker: new marker({ iconUrl: "./images/userMarker.png" }),
};

let map;
let geocoder;

/**
 * This function sets up the map and shows a search bar at the top right corner of the screen.
 */
function SetUpMap() {
  // map will be initialized centered on BCIT campus if geolocation not supported
  map = L.map("map").setView([49.251, -123], 15);
  setUpGeocoder();
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // displays nearest address on map on click
  let marker;
  map.on("click", function (e) {
    geocoder.reverse(e.latlng, map.options.crs.scale(18), function (results) {
      let r = results[0];
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

  locateUser();
}
SetUpMap();

/**
 * Initializes the geocoder.
 */
function setUpGeocoder() {
  geocoder = L.Control.Geocoder.nominatim();
  if (typeof URLSearchParams !== "undefined" && location.search) {
    // parse /?geocoder=nominatim from URL
    let params = new URLSearchParams(location.search);
    let geocoderString = params.get("geocoder");
    if (geocoderString && L.Control.Geocoder[geocoderString]) {
      console.log("Using geocoder", geocoderString);
      geocoder = L.Control.Geocoder[geocoderString]();
    } else if (geocoderString) {
      console.warn("Unsupported geocoder", geocoderString);
    }
  }

  // top right search button
  let control = L.Control.geocoder({
    query: "",
    placeholder: "Search here...",
    geocoder: geocoder,
  }).addTo(map);
  setTimeout(function () {
    control.setQuery("");
  }, 12000);
}

/**
 * Get the user's current location.
 */
function locateUser() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function (position) {
      // Center the map on the user's location
      map.setView([position.coords.latitude, position.coords.longitude], 15);
    });
  } else {
    // Geolocation is not supported
    alert("Geolocation is not supported by your browser");
  }
}

/**
 * This function shows a marker to indicate the current location of this user using the app.
 * Permission will also be requested. If the user declines location access then the marker will not show.
 */
function showUserMarker() {
  navigator.geolocation.getCurrentPosition((location) => {
    L.marker([location.coords.latitude, location.coords.longitude], {
      icon: icons.userMarker,
    }).addTo(map);
  });
}

/**
 * This function loads all reports from firestore and displays them on the map in the form of a marker in their specificied positions, on page load.
 * This function takes into account any filtered reports and removes and shows filtered and unfiltered reports accordingly.
 * It also creates small pop-ups for each marker that appears on user click, and displays info about each report.
 */
function showReportsOnMap() {
  // collection of markers for grouping
  let markers = L.markerClusterGroup();
  db.collection("users")
    .doc(userID)
    .get()
    .then((userDoc) => {
      let filterValues = userDoc.data().filters;
      db.collection("reports")
        .get()
        .then((reportColData) => {
          reportColData.forEach((reportDoc) => {
            let reportDocData = reportDoc.data();
            let reportDocId = reportDoc.id;
            // only display the marker if mode matches user's selected filters
            if (
              (reportDocData.method == "Driving" && filterValues[0]) ||
              (reportDocData.method == "Transit" && filterValues[1]) ||
              (reportDocData.method == "Cycling" && filterValues[2]) ||
              (reportDocData.method == "Walking" && filterValues[3])
            ) {
              markers.addLayer(formatOneReport(reportDocData, reportDocId));
            }
          });
          map.addLayer(markers);
        });
    });
}

/**
 * Format one report to be placed in markers collection.
 * 
 * @param {*} reportDocData data of the report
 * @param {*} reportDocId Firestore's ID for the report
 * @returns the marker object that will be placed
 */
function formatOneReport(reportDocData, reportDocId) {
  return L.marker(
    [reportDocData.location[0], reportDocData.location[1]],
    {
      icon: icons[reportDocData.method][reportDocData.level],
    }
    // marker will display information about the report when clicked
  ).bindPopup(`<div class="markerPopup">
    <img class="markerImg" src="${reportDocData.image}"></img><br><br>
    <button class="markerLikeBtn" onclick="voteReport('${reportDocId}', ${true})"> <img src="/images/like.png"></button>
    <label class="markerLikeCount">${reportDocData.likers.length}
    </label>
    <button class="markerDislikeBtn" onclick="voteReport('${reportDocId}', ${false})"> <img src="/images/dislike.png"></button>
    <label class="markerDislikeCount">${reportDocData.dislikers.length}</label>
    <br><br>
    <b>${reportDocData.address}</b>
    <p class="markerPar">${reportDocData.description}</p>
    <p class="markerExtraInfo">Blocked: ${reportDocData.blocked.toLowerCase()}<br>Fixing: ${reportDocData.fixes.toLowerCase()}</p>
    <button class="markerSeeReviewsBtn" onclick="seeReviews('${reportDocId}')">See reviews</button>
    <br><br>
    <button type="button" class="btn btn-sm btn-primary"
    onclick="updateReport('${reportDocId}')">Update Info</button>
    </div>`);
}

/**
 * This function enables users to like reports using the like and dislike buttons of each marker pop-up.
 * 
 * @param {*} reportId report id of marker whose vote button was pressed by the user
 * @param {*} didLike bool representing whether the user clicked the like or dislike button
 */
function voteReport(reportId, didLike) {
  let reportDoc = db.collection("reports").doc(reportId);
  reportDoc.get().then((reportDocGet) => {
    let reportDocData = reportDocGet.data();
    if (reportDoc.id == reportId) {
      let likers = reportDocData.likers;
      let dislikers = reportDocData.dislikers;
      if (didLike) {
        if (likers.includes(user.uid)) {
          likers.splice(likers.indexOf(user.uid), 1);
          reportDoc.update({ likers: likers });
        } else {
          if (dislikers.includes(user.uid)) {
            dislikers.splice(dislikers.indexOf(user.uid), 1);
            reportDoc.update({ dislikers: dislikers });
          }
          likers.push(user.uid);
          reportDoc.update({ likers: likers });
        }
      } else {
        if (dislikers.includes(user.uid)) {
          dislikers.splice(dislikers.indexOf(user.uid), 1);
          reportDoc.update({ dislikers: dislikers });
        } else {
          if (likers.includes(user.uid)) {
            likers.splice(likers.indexOf(user.uid), 1);
            reportDoc.update({ likers: likers });
          }
          dislikers.push(user.uid);
          reportDoc.update({ dislikers: dislikers });
        }
      }
      setTimeout(() => location.reload(), 1000);
    }
  });
}

// reviews menu
const reviewsMenu = document.getElementById("reviewsMenu");
const reviewsTextArea = document.getElementById("reviewsTextArea");
const reviewsSubmitBtn = document.getElementById("reviewsSubmitBtn");
const reviewsContent = document.getElementById("reviewsContent");
const reviewsCloseBtn = document.getElementById("reviewsCloseBtn");

let selectedReportId;

/**
 * This function enables the user to see reviews for a specific report by clicking the "See reviews" button of the report's marker pop-up.
 * A menu will appear showing a section for submitting one's own review and another section that populates with all other submitted reviews.
 * Each review shows the sender full name, how long ago it was posted, and the review body itself.
 * 
 * @param {*} reportId report id of marker whose "See reviews" button was pressed by the user
 */
function seeReviews(reportId) {
  let reportCol = db.collection("reports");
  reportCol.get().then((reportColData) => {
    reportColData.forEach((reportDoc) => {
      let reportDocData = reportDoc.data();
      if (reportDoc.id == reportId) {
        selectedReportId = reportId;

        let reviewsContentStr = "";
        if (reportDocData.reviews.length > 0) {
          reportDocData.reviews.reverse();
        }
        reportDocData.reviews.forEach(function (review) {
          let timeDiff = Math.floor((Date.now() - review.time) / 1000);
          let daysDiff = timeDiff / 86400;
          let hoursDiff = daysDiff * 24;
          let minDiff = hoursDiff * 60;
          let unit, diff;
          if (daysDiff >= 1) {
            unit = "day";
            diff = daysDiff;
          } else if (hoursDiff >= 1) {
            unit = "hour";
            diff = hoursDiff;
          } else {
            unit = "minute";
            diff = minDiff;
          }
          diff = Math.floor(diff);
          let timeDiffStr;
          if (minDiff >= 1) {
            if (diff != 1) {
              unit += "s";
            }
            timeDiffStr = `${diff} ${unit} ago`;
          } else {
            timeDiffStr = "just now";
          }
          reviewsContentStr += `${review.fullName} (${timeDiffStr}):\n${review.body}\n\n`;
        });
        reviewsContent.innerText = reviewsContentStr;
        reviewsMenu.hidden = false;
      }
    });
  });
}

/**
 * This code detects when the close button of the reviews menu is pressed and closes the menu. 
 */
reviewsCloseBtn.onclick = function () {
  reviewsMenu.hidden = true;
};

/**
 * This code detects when the post/submit button of the reviews menu is pressed and submits a review.
 * The code sends the user id, full name, review body, and time sent in milliseconds to Firestore.
 */
reviewsSubmitBtn.onclick = function () {
  let reportDoc = db.collection("reports").doc(selectedReportId);
  reportDoc.get().then((reportDocGet) => {
    let reportDocData = reportDocGet.data();
    let reviews = reportDocData.reviews;
    reviews.push({
      uid: user.uid,
      fullName: user.displayName,
      body: reviewsTextArea.value,
      time: Date.now(),
    });
    reportDoc.update({ reviews: reviews });
    reviewsTextArea.value = "";
    reviewsMenu.hidden = true;
  });
};

/**
 * This function updates the report information.
 * 
 * @param {*} reportID report id of the report that will be updated
 */
function updateReport(reportID) {
  window.location.href = "update-report.html?id=" + reportID;
}
