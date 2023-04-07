## CryoCatcher

## General Info
Our team is developing a web application to help commuters affected by extreme weather to navigate potentially affected streets by utilising user contributed data.
	
## Technologies and Resources Used
List technologies (with version numbers), API's, icons, fonts, images, media or data sources, and other resources that were used.
* HTML5, CSS3
* JavaScript
* Bootstrap 5.1
* Firebase 8.0 (Authentication, Firestore, Storage, Hosting)
* Leaflet 1.9, with plugins Leaflet-Control-Geocoder and Leaflet.markercluster
* OpenStreetMap
* OpenWeatherMap
* Twitter API
* Material Icons

## Contents of Folder 
Content of the project folder:

```
 Top level of project folder: 
├── .gitignore                # Git ignore file
├── filters.html              # filters HTML file, the page where user's select filters for incidents
├── index.html                # landing HTML file, this is what users see
├── login.html                # login HTML file, the log-in page
├── map.html                  # map HTML file, the map page
├── nearby.html               # nearby HTML file,. where nearby files are displayed
├── profile.html              # profile HTML file, the profile page
├── read-report.html          # read reports HTML file, the page where user's see their own reports
├── report.html               # submit report HTML file, the page where user's submit incident reports 
├── thanks.html               # thanks HTML file, the page where user's are thanked for their submission
├── transit.html              # transit HTML file, the embedded Trankslink tweets page
├── update-report.html        # update report HTML file, the page where user's update reports
├── weather.html              # weather HTML file, the weather information page
└── README.md                 # README file

It has the following subfolders and files:
├── images                   # Folder for images
    /icons
        /favicon.ico    
    /cycling.png
    /cycling1.png
    /cycling2.png
    /cycling3.png
    /dislike.png
    /driving.png
    /driving1.png
    /driving2.png
    /driving3.png
    /filter.png
    /index.png
    /like.png
    /nearby.png
    /plus.png
    /search.png
    /transit.png
    /transit1.png
    /transit2.png
    /transit3.png
    /transparent.png
    /userMarker.png
    /walking.png
    /walking1.png
    /walking2.png
    /walking3.png

├── scripts                  # Folder for scripts
    /authentication.js       # JS for respective HTML pages
    /filters.js              # JF for filters.html
    /firebaseAPl_team06.js   # firebase API stuff, shared across pages
    /map.js                  # JS for map.html  
    /nearby.js               # JS for nearby.html  
    /profile.js              # JS for profile.html             
    /read-reports.js         # JS for read-reports.html
    /report.js               # JS for report.html
    /shared.js 
    /update-report.js        # JS for update-reports.html
    /weather.js              # JS for waether.html

├── styles                   # Folder for styles
    /global.css              # CSS for navbar, shared across pages
    /index.css               # CSS for respective HTML pages
    /nearby.css
    /profile.css
    /shared.css

Firebase hosting files: 
├── .firebase
	/hosting..cache
├── .firebaserc
├── 404.html
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── storage.rules

```
## Limitations
Here are some known bugs:
* Unsubmitted reviews will appear in the reviews menu for all markers
* Selecting an image, then selecting another image and cancelling will display
*   the old image but not upload it

## Features for Future
What we'd like to build in the future:
* Reports can auto delete when reaching a set number of dislikes
*   When a user dislikes a report it can also remove itself from only their map
* Users can submit multiple images per report
* Users can navigate using the app and navigation will automatically
*   avoid streets with reported incidents
	
## Resources
* Icons from Material Icons
* All other graphics homemade

## Contact
* Quincy Wong - qwong11@my.bcit.ca
* Victor Fung - 98victorfung@gmail.com
* Ali Farahani - afar5v@gmail.com

## Acknowledgements
* <a href="https://getbootstrap.com/">Bootstrap</a>
* <a href="https://fonts.google.com/icons">Material Icons</a>
* <a href="https://leafletjs.com/">Leaflet API</a>
* <a href="https://twitter.com/TransLink">TransLink Twitter Feed</a>
* <a href="https://home.openweathermap.org">OpenWeatherMap</a>
