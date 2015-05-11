// Run me with: 
// $ COLOR=#66AAFF node svgcreator.node.js > out.svg   #passing var COLOR the old way

var jsdom = require('jsdom');
var fs    = require('fs');

jsdom.env(
  "<html><body id='hook1'></body><body id='hook2'></body></html>",        // CREATE DOM HOOK:
  [ 'http://d3js.org/d3.v3.min.js',    // JS DEPENDENCIES online ...
  '../js/d3.v3.min.js',
  '../js/jquery-2.1.3.min.js',
  '../js/topojson.v1.min.js', 
  '../js/queue.min.js', 
  '../js/wikiatlas.js',
  '../js/b64.js' ],                 // ... & offline

/* COLLECT ENV.VARIABLES ******************************************* */
  function (err, window) {

//Check access to libraries
// console.log(typeof window.locationMap);  // => 'function' = ok

// Parameters from Shell to JS
    var WEST  = process.env.WEST, 
        NORTH = process.env.NORTH,
        EAST  = process.env.EAST,
        SOUTH = process.env.SOUTH,
        target= process.env.ISO2,
        title = process.env.NAME,
        width = process.env.WIDTH;
// New paramater (if needed)
    var DATE  = (new Date()).toISOString().slice(0,10).replace(/-/g,""),
        VERSION = process.env.VERSION,
        COMMAND = "make -f master.makefile ...";

/* ***************************************************************** */
/* D3js FUNCTION *************************************************** */

window.locationMap("#hook1",800, target, title, WEST, NORTH, EAST, SOUTH, true);
// window.localisator("#hook2",400,         name, WNES.W, WNES.N, WNES.E, WNES.S);
// window.locator("hook2",800, target, title, WEST, NORTH, EAST, SOUTH, true);

// END svg design

/* ***************************************************************** */
/* SVG PRINT ******************************************************* */
    var svgheader = '<?xml version="1.0" encoding="utf-8"?>\n' // <?xml version="1.0" standalone="no"?>
  +'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';

  setTimeout(
      function() { 
        window.d3.selectAll("svg")
            .attr(':xmlns','http://www.w3.org/2000/svg')            // if not: file does not appear to have any style information
            .attr(':xmlns:xlink','http://www.w3.org/1999/xlink');   // if not: Namespace prefix xlink for href
        // Type: L0 admin
        fs.writeFileSync(title.replace(/ /g,"_") + '_administrative_map_(2015).svg', svgheader + window.d3.select("body").html()) 

        // Type: L1 locator
       


        var nodes = window.d3.selectAll("#hook1 #L1 > *"); // SO: /29278107/
        for(var j=1;j<= nodes[0].length;j++){
            window.d3.selectAll("#hook1 #L1 > *").attr("style",null);
              var selector1 = '#hook1 #L1 > *:nth-child('+j+')',
              node = window.d3.selectAll(selector1),
              nodeName = node.attr("name"),
              nodeArea = node.attr("area");
              node.attr("style", "fill:#B10000;");

            window.d3.selectAll("#hook1 #L1_frames > *").attr("style","opacity:0;");
              var selector2 = '#hook1 #L1_frames > *:nth-child('+j+')',
              m = window.d3.select("svg").attr("width")/100*5, // frame margin
              c = nodeArea < m*m;
              if(c){ window.d3.selectAll(selector2).attr("style", "visibility:visible;opacity:1;") };

          console.log("Paint & print: "+j+", name: "+nodeName+" ; area: "+nodeArea+"; .")
          fs.writeFileSync(title.replace(/ /g,"_") +',_'+ nodeName.replace(/ /g,"_")+'_locator_map_(2015).svg', svgheader + window.d3.select("body").html()) 
         }
/** /
        //Type: topo
        window.d3.select(".raster").attr(":xlink:href", "")
/**/
      },
      12000
  );

 }
// END (D3JS) * * * * * * * * * * * * * * * * * * * * * * * *
);
