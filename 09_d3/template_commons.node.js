var fs    = require('fs');
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

var content = '{{wikimaps_topic|west='+WEST+'|=north'+NORTH+'|south='+SOUTH+'|east='+EAST+'|name='+name+'|version='+VERSION+'}}';
fs.writeFileSync('tpl.commons.txt', content);
//  window.localisator("#hook2", 600, name, name, WEST, NORTH, EAST, SOUTH);
//  console.log("Globe map, done: "+ new Date() );
//  fs.writeFileSync(name_+"-orthographic_(2016).svg", svgheader + window.d3.select("#hook2").html())
//  window.d3.select("#hook2").remove();
// END svg design
