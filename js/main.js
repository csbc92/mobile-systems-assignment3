var mymap = L.map('mapid').setView([56.145383333333335, 10.203653333333333], 13);
var layers = new Array();

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

    var randomColor = "#000000".replace(/0/g, function() { return (~~(Math.random() * 16)).toString(16); });
    var lineStyle = {
        "color": randomColor,
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

/*
 * @input csvData - CSV data which seperated by a comma
 * @returns - an array of coordinate pairs (longitude, latitude) as defined in RFC 7946
 */
function parseCSV(csvData) {
    // Parse CSV string into JSON
    const json = CSVJSON.csv2json(csvData, { parseNumbers: true });
    console.log(json);

    var coordinates = {};

    if (getOptions().device === "phone") {
        // load phone gps data
        // Extract the phone coordinates to an array of (Longitute, Latitute) as defined in RFC 7946
        coordinates = json.map(o => new Array(o.phone_long, o.phone_lat));
    } else if (getOptions().device === "lea-5h") {
        // load lea-5h gps data
        coordinates = json.map(o => new Array(o.gt_long, o.gt_lat));
    }

    return coordinates;
}

function clearMap() {
    //layers.forEach((l) => mymap.removeLayer(l));
    var lastElement = layers.pop();
    if (lastElement != undefined) {
        mymap.removeLayer(lastElement);
    }
}

function drawRoute(route) {

    var coordinates = parseCSV(route); // One of the following; csv_biking, csv_driving, csv_running, csv_walking

    var interval = document.getElementById("interval").value;

    if (getOptions().filter === "mean") {
        // Extract x coordinates in a flat array and apply averages on these coordinates
        var x_coordinates_mean = moving_average(coordinates.map((x) => { return x[0] }), interval);
        // Extract y coordinates in a flat array and apply averages on these coordinates
        var y_coordinates_mean = moving_average(coordinates.map((x) => { return x[1] }), interval);
        // Merge the coordinates back into its original data format
        var merged = new Array();
        x_coordinates_mean.forEach((x, i) => merged[i] = [x, y_coordinates_mean[i]]);

        coordinates = merged;
    } else if (getOptions().filter === "median") {
        // Extract x coordinates in a flat array and apply averages on these coordinates
        var x_coordinates_median = moving_median(coordinates.map((x) => { return x[0] }), interval);
        console.log(x_coordinates_median);
        // Extract y coordinates in a flat array and apply averages on these coordinates
        var y_coordinates_median = moving_median(coordinates.map((x) => { return x[1] }), interval);
        // Merge the coordinates back into its original data format
        var merged = new Array();
        x_coordinates_median.forEach((x, i) => merged[i] = [x, y_coordinates_median[i]]);

        coordinates = merged;

    }

    var geoJSON = createGeoJSONObject(coordinates);
    layer = loadRoute(geoJSON);
    layers.push(layer);
}

/*
 * Calculates the moving average of the given coordinates
 * @input coordinates - 1 dimensional coordinate set e.g. {56.145383333333335, 56.153684444444435, ..}
 * @interval - the amount of samples used to calculate the moving average
 * @link - https://en.wikipedia.org/wiki/Moving_average#Simple_moving_average
 * @returns - an array of the calculated moving average
 */
function moving_average(coordinates, interval) {
    // var a = new Array(56.1718867332,56.1718521159,56.1718295686,56.1718200132,56.1718125533,56.17180392,56.1717983879,56.1717957057,56.1717935264,56.1717911795,56.1717895031,56.1717885811,56.1719800237,56.1719754137,56.1719842985,56.1719863939,56.1719869807,56.1719878189,56.1719957817,56.172008606);
    var average_coordinates = new Array();

    for (i = 0; i < coordinates.length; i++) {
        var start_index = (i - Math.floor((interval / 2)));
        var end_index = (i + Math.ceil((interval / 2)));

        if (start_index < 0 || end_index > (coordinates.length - 1)) { // Out of bounds cases
            continue;
        }

        var average = coordinates.slice(start_index, end_index).reduce(((accumulator, current) => accumulator += current), 0) / interval;
        average_coordinates.push(average);
    }

    return average_coordinates;
}

/*
 * Calculates the moving median of the given coordinates
 * @input coordinates - 1 dimensional coordinate set e.g. {56.145383333333335, 56.153684444444435, ..}
 * @interval - the amount of samples used to calculate the moving median
 * @link - https://en.wikipedia.org/wiki/Moving_average#Moving_median
 * @returns - an array of the calculated moving average
 */
function moving_median(coordinates, interval) {
    var median_coordinates = new Array();

    for (i = 0; i < coordinates.length; i++) {
        var start_index = (i - Math.floor((interval / 2)));
        var end_index = (i + Math.ceil((interval / 2)));

        if (start_index < 0 || end_index > (coordinates.length - 1)) { // Out of bounds cases
            continue;
        }

        // Sort the sub-array
        var sorted_coordinates = coordinates.slice(start_index, end_index).sort();
        // Pick the median
        var middle_value = sorted_coordinates[Math.floor(sorted_coordinates.length / 2)];

        median_coordinates.push(middle_value);
    }

    return median_coordinates;
}

/*
 * @returns - an object with the options selected by the user
 */
function getOptions() {
    // Get the device type
    var device_element = document.getElementById("device");
    var device_value = device_element.options[device_element.selectedIndex].value;

    // Get the filtering type
    var filter_element = document.getElementById("filter");
    var filter_value = filter_element.options[filter_element.selectedIndex].value;

    return {
        "device": device_value,
        "filter": filter_value
    };
}

// Main program
initializeMap();
//var coordinates = parseCSV(csv_walking); // One of the following; csv_biking, csv_driving, csv_running, csv_walking

//var geoJSON = createGeoJSONObject(coordinates);
//var layer = loadRoute(geoJSON);
//layers.push(layer); // Store a reference to the layer.

// Center the map to the first coordinates on the route
//mymap.setView([coordinates[0][1], coordinates[0][0]], 13); // Tuple (Latitude, Longitude), Zoom-level