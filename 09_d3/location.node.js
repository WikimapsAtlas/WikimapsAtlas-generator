// Run me with: 
// $ COLOR=#66AAFF node svgcreator.node.js > out.svg   #passing var COLOR the old way

var jsdom = require('jsdom');
var fs    = require('fs');

jsdom.env(
  "<html><body></body></html>",        // CREATE DOM HOOK:
  [ 'http://d3js.org/d3.v3.min.js',    // JS DEPENDENCIES online ...
  '../js/d3.v3.min.js',
  '../js/b64.js',
  '../js/jquery-2.1.3.min.js', 
  '../js/topojson.v1.min.js', 
  '../js/queue.min.js', 
  '../js/wikiatlas.js' ],                 // ... & offline

/* COLLECT ENV.VARIABLES ******************************************* */
  function (err, window) {

console.log(typeof window.locationMap);  // => 'function'
console.log(typeof window.getTransform); // => 'function'
console.log(typeof window); // => 'function'
console.log(typeof window.zemba);        // => undefined

    var WEST  = process.env.WEST,     // <<============== get shell variables !
        NORTH = process.env.NORTH,
        EAST  = process.env.EAST,
        SOUTH = process.env.SOUTH,
        target= process.env.ITEM,
        title = process.env.ITEM,
        width = process.env.WIDTH;

    var DATE  = (new Date()).toISOString().slice(0,10).replace(/-/g,""),
        VERSION = process.env.VERSION,
        COMMAND = "make -f master.makefile ...";

/* ***************************************************************** */
/* D3js FUNCTION *************************************************** */

window.locationMap("body",800, target, title, WEST, NORTH, EAST, SOUTH, true);

// END svg design

/* ***************************************************************** */
/* SVG PRINT ******************************************************* */
    var svgheader = '<?xml version="1.0" encoding="utf-8"?>\n' // <?xml version="1.0" standalone="no"?>
  +'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';

  setTimeout(
      function() { 
        window.d3.select("svg")
            .attr(':xmlns','http://www.w3.org/2000/svg')            // if not: file does not appear to have any style information
            .attr(':xmlns:xlink','http://www.w3.org/1999/xlink');   // if not: Namespace prefix xlink for href
        fs.writeFileSync(title.replace(/ /g,"_") + '_administrative_map_(2015).svg', svgheader + window.d3.select("body").html()) },
      12000
  );

 }
// END (D3JS) * * * * * * * * * * * * * * * * * * * * * * * *
);
