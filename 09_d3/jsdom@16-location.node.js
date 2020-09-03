// COLOR=#66AAFF NAME=India ISO2=IN WEST=67.0 NORTH=37.5 EAST=99.0 SOUTH=05.0 WIDTH=1280 node jsdom@16-mini.js  #passing var COLOR the old way
const fs    = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

/* COLLECT ENV.VARIABLES ******************************************* */
// Parameters from Shell to JS
var WEST  = process.env.WEST,
    NORTH = process.env.NORTH,
    EAST  = process.env.EAST,
    SOUTH = process.env.SOUTH,
    ISO2  = process.env.ISO2,
    NAME  = process.env.NAME,
    NAME_ = NAME.replace(/ /g,"_"),
    WIDTH = process.env.WIDTH || 800;
// New paramater (if needed)
var DATE  = (new Date()).toISOString().slice(0,10).replace(/-/g,"."),
    VERSION = process.env.VERSION || DATE;

/* ************************************************************************* */
/* Add scripts to head ***************************************************** */
var jsFiles = [
    '../js/d3.v3.min.js',
    '../js/jquery-2.1.3.min.js',
    '../js/topojson.v1.min.js',
    '../js/queue.min.js',
    '../js/wikiatlas.js',
    '../js/b64.js'
];
var scriptsContent = ``;
for(var i =0; i< jsFiles.length;i++){
    console.log("fsRead file: ", __dirname + '/'+ jsFiles[i])
  let scriptContent = fs.readFileSync( jsFiles[i], 'utf8');
  scriptsContent = scriptsContent + `
  /* ******************************************************************************************* */
  /* `+jsFiles[i]+` **************************************************************************** */
  `+scriptContent;
};

var html = `
    <!DOCTYPE html>
        <head>
            <!-- scripts texts will come here -->
        </head>
        <body>
            <div id='hook1'></div>
            <div id='hook2'></div>
        </body>
    </html>`;

/* ************************************************************************* */
/* JSDOM init ************************************************************** */   
var _window = new JSDOM(html, {
        runScripts:"dangerously",
        resources: "usable" 
    }).window;

let scriptElement = _window.document.createElement('script');
scriptElement.textContent = scriptsContent;
_window.document.head.appendChild(scriptElement);
// console.log(_window.document.documentElement.childNodes[2].outerHTML); // body


/* ************************************************************************* */
/* JSDOM > Run page ******************************************************** */
_window.document.addEventListener('DOMContentLoaded', () => {
    console.log('/* JSDOM > Run page ******************************************************** */')

    /* ***************************************************************** */
/* D3js FUNCTION *************************************************** */
 console.log(WIDTH, ISO2, NAME, WEST, NORTH, EAST, SOUTH, true, mapType)
 var mapType={ rich_background: true, base_administrative:true, base_topography:false, borders: true, labels:true };
 _window.locationMap("#hook1",WIDTH, ISO2, NAME, WEST, NORTH, EAST, SOUTH, true, mapType);
 console.log("Admin map, projected: "+ new Date() );
// END svg design

/* ***************************************************************** */
/* SVG PRINT ******************************************************* */
var svgheader = '<?xml version="1.0" encoding="utf-8"?>\n' // <?xml version="1.0" standalone="no"?>
+'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';

var loopOnL1 = function(hook,NAME,type) {
   var nodes = _window.d3.selectAll(hook+" #L1 > *")[0].length, // SO: /29278107/
       m = _window.d3.select(hook+" svg").attr("width")/100*5, // frame margin
       mSqr = m*m;
   for(var j=1;j<= nodes;j++){
       var selector1 = hook+' #L1 > *:nth-child('+j+')',
       shape = _window.d3.selectAll(selector1),
       shapeName = shape.attr("name").replace(/ /g,"_"),
       shapeArea = shape.attr("area");
       shape.attr("style", "fill:#B10000;opacity:1;");
       var selector2 = hook+' #L1_frames > *:nth-child('+j+')',
       c = shapeArea < mSqr;
       if(c){ _window.d3.selectAll(selector2).attr("style", "visibility:visible;opacity:1;") };

       console.log("Printing ("+new Date().toTimeString().slice(0,8)+"):"+("  "+j).slice(-3)+" ; area: "+parseFloat(shapeArea).toPrecision(6)+" ; name: "+shapeName)
       var filename = NAME_+',_'+shapeName+type;
       fs.writeFileSync(filename, svgheader + _window.d3.select(hook).html());
       // Reset colors :
       _window.d3.selectAll(hook+" #L1 > *").attr("style","opacity:0;");
       _window.d3.selectAll(hook+" #L1_frames > *").attr("style","opacity:0;");
   }
};

setTimeout(
   function() {
   _window.d3.selectAll("svg")
       .attr(':xmlns','http://www.w3.org/2000/svg')            // if not: file does not appear to have any style information
       .attr(':xmlns:xlink','http://www.w3.org/1999/xlink');   // if not: Namespace prefix xlink for href

   var hook = "#hook1"
   // 1 file :
   var filename = NAME_+'_location_map,_admin_relief_(2020)-en.svg';
   // console.log(filename)

   // console.log(_window.d3.select(hook).html())
       fs.writeFileSync(filename, svgheader + _window.d3.select(hook).html())
       console.log("Admin location relief map, printed: "+ new Date() );


   //n  {NAME},_{Province_name}_locator_map,_admin_relief_(2020)-en.svg :
   var fileext  =             '_locator_map,_admin_relief_(2020)-en.svg';
       loopOnL1('#hook1',NAME_,fileext);
       console.log("Admin locator relief map, printed: "+ new Date() );

   //n {NAME},_{Province}_locator_map,_admin_blue_(2020)-en.svg :
   var fileext  =       '_locator_map,_admin_blue_(2020)-en.svg';
       _window.d3.selectAll("#hook1 #Relief_raster").remove();
       _window.d3.selectAll("#hook1 #Hillshade_raster").remove();
       loopOnL1('#hook1',NAME_,fileext);

   //1             {NAME}_location_map,_admin_blue_(2020).svg :
   var filename = NAME_+'_location_map,_admin_blue_(2020).svg'; // no -en = blank
       _window.d3.selectAll("#hook1 #L0_labels").remove();
       _window.d3.selectAll("#hook1 #L1_labels").remove();
       _window.d3.selectAll("#hook1 #Places").remove();
       _window.d3.selectAll("#hook1 #Places_labels").remove();
       fs.writeFileSync(filename, svgheader + _window.d3.select(hook).html())

   },4000
 );

});