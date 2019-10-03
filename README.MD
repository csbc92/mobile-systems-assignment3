# Assignment 3 Description
1. Download data of four modes of transportation (two types of data, accurate dedicated
GPS (labeled GT) and GPS in a mobile phone (collected in 2010)) from “Course
Materials”
2. Plot data using either KML or Leaflet
3. Implement median or mean filter
4. Plot filtered locations

[HANDIN] screendumps of raw, median, mean plots for one type of transportation. If
relevant comment on pros/cons of the two filters.


## Location data
The GPS data are provided in comma seperated files. These are converted from CVS to JSON with the javascript library CSV2JSON. A GeoJSON object is then created with coordinates of each of the routes.
The location data were collected with a phone and with a u-blox LEA-5H GPS receiver (more precise than phones).

## Data processing
The GeoJSON coordinates are filtered by using the methods Median and Mean filters.

## Plotting GPS data on the map
The JavaScript Leaflet library was used to plot the routes.
