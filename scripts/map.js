let user;
var userID;

firebase.auth().onAuthStateChanged((userP) => {
  if (userP) {
    user = userP;
    userID = user.uid;
    showUserMarker();
    showReportsOnMap();
  }
});

// four types of incident marker
var marker = L.Icon.extend({
  options: {
    iconSize: [80, 80], // size of the icon
    iconAnchor: [40, 40], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -40], // point from which the popup should open relative to the iconAnchor
  },
});

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

var map;
var geocoder;
var selectedReportId;

function SetUpMap() {
  // map will be initialized centered on BCIT campus
  map = L.map("map").setView([49.251, -123], 15);

  // initializes the geocoder
  geocoder = L.Control.Geocoder.nominatim();
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
}
SetUpMap();

function showUserMarker() {
  navigator.geolocation.getCurrentPosition((location) => {
    L.marker([location.coords.latitude, location.coords.longitude], {
      icon: icons.userMarker,
    })
      .addTo(map)
  });
}

function showReportsOnMap() {
  // collection of markers for grouping
  var markers = L.markerClusterGroup();
  var markerTemp;
  db.collection("users")
    .doc(userID)
    .get()
    .then((userDoc) => {
      console.log(userID);
      var filterValues = userDoc.data().filters;
      var reportCol = db.collection("reports");
      reportCol.get().then((reportColData) => {
        reportColData.forEach((reportDoc) => {
          var reportDocData = reportDoc.data();
          var reportDocId = reportDocData.id;
          console.log(reportDocId, typeof reportDocId);
          if (
            (reportDocData.method == "Driving" && filterValues[0]) ||
            (reportDocData.method == "Transit" && filterValues[1]) ||
            (reportDocData.method == "Cycling" && filterValues[2]) ||
            (reportDocData.method == "Walking" && filterValues[3])
          ) {
            markerTemp = L.marker(
              [reportDocData.location[0], reportDocData.location[1]],
              {
                icon: icons[reportDocData.method][reportDocData.level],
              }
            ).bindPopup(`
            <div class="markerPopup">
              <button class="markerLikeBtn" onclick="voteReport(${reportDocId}, ${true})"> <img src="/images/like.png"></button>
              <label class="markerLikeCount">${
                reportDocData.likers.length
              }</label>
              <button class="markerDislikeBtn" onclick="voteReport(${reportDocId}, ${false})"> <img src="/images/dislike.png"></button>
              <label class="markerDislikeCount">${
                reportDocData.dislikers.length
              }</label>
              <p class="markerPar">${reportDocData.description}</p>
              <p class="markerExtraInfo">Blocked: ${reportDocData.blocked.toLowerCase()}<br>Fixing: ${reportDocData.fixes.toLowerCase()}</p>
              <button class="markerSeeReviewsBtn" onclick="seeReviews(${reportDocId})">See reviews</button>
              <br><br>
              <button type="button" class="btn btn-sm btn-primary"
              onclick="updateReport('${reportDoc.id}')">Update Info</button>
            </div>
          `);
            markers.addLayer(markerTemp);
          }
        });
        map.addLayer(markers);
      });
    });
}

function voteReport(reportId, didLike) {
  reportId = reportId.toString();
  console.log(reportId);
  var reportDoc = db.collection("reports").doc(reportId);
  reportDoc.get().then((reportDocGet) => {
    var reportDocData = reportDocGet.data();
    var likers = reportDocData.likers;
    var dislikers = reportDocData.dislikers;
    if (didLike) {
      if (likers.includes(user.uid)) {
        likers.splice(likers.indexOf(user.uid), 1);
        reportDoc.set({ likers: likers }, { merge: true });
      } else {
        if (dislikers.includes(user.uid)) {
          dislikers.splice(dislikers.indexOf(user.uid), 1);
          reportDoc.set({ dislikers: dislikers }, { merge: true });
        }
        likers.push(user.uid);
        reportDoc.set({ likers: likers }, { merge: true });
      }
    } else {
      if (dislikers.includes(user.uid)) {
        dislikers.splice(dislikers.indexOf(user.uid), 1);
        reportDoc.set({ dislikers: dislikers }, { merge: true });
      } else {
        if (likers.includes(user.uid)) {
          likers.splice(likers.indexOf(user.uid), 1);
          reportDoc.set({ likers: likers }, { merge: true });
        }
        dislikers.push(user.uid);
        reportDoc.set({ dislikers: dislikers }, { merge: true });
      }
    }
    setTimeout(() => location.reload(), 1000);
  });
}

// reviews menu
const reviewsMenu = document.getElementById("reviewsMenu");
const reviewsTextArea = document.getElementById("reviewsTextArea");
const reviewsSubmitBtn = document.getElementById("reviewsSubmitBtn");
const reviewsContent = document.getElementById("reviewsContent");
const reviewsCloseBtn = document.getElementById("reviewsCloseBtn");

function seeReviews(reportId) {
  reportId = reportId.toString();
  console.log(reportId, typeof reportId);
  var reportDoc = db.collection("reports").doc(reportId);
  console.log(reportDoc);
  reportDoc.get().then((reportDocGet) => {
    console.log(reportDocGet);
    var reportDocData = reportDocGet.data();
    selectedReportId = reportId;

    var reviewsContentStr = "";
    if (reportDocData.reviews.length > 0) {
      reportDocData.reviews.reverse();
    }
    reportDocData.reviews.forEach(function (review) {
      var timeDiff = Math.floor((Date.now() - review.time) / 1000);
      var daysDiff = timeDiff / 86400;
      var hoursDiff = daysDiff * 24;
      var minDiff = hoursDiff * 60;
      var unit, diff;
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
      var timeDiffStr;
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
  });
}

reviewsCloseBtn.onclick = function () {
  reviewsMenu.hidden = true;
};
reviewsSubmitBtn.onclick = function () {
  var reportDoc = db.collection("reports").doc(selectedReportId);
  reportDoc.get().then((reportDocGet) => {
    var reportDocData = reportDocGet.data();
    var reviews = reportDocData.reviews;
    reviews.push({
      uid: user.uid,
      fullName: user.displayName,
      body: reviewsTextArea.value,
      time: Date.now(),
    });
    reportDoc.set({ reviews: reviews }, { merge: true });
    reviewsTextArea.value = "";
    reviewsMenu.hidden = true;
  });
};

function updateReport(reportID) {
  window.location.href = "updateReport.html?id=" + reportID;
}
