// Run me with:
// $ COLOR=#66AAFF node svgcreator.node.js > out.svg   #passing var COLOR the old way
/* ****************************************************** */
/* TIMER (performance check) **************************** */
// use: var timer = []; timer.push([now(),"comment"]); timer.push([now(),"comment"]); cl.timer(timer);
var timer = { records: [] };
timer.now = function(comment) { timer.records.push([new Date(), comment|| "" ]) };
timer.toll = function(comment){
  var rec = timer.records;
  for(var i=0; i<rec.length -1;i++){ 
    console.log("Period_"+i+"⟶"+(i+1)+" : " +((rec[i+1][0]-rec[i][0])/1000).toFixed(3)+"sec.          "+rec[i][1]); // local period x<=>x+1
  }	console.log("Period_0⟶"+(rec.length-1)+" : "+(rec[rec.length-1][0]-rec[0][0])/1000+"sec. (TOTAL) -----------------------"); // total period
};
/* ****************************************************** */
// COLOR=#66AAFF NAME=India ISO2=IN WEST=67.0 NORTH=37.5 EAST=99.0 SOUTH=05.0 WIDTH=1280 node jsdom@16-mini.js  #passing var COLOR the old way
const fs    = require("fs");
const jsdom = require("jsdom");
const wa    = require("../js/wikiatlas.js");
const { JSDOM } = jsdom;
//var timer = wa.timer;

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
  var mapType={ rich_background: true, base_administrative:false, base_topography:true, borders: true, labels:true }; timer.now("map function: defined");
  _window.locationMap("#hook1",WIDTH, ISO2, NAME, WEST, NORTH, EAST, SOUTH, true, mapType); timer.now("map projection: done");

  timer.toll(timer);
  console.log("Topo map, projected: "+ new Date() );
  // END svg design

  /* ***************************************************************** */
  /* SVG PRINT ******************************************************* */
  var svgheader = '<?xml version="1.0" encoding="utf-8"?>\n' // <?xml version="1.0" standalone="no"?>
  +'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';

  var loopOnL1 = function(hook,NAME,type) {
    timer.records = []; 				timer.now("Starting --------------------------------------- ");
    timer.now("mSqr"); timer.toll()
    var nodes = _window.d3.selectAll(hook+" #L1 > *")[0].length, // SO: /29278107/
        m = _window.d3.select(hook+" svg").attr("width")/100*5, // frame margin
        mSqr = m*m; 					timer.toll();
    for(var j=1;j<= nodes;j++){
        timer.now("LoopL1 > Starting --------------------------------------- ");
        timer.records = [];				timer.now("LoopL1 > for loop > Selector 1 //SLOW"); // SLOW below ************ //
        var selector1 = hook+' #L1 > *:nth-child('+j+')', 
            shape = _window.d3.select(selector1);
        timer.now("LoopL1 > for loop > opacity")
        var shapeName = shape.attr("name").replace(/ /g,"_"),
            shapeArea = shape.attr("area");
        shape.attr("style", "fill:#B10000;opacity:1;");	timer.now("LoopL1 > for loop > c")
        var selector2 = hook+' #L1_frames > *:nth-child('+j+')',
            c = shapeArea < mSqr;  				timer.now("LoopL1 > for loop > c is "+c+"// SLOW "); // SLOW below ************ //
        if(c){ _window.d3.select(selector2).attr("style", "visibility:visible;opacity:1;") }; 
        timer.now("LoopL1 > for loop > c is "+c);

        timer.now("LoopL1 > Printing ("+new Date().toTimeString().slice(0,8)+"):"+("  "+j).slice(-3)+" ; area: "+parseFloat(shapeArea).toPrecision(6)+" ; name: "+shapeName)
        var filename = NAME_+',_'+shapeName+type; 	timer.now("LoopL1 > html"+", "+filename); 
        var svgElement = _window.d3.select(hook);	timer.now("LoopL1 > xml"+", "+filename);
        var xml = svgElement.html(); 			timer.now("LoopL1 > fs.writeFileSync"+", "+filename+", "+ hook);
        fs.writeFileSync(filename, svgheader + xml); 	timer.now("LoopL1 > #L1 > * opacity: 0 : done");
        // Reset colors :
        _window.d3.selectAll(hook+" #L1 > *").attr("style","opacity:0;");		timer.now("LoopL1 > #L1_frames > * opacity: 0 : done. SLOW"+", "+filename+", "+hook+" // SLOW"); // SLOW below ************ //
        _window.d3.selectAll(hook+" #L1_frames > *").attr("style","opacity:0;");	timer.toll("### LoopL1, one L1 printed such as :");
    }
  };

  setTimeout(
    function() {

      _window.d3.selectAll("svg")
        .attr(':xmlns','http://www.w3.org/2000/svg')            // if not: file does not appear to have any style information
        .attr(':xmlns:xlink','http://www.w3.org/1999/xlink');   // if not: Namespace prefix xlink for href

      var hook = "#hook1";
      // 1 file :
      var filename = NAME_+'_location_map,_admin-topographic_relief_(2020)-en.svg';	timer.now("_location_map,_admin-topographic_relief_(2020)-en.svg");
      _window.d3.selectAll("#hook1 #L0").attr("style","fill-opacity:0.3");	timer.now("#L0 fill-opacity:0.3");
      _window.d3.selectAll("#hook1 #L0 [code="+ISO2+"]").remove();		timer.now("#L0 iso2.remove()");
      _window.d3.selectAll("#hook1 #L1").attr("style","opacity:0.6;");	timer.now("#L1 opacity:0.6");
      _window.d3.selectAll("#hook1 #L1 > *").attr("style","opacity:0;"); 	timer.now("#L1>* opacity:0");// at each loopOnL1 cycle, one L1 shape get opacity:1;
      var svgElement = _window.d3.select(hook); timer.now("html"+" "+filename); 
      var xml = svgElement.html(); timer.now("xml"+" "+filename);
      fs.writeFileSync(filename, svgheader + xml); timer.now("fs.writeFileSync SLOW",filename,hook); // SLOW ************ //
      console.log("Admin map, printed: "+ new Date() ); 
      timer.toll()
      //n   {NAME},_{Province_name}_locator_map,_admin-topographic_relief_(2020)-en.svg :
      var fileext =               '_locator_map,_admin-topographic_relief_(2020)-en.svg';
      loopOnL1('#hook1',NAME_,fileext);
      console.log("Admin map, printed: "+ new Date() );

      //1             {NAME}_location_map,_admin-topographic_relief_(2020).svg :
      var filename = NAME_+'_location_map,_admin-topographic_relief_(2020).svg'; // no -en = blank
      _window.d3.selectAll("#hook1 #L0_labels").remove(); 
      _window.d3.selectAll("#hook1 #L1_labels").remove();
      _window.d3.selectAll("#hook1 #Places").remove();
      _window.d3.selectAll("#hook1 #Places_labels").remove();
      fs.writeFileSync(filename, svgheader + _window.d3.select(hook).html())

      var filename = NAME_+"_location_map,_topographic_blue_(2020).svg"; // 1 file
      _window.d3.selectAll("#hook1 #L1").remove();
      _window.d3.selectAll("#hook1 #Relief_raster").remove();
      _window.d3.selectAll("#hook1 #Hillshade_raster").remove();
      _window.d3.selectAll("#hook1 #Disputed").remove();
      fs.writeFileSync(filename, svgheader + _window.d3.select(hook).html());

    },4000
  );

});