const MAX_DST = 5; // (in kilometers) any report that is farther than this distance from the user will not display
const nearbyReports = document.getElementById("nearbyReports");

// initializes a user constant to be used by all other functions without needing to initialize one each time
let user;
firebase.auth().onAuthStateChanged((userP) => {
  if (userP) {
    user = userP;
  }
});
var nearbyList = [];

/**
 * This function adds all the reports that are closest to the user's current location and are still within MAX_DST kilometers away to the nearbyList
 * More specifically, the distance calculation uses the Pythagorean Formula and for each nearby report, an array
 * containing the report's data object from Firestore and distance are added
 */
function setNearbyList() {
  navigator.geolocation.getCurrentPosition((userLocation) => {
    var reportCol = db.collection("reports");
    reportCol
      .get()
      .then((reportColData) => {
        reportColData.forEach((reportDoc) => {
          var reportDocData = reportDoc.data();
          const latDst =
            (userLocation.coords.latitude - reportDocData.location[0]) *
            110.574;
          const lonDst =
            (userLocation.coords.longitude - reportDocData.location[1]) *
            111.32 *
            Math.cos(latDst * (Math.PI / 180));
          const dst = Math.sqrt(Math.pow(latDst, 2) + Math.pow(lonDst, 2));
          console.log(dst);
          if (dst <= MAX_DST) {
            nearbyList.push([dst, reportDocData]);
          }
        });
      })
      .then(() => {
        nearbyList.sort(function (a, b) {
          return a[0] - b[0];
        });
        console.log(nearbyList);
      })
      .then(showReportsInNearbyList);
  });
}
setNearbyList();

/**
 * This function populates the nearby reports menu on page load using the nearbyLists array that was filled in by the setNearbyList() function.
 */
function showReportsInNearbyList() {
  if (nearbyList.length == 0) {
    return;
  }

  var html = "";
  nearbyList.forEach(function (listItem) {
    const reportDocData = listItem[1];
    var dstStr;
    if (listItem[0] < 1) {
      dstStr = `${listItem[0].toFixed(3) * 1000} m`;
    } else {
      dstStr = `${listItem[0].toFixed(2)} km`;
    }

    html += `
        <div class="nearbyReportsCell">
            <span class="span1">${dstStr} away</span><br>
            ${reportDocData.description}<br><br>
            <span class="span2">Severity: <b>${reportDocData.level}</b> • Method: <b>${reportDocData.method}</b></span><br>
            <span class="span3">Blocked: <b>${reportDocData.blocked}</b> • Fixing: <b>${reportDocData.fixes}</b></span><br>
        </div>
        <br>
        `;
  });
  nearbyReports.innerHTML = html;
}
