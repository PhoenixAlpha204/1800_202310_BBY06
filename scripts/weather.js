var userLat;
var userLng;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function (position) {
    userLat = position.coords.latitude;
    userLng = position.coords.longitude;
    useData(userLat, userLng);
  });
}

async function useData(lat, lng) {
  var geocodingCall =
    "https://api.openweathermap.org/geo/1.0/reverse?lat=" +
    lat +
    "&lon=" +
    lng +
    "&limit=1&appid=6f553bf67c4b3e8dafe308ae035f5fa1&units=metric";
  let geoResponse = await fetch(geocodingCall);
  let geoData = await geoResponse.json();
  let cityName = geoData[0].name;
  if (geoData[0].hasOwnProperty("state")) {
    cityName += ", " + geoData[0].state;
  }
  document.getElementById("cityName").innerText = cityName;

  var apiCall =
    "https://api.openweathermap.org/data/2.5/weather?lat=" +
    userLat +
    "&lon=" +
    userLng +
    "&appid=6f553bf67c4b3e8dafe308ae035f5fa1&units=metric";
  let response = await fetch(apiCall);
  let weatherData = await response.json();
  let currentTemp = Math.round(weatherData.main.temp);
  let highTemp = Math.round(weatherData.main.temp_max);
  let lowTemp = Math.round(weatherData.main.temp_min);
  let conditionIcon = weatherData.weather[0].icon;
  let iconURL = "https://openweathermap.org/img/wn/" + conditionIcon + "@4x.png";
  document.getElementById("icon").src = iconURL;
  document.getElementById("currTemp").innerText = currentTemp + "°C";
  document.getElementById("highLow").innerText = "High " + highTemp + "°C / Low " + lowTemp + "°C";
}
