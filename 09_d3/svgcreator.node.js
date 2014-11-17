// Run me with: 
// $ COLOR=#66AAFF node svgcreator.node.js > out.svg   #passing var COLOR
//
var jsdom = require('jsdom');
var fs    = require('fs');
jsdom.env(
  "<html><body></body></html>",        // CREATE DOM HOOK:
  [ 'http://d3js.org/d3.v3.min.js',    // JS DEPENDENCIES online ...
  'js/d3.v3.min.js' ],                 // ... & offline
// D3JS CODE * * * * * * * * * * * * * * * * * * * * * * * *

  function (err, window) {

    var WEST  = process.env.WEST,     // <<============== IMPORTANT !!
        NORTH = process.env.NORTH,
        EAST  = process.env.EAST,
        SOUTH = process.env.SOUTH,
        ITEM  = process.env.ITEM;
    var DATE  = (new Date()).toISOString().slice(0,10).replace(/-/g,""),
        VERSION = process.env.VERSION,/*
         = process.env.,
         = process.env. */
         COMMAND = "make -f master.makefile ...";

/* ***************************************************************** */
/* SVG INIT ******************************************************** */
    var width = 300, height = 100;

    var svg = window.d3.select("body").append("svg")
/**/	.attr(":xmlns:svg","http://www.w3.org/2000/svg")
	.attr(":xmlns"    ,"http://www.w3.org/2000/svg") // if not:  file does not appear to have any style information
	.attr(":xmlns:xlink","http://www.w3.org/1999/xlink") // if not: Namespace prefix xlink for href
/**/	.attr(":xmlns:rdf","http://www.w3.org/1999/02/22-rdf-syntax-ns#") 
	.attr(":xmlns:cc","http://creativecommons.org/ns#")
//        .attr("width", width)
//        .attr("height", height)
	.attr("viewBox", "0 0 "+width+" "+height);

/* ***************************************************************** */
/* METADATA ******************************************************** */
// http://stackoverflow.com/questions/26821677/
var geotag = '<dcterms:spatial xsi:type="dcterms:Box">'
	+'name='+ITEM+';'
	+'northlimit='+NORTH+';'
	+'eastlimit='+EAST+';'
	+'southlimit='+SOUTH+';'
	+'westlimit='+WEST+';'
	+'projection=ESPXYZ;'
	+'units=decimal degrees;</dcterms:spatial>';

 //   svg.append(geotag);
    svg.append("metadata")
	.attr(":xmlns:xsi","http://www.w3.org/2001/XMLSchema-instance") // geotag
	.attr(":xmlns:dc","http://purl.org/dc/elements/1.1/")           // geotag
	.attr(":xmlns:dcterms","http://purl.org/dc/terms/")             // geotag
        .attr("class", "wikiatlas2014")
        .attr("author", "Hugo Lopez, Arun Ganesh")
	.attr("twitter", "@Wikiatlas")
        .attr("license", "CC-by-sa-4.0")
        .attr("title", ITEM)
	.html(geotag);
    svg.append("scriptdata")
        .attr("name", "WikiAtlas script")
        .attr("date", DATE)
        .attr("script_version", VERSION);

/* ***************************************************************** */
/* SVG DESIGN ****************************************************** */
    svg.append("rect")
        .attr("id", "rectangle1")
        .attr("x", 10)
        .attr("y", 10)
        .attr("width", width-20)
        .attr("height", height-20)
        .style("fill", "orange")
        .style("fill-opacity", 0.5);

/* ***************************************************************** */
/* RASTER INJECTION ************************************************ */
var i64 = fs.readFileSync('./image.b64');
svg.append("image")
  .attr("y","0")
  .attr("x","0")
  .attr("xlink:xlink:href", "data:image/jpg;base64," + i64) // replace link by data URI
  .attr("width", width)
  .attr("height", height)
  .attr("class", "bg-image")
  .style("opacity", 1);

// END svg design

/* ***************************************************************** */
/* SVG PRINT ******************************************************* */
    var svgheader = '<?xml version="1.0" encoding="utf-8"?>'
	+'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
    fs.writeFileSync('administrative_map_(wikiatlas_2014).svg', svgheader + window.d3.select("body").html());
    // console.log(window.d3.select("body").html());
 }
// END (D3JS) * * * * * * * * * * * * * * * * * * * * * * * *
);
