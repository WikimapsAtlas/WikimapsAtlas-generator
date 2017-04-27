var jsdom = require('jsdom');
var fs    = require('fs');

jsdom.env(
  "<html><body><div id='hook1'></div><div id='hook2'></div></body></html>",        // CREATE DOM HOOK:
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
        iso2= process.env.ISO2,
        name = process.env.NAME,
        name_ = name.replace(/ /g,"_"),
        width = process.env.WIDTH || 800;
// New paramater (if needed)
    var DATE  = (new Date()).toISOString().slice(0,10).replace(/-/g,"."),
        VERSION = process.env.VERSION;

/* ***************************************************************** */
/* D3js FUNCTION *************************************************** */
  var mapType={ rich_background: true, base_administrative:true, base_topography:false, borders: true, labels:true };
  window.locationMap("#hook1",width, iso2, name, WEST, NORTH, EAST, SOUTH, true, mapType);
  console.log("Admin map, projected: "+ new Date() );
// END svg design

/* ***************************************************************** */
/* SVG PRINT ******************************************************* */
  var svgheader = '<?xml version="1.0" encoding="utf-8"?>\n' // <?xml version="1.0" standalone="no"?>
    +'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';

  var loopOnL1 = function(hook,name,type) {
    var nodes = window.d3.selectAll(hook+" #L1 > *")[0].length, // SO: /29278107/
      m = window.d3.select(hook+" svg").attr("width")/100*5, // frame margin
      mSqr = m*m;
    for(var j=1;j<= nodes;j++){
      var selector1 = hook+' #L1 > *:nth-child('+j+')',
        shape = window.d3.selectAll(selector1),
        shapeName = shape.attr("name").replace(/ /g,"_"),
        shapeArea = shape.attr("area");
        shape.attr("style", "fill:#B10000;opacity:1;");
      var selector2 = hook+' #L1_frames > *:nth-child('+j+')',
      c = shapeArea < mSqr;
      if(c){ window.d3.selectAll(selector2).attr("style", "visibility:visible;opacity:1;") };

      console.log("Printing ("+new Date().toTimeString().slice(0,8)+"):"+("  "+j).slice(-3)+" ; area: "+parseFloat(shapeArea).toPrecision(6)+" ; name: "+shapeName)
      var filename = name_+',_'+shapeName+type;
      fs.writeFileSync(filename, svgheader + window.d3.select(hook).html());
      // Reset colors :
      window.d3.selectAll(hook+" #L1 > *").attr("style","opacity:0;");
      window.d3.selectAll(hook+" #L1_frames > *").attr("style","opacity:0;");
    }
  };

  setTimeout(
    function() {

    window.d3.selectAll("svg")
        .attr(':xmlns','http://www.w3.org/2000/svg')            // if not: file does not appear to have any style information
        .attr(':xmlns:xlink','http://www.w3.org/1999/xlink');   // if not: Namespace prefix xlink for href

    var hook = "#hook1"
// 1 file
var filename = name_+'_location_map,_admin_relief_(2016)-en.svg';
    fs.writeFileSync(filename, svgheader + window.d3.select(hook).html())
    console.log("Admin location relief map, printed: "+ new Date() );

//n  {NAME},_{Province_name}_locator_map,_admin_relief_(2016)-en.svg :
var fileext  =             '_locator_map,_admin_relief_(2016)-en.svg';
    loopOnL1('#hook1',name_,fileext);
    console.log("Admin locator relief map, printed: "+ new Date() );

//n {NAME},_{Province}_locator_map,_admin_blue_(2016)-en.svg :
var fileext  =       '_locator_map,_admin_blue_(2016)-en.svg';
    window.d3.selectAll("#hook1 #Relief_raster").remove();
    window.d3.selectAll("#hook1 #Hillshade_raster").remove();
    loopOnL1('#hook1',name_,fileext);

//1             {NAME}_location_map,_admin_blue_(2016).svg :
var filename = name_+'_location_map,_admin_blue_(2016).svg'; // no -en = blank
    window.d3.selectAll("#hook1 #L0_labels").remove();
    window.d3.selectAll("#hook1 #L1_labels").remove();
    window.d3.selectAll("#hook1 #Places").remove();
    window.d3.selectAll("#hook1 #Places_labels").remove();
    fs.writeFileSync(filename, svgheader + window.d3.select(hook).html())

    },4000
  );

 }
// END (D3JS) * * * * * * * * * * * * * * * * * * * * * * * *
);
