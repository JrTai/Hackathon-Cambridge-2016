var map;
var directionDisplay;
var directionsService;
var markers = [];
var infowindow;
var msg = "";
var num = 1;
var numOfCallBack = 0;
var callBackCount = 0;

function initMap() {
  var cambridgeLoc = new google.maps.LatLng(52.2087841,0.0994191)
  var mapOptions = {
    center: cambridgeLoc,
    zoom: 12,
    mapTypeControl: true,
    mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_CENTER
      }
    }
  map = new google.maps.Map(document.getElementById('map'), mapOptions)

  // Direction
  directionsService = new google.maps.DirectionsService();;
  var renderOptions = { draggable: true };
  directionDisplay = new google.maps.DirectionsRenderer(renderOptions);
  directionDisplay.setMap(map);
  directionDisplay.setPanel(directionsPanel);
  infowindow = new google.maps.InfoWindow();

  // var startInput = /** @type {!HTMLInputElement} */(document.getElementById("start"));
  new google.maps.places.Autocomplete(document.getElementById("start"));
  new google.maps.places.Autocomplete(document.getElementById("end"));
}

function keyPress(event) {
  if (event.which == 13 || event.keyCode == 13) {
    calcRoute();
  }
}

function calcRoute() {
  callBackCount = 0;
  var radius = document.getElementById("radius").value
  if ((radius < 50) || (radius > 5000)) {
    errorMsg("RADIUS_ERROR")
  }
  else {
    document.getElementById("errorText").innerHTML = " ";
    document.getElementById("errorText").style.display = "none";
    var start = document.getElementById("start").value;
    var end = document.getElementById("end").value;

    var selectedMode = document.getElementById("mode").value;
    var request = {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode[selectedMode],
      unitSystem: google.maps.UnitSystem.METRIC
    };
    directionsService.route(request, function(result, status) {
      console.log("status: ",status)
      if (status == google.maps.DirectionsStatus.OK) {
        directionDisplay.setDirections(result);
        console.log("result: ", result)

        numOfCallBack = Math.floor(result.routes[0].overview_path.length/20);
        for (var i = 0; i < result.routes[0].overview_path.length; i=i+20) {
          showPlaces(result.routes[0].overview_path[i]);
        }
      }
      else {
        errorMsg(status)
      }
    });
  }
}

function errorMsg(status) {
  switch(status) {
    case "RADIUS_ERROR":
        document.getElementById("errorText").innerHTML = "Search radius out of range!";
        // throw "Search radius out of range";
        break;
    case "NO_NEARBY_PLACE":
        document.getElementById("errorText").innerHTML = "No nearby " + String(document.getElementById("type").value) + " on the way";
        break;
    case "NOT_FOUND":
        document.getElementById("errorText").innerHTML = "Start or end location could not be geocoded";
        break;
    case "ZERO_RESULTS":
        document.getElementById("errorText").innerHTML = "No route could be found between start and end";
        break;
    default:
        document.getElementById("errorText").innerHTML = "Error status: " + status;
        throw "ERROR";
    }

  document.getElementById("errorText").style.display = 'inline';

}

function showPlaces(location) {
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: location,
    radius: parseInt(document.getElementById("radius").value),
    types: [document.getElementById("type").value]
  }, callback);
}

function callback(results, status) {
  callBackCount += 1;
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    console.log("PlacesService SUCCESS status: ",status)
    for (var i = 0; i < results.length; i++) {
      produceMessage(results[i].name);
      addMarker(results[i]);
    }
  }
  else {
    errorMsg("OVER_QUERY_LIMIT")
    console.log("PlacesService FAIL status: ",status)
  }

  if ((callBackCount == numOfCallBack) && (num == 1)) { // No nearby
    errorMsg("NO_NEARBY_PLACE")
  }
}

// function createMarker(place) {
//   var placeLoc = place.geometry.location;
//   var marker = new google.maps.Marker({
//     map: map,
//     position: placeLoc
//   });
//   produceMessage(place.name);
//   google.maps.event.addListener(marker, 'click', function() {
//     infowindow.setContent(place.name);
//     infowindow.open(map, this);
//   });
// }

// Adds a marker to the map and push to the array.
function addMarker(place) {
// function addMarker(location) {
  var location = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: location
  });
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
  markers.push(marker);
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function produceMessage(name){
    msg = msg + num.toString() + "." + name + " ";
    num += 1;
    document.getElementById("list").innerHTML=msg;
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
  msg = "";
  num = 1;
  document.getElementById("list").innerHTML=msg;
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

// var items = ["Joplin, MO", "Oklahoma City, OK"];
// var waypoints = [];
// for (var i = 0; i < items.length; i++) {
//     var address = items[i];
//     if (address !== "") {
//         waypoints.push({
//             location: address,
//             stopover: true
//         });
//     }
// }
