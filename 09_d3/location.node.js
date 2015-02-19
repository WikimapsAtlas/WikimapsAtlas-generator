// Run me with: 
// $ COLOR=#66AAFF node svgcreator.node.js > out.svg   #passing var COLOR the old way
//
var jsdom = require('jsdom');
var fs    = require('fs');

// var d3 = require('../js/d3.v3.min');
// var topojson = require('../js/topojson.v1.min');
// var wikiatlas = require('../js/wikiatlas');
console.log(typeof wikiatlas.locationMap); // => 'function'
console.log(typeof wikiatlas.getTransform); // => 'function'
console.log(typeof wikiatlas.zemba); // => undefined

jsdom.env(
  "<html><body></body></html>",        // CREATE DOM HOOK:
  [ 'http://d3js.org/d3.v3.min.js',    // JS DEPENDENCIES online ...
  '../js/d3.v3.min.js', '../js/wikiatlas.pure.js' ],                 // ... & offline

/* COLLECT ENV.VARIABLES ******************************************* */
  function (err, window) {

    var WEST  = process.env.WEST,     // <<============== IMPORTANT !!
        NORTH = process.env.NORTH,
        EAST  = process.env.EAST,
        SOUTH = process.env.SOUTH,
        target= process.env.ITEM,
        title = process.env.ITEM,
        width = process.env.WIDTH;

    var DATE  = (new Date()).toISOString().slice(0,10).replace(/-/g,""),
        VERSION = process.env.VERSION,/*
         = process.env.,
         = process.env. */
         COMMAND = "make -f master.makefile ...";

/* ***************************************************************** */
/* D3js FUNCTION *************************************************** */
window.locationMap("body",800, target, title, WEST, NORTH, EAST, SOUTH);

/* ***************************************************************** */
/* RASTER INJECTION ************************************************ */
var svg = window.d3.select("body").append("svg");
var addBaseRaster= function(url,svg){
  var i64 = fs.readFileSync(url);
  var id = url.replace(/(\.|\/|img|gis|tif|b64)/g, "")
  svg.append("g")
            //.attr("transform","scale(1, 1)")
            .attr(":inkscape:groupmode","layer")
            .attr({'id': id,':inkscape:label':'topography_(raster)'})
        .attr("class", "bg-image raster")
        .attr("y","0")
        .attr("x","0")
        .attr("style", "fill-opacity:1")
    .append("image")
      .attr(":xlink:href", "data:image/png;base64," + i64) // replace link by data URI
      .attr("width", width)
      .attr("height", width);
};
// 1st img is below, then added uppon.
//addBaseRaster('./img/color.gis.tif.b64');
//addBaseRaster('./img/img0_gis.gis.tif.b64');
addBaseRaster('./img/img1.gis.png.b64', svg);
addBaseRaster('./img/img2_gis.gis.tif.b64', svg);

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
