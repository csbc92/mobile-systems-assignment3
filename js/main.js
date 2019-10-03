var mymap = L.map('mapid').setView([56.145383333333335, 10.203653333333333], 13);

function initializeMap() {
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.light',
        //id: 'mapbox.satellite',
        accessToken: 'pk.eyJ1IjoiY3NiYzkyIiwiYSI6ImNrMWFxcGJycjAzcHYzbm13OW1vMHN4aHgifQ.08iKUTNdOaz-9S0PTK0iRg' // Custom access token from https://account.mapbox.com/access-tokens/
    }).addTo(mymap);
}

function loadRoute(geoJSON) {
    var lineStyle = {
        "color": "#ff7800",
        "weight": 2,
        "opacity": 0.65
    };

    // return the layer
    return L.geoJSON(geoJSON, {
        style: lineStyle
    }).addTo(mymap);
}

function createGeoJSONObject(coordinates) {
    // Create a GeoJSON object accordingly to RFC 7946
    var geoJSON = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": coordinates
            },
            "properties": {
                "description": "Meaningful description"
            }
        }]
    }

    return geoJSON;
}

function parseCSV(csvData) {
    // Parse CSV string into JSON
    const json = CSVJSON.csv2json(csvData, { parseNumbers: true });
    console.log(json);

    // Extract the phone coordinates to an array of (Longitute, Latitute) as defined in RFC 7946
    var coordinates = json.map(o => new Array(o.phone_long, o.phone_lat));

    return coordinates;
}

function clearMap() {
    mymap.removeLayer(layer);
}

function drawRoute(route) {
    var coordinates = parseCSV(route); // One of the following; csv_biking, csv_driving, csv_running, csv_walking
    var geoJSON = createGeoJSONObject(coordinates);
    layer = loadRoute(geoJSON);
}

// Main program
initializeMap();
var coordinates = parseCSV(csv_walking); // One of the following; csv_biking, csv_driving, csv_running, csv_walking
var geoJSON = createGeoJSONObject(coordinates);
var layer = loadRoute(geoJSON);

// Center the map to the first coordinates on the route
mymap.setView([coordinates[0][1], coordinates[0][0]], 13); // Tuple (Latitude, Longitude), Zoom-level