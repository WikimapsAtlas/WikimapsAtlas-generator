// Run me with: 
// $ COLOR=#66AAFF node svgcreator.node.js > out.svg   #passing var COLOR the old way

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
        width = process.env.WIDTH;
// New paramater (if needed)
    var DATE  = (new Date()).toISOString().slice(0,10).replace(/-/g,"."),
        VERSION = process.env.VERSION;

/* ***************************************************************** */
/* D3js FUNCTION *************************************************** */
var mapType={ rich_background: true, base_administrative:false, base_topography:true, borders: true, labels:true };
window.locationMap("#hook1",800, iso2, name, WEST, NORTH, EAST, SOUTH, true, mapType);
console.log("Admin map, done: "+ new Date() );

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


var loopOnL1 = function(hook,name,type) {
      var nodes = window.d3.selectAll(hook+" #L1 > *")[0].length, // SO: /29278107/
        m = window.d3.select(hook+" svg").attr("width")/100*5, // frame margin
        mSqr = m*m;
      for(var j=1;j<= nodes;j++){
          window.d3.selectAll(hook+" #L1 > *").attr("style","opacity:0;");
            var selector1 = hook+' #L1 > *:nth-child('+j+')',
            node = window.d3.selectAll(selector1),
            nodeName = node.attr("name").replace(/ /g,"_"),
            nodeArea = node.attr("area");
            node.attr("style", "fill:#B10000;opacity:1;");            
          window.d3.selectAll(hook+" #L1_frames > *").attr("style","opacity:0;");
            var selector2 = hook+' #L1_frames > *:nth-child('+j+')',
            c = nodeArea < mSqr;
            if(c){ window.d3.selectAll(selector2).attr("style", "visibility:visible;opacity:1;") };

        console.log("Printing: "+j+" ; name: "+nodeName+" ; area: "+nodeArea+" .")
        var filename = name_+',_'+nodeName+type;
        fs.writeFileSync(filename, svgheader + window.d3.select(hook).html()); 
      }
}
var hook = "#hook1";
window.d3.selectAll("#hook1 #L0").attr("style","fill-opacity:0.3");
window.d3.selectAll("#hook1 #L0 [code="+iso2+"]").remove();

window.d3.selectAll("#hook1 #L1").attr("style","opacity:0.6;");
window.d3.selectAll("#hook1 #L1 > *").attr("style","opacity:0;");

// Type: L0 admin
fs.writeFileSync(name_+'_admin-topographic_(2015)-en.svg', svgheader + window.d3.select(hook).html());                 //1 <Country>_location_map,_admin-topographic_(2015)-en.svg
console.log("Admin map, printed: "+ new Date() );

loopOnL1('#hook1',name_,'_locator_map,_admin-topographic_(2015)-en.svg');                                             //n <Country>,_<Province>_locator_map,_admin-topographic_(2015)-en.svg
console.log("Admin map, printed: "+ new Date() );

//window.d3.selectAll("#hook1 #Relief_raster").remove();
//window.d3.selectAll("#hook1 #Hillshade_raster").remove();
//loopOnL1('#hook1',name__locator_map,_admin-topographic_(2015)-en.svg');                                              //n <Country>,_<Province>_locator_map,_admin-topographic_blue_(2015)-en.svg

window.d3.selectAll("#hook1 #L0_labels").remove();
window.d3.selectAll("#hook1 #L1_labels").remove();
window.d3.selectAll("#hook1 #Places").remove();
window.d3.selectAll("#hook1 #Places_labels").remove();
fs.writeFileSync(name_+'_location_map,_admin-topographic_blank_(2015).svg', svgheader + window.d3.select(hook).html())  //1 <Country>_location_map,_admin-topographic_blank_(2015).svg


fs.writeFileSync(name_+'_location_map,_topographic_blank_(2015).svg', svgheader + window.d3.select(hook).html());        //1 <Country>_location_map,_topographic_blank_(2015).svg

window.d3.selectAll("#hook1 #Disputed").remove();
window.d3.selectAll("#hook1 #L1").remove();
fs.writeFileSync(name_+'_location_map,_topographic_blank_(2015).svg', svgheader + window.d3.select(hook).html());        //1 <Country>_location_map,_topographic_blank_(2015).svg
    },4000
  );

 }
// END (D3JS) * * * * * * * * * * * * * * * * * * * * * * * *
);

/*




*/