/**
* Created with Wikiatlas.
* User: hugolpz
* Version: 2014.09.04 */
/* Sister js ******************************************** */
/* http://wikimapsatlas.github.io/static/js/wikimaps.atlas.js */
/* ****************************************************** */
/* SUGAR ************************************************ */

// Function Click > Console (for fun)
function click(a){ var name = a.properties.name || a.id ; console.log(name);}
function dblclick(a){window.location.assign("http://en.wikipedia.org/wiki/"+a.properties.name, '_blank');}

/* MATH TOOLKIT ***************************************** */
function parallel(φ, λ0, λ1) {
  if (λ0 > λ1) λ1 += 360;
  var dλ = λ1 - λ0,
      step = dλ / Math.ceil(dλ);
  return d3.range(λ0, λ1 + 0.5 * step, step).map(function(λ) { return [normalise(λ), φ]; });
}
function normalise(x) {
  return (x + 180) % 360 - 180;
}

/* ****************************************************** */
/* WIKIPEDIA CSS MODULE ********************************* */
var wp={};
/* Strokes & dash *************************************** */
wp.stroke = {
	0: "stroke:none;stroke-linejoin:round;",
	no:"stroke:none;stroke-linejoin:round;",
	sm:"stroke-width:1.0px;stroke-linejoin:round;",
	md:"stroke-width:1.5px;stroke-linejoin:round;",
	lg:"stroke-width:2.0px;stroke-linejoin:round;",
	xl:"stroke-width:3.0px;stroke-linejoin:round;"}
wp.dash = { // http://jsfiddle.net/tgq925aL/
	no: "stroke-dasharray:none;",		//
	sm: "stroke-dasharray: 4,4;",		// normal
	md: "stroke-dasharray: 8,4;",		// 
	xl: "stroke-dasharray: 16,4,3,4;"	// i18l
};
wp.label = {
	all : "font-family:Helvetica Neue, Helvetica, Arial, sans-serif;",
	admin:"fill:#646464;",
	water:"fill:#0978AB;",
	transparent:"opacity:0.3;",
	start : "text-anchor:start;",
	middle : "text-anchor:middle;",
	end : "text-anchor:end;",
	xxs: "font-size:6px;",
	xs: "font-size:8px;",
	sm: "font-size:10px;",
	md: "font-size:12px;",
	xl: "font-size:16px;font-weight:900;",
	xxl: "font-size:20px;font-weight:900;"
}
wp.poi = {
	admin:"fill:#646464;",
	water:"fill:#0978AB;",	
	xs: "font-size: 8px;",
	sm: "font-size:10px;",
	md: "font-size:12px;",
	xl: "font-size:16px;",
	xxl:"font-size:20px;"
}
/* Location map ***************************************** */
// https://en.wikipedia.org/wiki/Wikipedia:WikiProject_Maps/Conventions
wp.location = { 
	no:        "fill:none;",
	locator:   "fill:#B10000;",
	focus :    "fill:#FEFEE9;",
	land  :    "fill:#E0E0E0;",
	border:    "fill: none; stroke:#646464;",	// line_sm
	waterline: "fill: none; stroke:#0978AB;",	// line_sm
	waterarea: "fill:#C6ECFF;",
	temp: "fill-opacity:0.6;stroke-dasharray:4,4;dasharray:4, 4;",
};
/* Hash patterns **************************************** */
//Pattern injection : disputed-in, disputed-out
var injectPattern = function(selector){
	// location maps. Note: "hash2_4" means "hash pattern overlay, 2px colored (on), 4px not colored (off)".
	var pattern = d3.select(selector).append("defs")
		.append("pattern")
			.attr({ id:"hash2_4", width:"6", height:"6", patternUnits:"userSpaceOnUse", patternTransform:"rotate(-45)"})
		.append("rect")
			.attr({ width:"2", height:"6", transform:"translate(0,0)", fill:"#E0E0E0" }); // (!) fill: wp.location.land
	 var pattern = d3.select(selector).append("defs")
		.append("pattern")
			.attr({ id:"hash4_2", width:"6", height:"6", patternUnits:"userSpaceOnUse", patternTransform:"rotate(-45)"})
		.append("rect")
			.attr({ width:"2", height:"6", transform:"translate(0,0)", fill:"#FEFEE9" }); // (!) fill: wp.location.focus
// To style shapes:
//    .attr("fill", function(d){ return d.properties.L0 === target? "url(#hash2_4)": "url(#hash4_2)"} )
}

/* Topographic map ************************************** */
// http://roadtolarissa.com/blog/2015/01/04/coloring-maps-with-d3/
// D: Domain, D: Data. 0m,500m,3000m,5000m are of the domain.
// http://gka.github.io/palettes/#diverging|c0=#002040,#71ABD8,#D8F2FE|c1=#94BF8B,#A8C68F,#BDCC96,#D1D7AB,#E1E4B5,#EFEBC0,#E8E1B6,#DED6A3,#D3CA9D,#CAB982,#C3A76B,#B9985A,#AA8753,#AC9A7C,#BAAE9A,#CAC3B8,#E0DED8,#F5F4F2,#FFFFFF|steps=30|bez0=1|bez1=0|coL0=0|coL1=0
wp.topographic = {
	water: function(){ return d3.scale.threshold().range(['#002040','#71ABD8','#D8F2FE']);},
	plain: function(){ return d3.scale.threshold().range([])},
	hill:  function(){ return d3.scale.threshold().range([])},
	mount: function(){ return d3.scale.threshold().range([])},
}
/*
if(min<0){ water; }
if((min<  500) && (max >   0 && max< 9000)) { return plain }
if((min< 2000) && (max > 500 && max< 9000)) { return hill  }
if((min< 9000) && (max >2000 && max< 9000)) { return mount }
*/

/* ****************************************************** */
/* LOCATOR MAP MODULE *********************************** */
var graticule = function($D3selector,step) {
	d3.geo.graticule().step([step, step]);
	$D3selector.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)
		.style({'fill': 'none', 'stroke': '#0978AB', 'stroke-linejoin': 'round'})
		.style({'stroke-width': 0.5 });
}


/* ****************************************************** */
/* LOCATOR MAP MODULE *********************************** */
var localisator = function (hookId,width, title, WEST, NORTH, EAST, SOUTH) {
/* Init ************************************************* */
	var width  = width,
    	height = width;
	var lon_central = function(){ 
		var num;
		if(EAST<WEST){ num= -(WEST+EAST)/2+180; }
		else{ num= -(WEST+EAST)/2; }
		return num;
	};

	var proj = d3.geo.orthographic()
    	.scale(1/2*width)
    	.rotate([ lon_central(), -(NORTH+SOUTH)/2 +10 ])
		.translate([width / 2 , height / 2 ])
		.clipAngle(90);

	var path = d3.geo.path()
		.projection(proj);

/* SVG container **************************************** */
	var svg = d3.select(hookId).append("svg")
		.attr("id", title+"-orthographic_globe_locator_(wikiatlas_2014)")
		.attr("width", width)
		.attr("height", height)
		.call(d3.behavior.drag()
		  .origin(function() { 
			var rotate = proj.rotate(); 
			return {x: 2 * rotate[0], y: -2 * rotate[1]}; 
		})
		  .on("drag", function() {
			proj.rotate([d3.event.x / 2, -d3.event.y / 2, proj.rotate()[2]]);
			svg.selectAll("path").attr("d", path);
		  }))
		.on("dblclick", function() {
			proj.rotate([ lon_central(), -(NORTH+SOUTH)/2 +10 ]);
			svg.selectAll("path").attr("d", path);
		});

/* SVG background *************************************** */
// Blue circle
	svg.append("circle")
		.attr("class", "water")
		.attr("cx", width/2)
		.attr("cy", height/2)
		.attr("r", width/2 )
		.style({'fill':'#C6ECFF'})
		.style({'stroke': '656565', 'stroke-width': 1.5});
	// Gradiant	settings
	var gradient = svg.append("svg:defs")
		.append("svg:linearGradient")
		.attr("id", "gradient")
		.attr("x1", "0%")
		.attr("y1", "0%")
		.attr("fx1", "30%")
		.attr("fy1", "30%")
		.attr("x2", "100%")
		.attr("y2", "100%")
		.attr("spreadMethod", "pad");
	gradient.append("svg:stop") 		// middle step setting
		.attr("offset", "50%")
		.attr("stop-color", "#FFF")
		.attr("stop-opacity", 0.3);
	gradient.append("svg:stop") 		// final step setting
		.attr("offset", "100%")
		.attr("stop-color", "#009")
		.attr("stop-opacity", 0.3);
	// Gradiant-circle
	var circle = svg.append('circle') 	// append gradient to circle
		.attr('cx', width / 2)
		.attr('cy', height / 2)
		.attr('r', width/2 )
		.attr('fill', 'url(#gradient)');
	

/* GIS data injection *********************************** */
d3.json("./output/world-1e3/administrative.topo.json", function(error, Stone) {
// data organized
    var countries = topojson.feature(Stone, Stone.objects.admin_0),
        subunits  = topojson.feature(Stone, Stone.objects.admin_1),
        disputed  = topojson.feature(Stone, Stone.objects.disputed),
        places    = topojson.feature(Stone, Stone.objects.places),
        neighbors = topojson.neighbors(Stone.objects.admin_1.geometries),
/**/	i = -1,
/**/    n = countries.length;
	
	var country = svg.selectAll(".country")
		.data(countries.features)
	.enter().append("path") 
		.attr("id", function(d){ return d.id.replace(/ |\.|'/g, "_") } )
		.attr("name", function(d){ return d.id } )
		.attr("class", "country")
		.attr("style","fill:#FDFBEA")
		.attr("d", path);
	
	var	focus = d3.selectAll("#"+title.replace(/ |\.|'/g, "_"))
			.attr("style","fill:#B10000;");
	
	var boundaries = svg.append("path")
        //.datum( topojson.mesh(world, world.objects.countries, function(a,b) { if (a!==b){var ret = b;}return ret;}))
		.datum( topojson.mesh(Stone, Stone.objects.admin_0, function(a,b) { return a!==b; }))
		.attr("class", "boundary")
		.attr("style","fill:none;stroke: #656565; stroke-width: 0.5;")
		.attr("d", path);
	
	var graticule = svg.append("path")
		.datum(d3.geo.graticule().step([20,20]))
		.attr("class", "graticule")
		.attr("style","fill:none;stroke:#777;stroke-width: 0.5;stroke-opacity: 0.5")
		.attr("d", path);

	var coast = svg.append("path")
        //.datum( topojson.mesh(world, world.objects.countries, function(a,b) { if (a==b){var ret = b;}return ret;}))
		.datum( topojson.mesh(Stone, Stone.objects.admin_0, function(a,b) { return a==b; }))
        .attr("class", "Coast_border")
		.attr("style", "fill: none; stroke: #0978AB; stroke-linejoin: round;")
		.style({'stroke-width': 0.5 })
		.attr("d", path);
	
	
	//* Red polygon drawing
	var redwindow = function(WEST,SOUTH,EAST,NORTH,hook) { 
		var geoRect = {type: "Polygon", coordinates: [
			[[WEST-5,SOUTH-5]]
			  .concat(parallel(NORTH+5, WEST-5, EAST+5))
			  .concat(parallel(SOUTH-5, WEST-5, EAST+5).reverse())
			]};
		var area = d3.geo.path().projection(function(geoRect){return geoRect}).area(geoRect);
		console.log(area);
		if(area <250){
			hook.append("path")
			.datum(geoRect)
				.style({'fill': '#B10000', 'fill-opacity': 0.3, 'stroke': '#B10000', 'stroke-linejoin': 'round','stroke-width': 1 })
				.attr("d", path);
			}
		}
	redwindow (WEST,SOUTH,EAST,NORTH,svg)
	var label = svg.append("text")
		.attr("x", width / 2)
		.attr("text-anchor","middle")
		.text(title)
		.attr("y", height * 57/100 );


/* LOOP WORLD ****************************************************** */
/*
var step =  function() {
	// var i=52;
	if (++i >= n) { i = 0} ;
	svg.transition();
	var centroid = d3.geo.path()
		.projection(function(d) { return d; })
		.centroid;
	var area = d3.geo.path()
		.projection(function(d) { return d; })
		.area;
	var bounds = d3.geo.path()
		.projection(function(d) { return d; })
		.bounds;
 
	d3.transition()
		.delay(0)
		.duration(3000)
		.tween("rotate", function() {	
			label.text(countries[i].id);
			country.style("fill", function(d, j) { return j === i ? "#B10000" : "#FDFBEA";  });
			var point = centroid(countries[i]);
			var surface  = area(countries[i]);
			var bb = bounds(countries[i]);
			console.log(countries[i].id);
			console.log("area: "+surface+"; bb: "+ JSON.stringify(bb)+"/"+i );
			return function(t) {
				projection2.rotate([-point[0], -point[1]+10]); // area of interest slide 10⁰ up
				svg.selectAll("path").attr("d", path);
				
				var red_rect = function(){
					if(countries[i].id === "Fiji"){  bb[0][0]=177;bb[1][0]=-179; }
					if(countries[i].id === "Russia"){ bb[0][0]=19.5;bb[1][0]=-169;}
					if(countries[i].id === "New Zealand"){ bb[0][0]=165.5;bb[1][0]=-176; }
					if( true ){ return t=
						{type: "Polygon", coordinates: [ 
						[[bb[0][0]-5,bb[0][1]-5]]
						.concat(parallel(bb[1][1]+5, bb[0][0]-5, bb[1][0]+5))
						.concat(parallel(bb[0][1]-5, bb[0][0]-5, bb[1][0]+5).reverse())
						]}
					}
				}
				
				// draw polygon (red frame) bigger than bb:
				if (surface <15) { // is visible
					redwindow.datum(//LineString 
						red_rect
					)
					.style({'fill': '#B10000', "opacity": 1, 'fill-opacity': 0.3})
					.style({'stroke-width': 1, 'stroke-opacity': 1, 'stroke': '#B10000', 'stroke-linejoin': 'round' })
					.attr("d", path);
				} else if (surface >15 ) { // isn't visible
					redwindow.style({'opacity': 0}) ;
				}

			};
		}) // runs transition
		.each("end", function(){ return step(); } );
  };
step(); */

});

};


/* ****************************************************** */
/* LOCATION MAP MODULE  ********************************* */

var locationMap = function(hookId, width, target, title, WEST, NORTH, EAST, SOUTH, nodejs){
	var nodejs = 0 || nodejs;
	console.log("locationMap()");
/* SETTINGS ******************************************************************** */
// SVG injection:
var width  = 600 || width,
	title_ = title.replace(/ /g, "_").replace(/(_)+/g, "_"),
	titleId = title.replace(/[^a-zA-Z0-9]/gi, "_").replace(/(_)+/g, "_");
var svg = d3.select(hookId).append("svg:svg")
        .attr('version', '1.1')
		.attr("name", title_+"_administrative_map_\(2015\)")
		.attr("id", titleId)
		.attr("width", width)
		//.attr(':xmlns:xlink','').attr('xmlns:xlink','').attr('xlink','')
//		.attr(':xmlns:geo','http://www.example.com/boundingbox/')
		.attr(':xmlns:inkscape','http://www.inkscape.org/namespaces/inkscape')
		.attr(":xmlns:cc","http://creativecommons.org/ns#");
	/*  var svg = d3.select(hookId).append("svg").attr("width", width)
	svg.attr(':xmlns','http://www.w3.org/2000/svg')		// if not: file does not appear to have any style information
			.attr(':xmlns:xlink','http://www.w3.org/1999/xlink')// if not: Namespace prefix xlink for href
			// no = client: no img; crowbar: raster yes; node: raster yes ?
			.attr(":xmlns:rdf","http://www.w3.org/1999/02/22-rdf-syntax-ns#") 
	; */

	$('svg').attr('xmlns:geo', 'http://example.com/boundingbox/');
	//	d3.ns.qualify("geo:bb");
	svg.append(':geo:g')
//		.attr(':xmlns:geo','http://www.example.com/boundingbox/')
		.attr(':geo:id','geo')
		.attr(':geo:syntax', "WSEN bounding box in decimal degrees")
		.attr(':geo:west',  WEST)
		.attr(':geo:south', SOUTH)
		.attr(':geo:east',  EAST)
		.attr(':geo:north', NORTH)
		.attr(':geo:title', title);
	
// Projection default
var projection = d3.geo.mercator()
		.scale(1)
		.translate([0, 0]);
var path = d3.geo.path()
		.projection(projection); //  .pointRadius(4)

injectPattern("svg"); //Pattern injection : disputed-in, disputed-out
console.log("pattern()");


// raster images urls
var root = "../output/"+target;
if (nodejs) { root = "http://localhost:8080/output/"+target; } 
var url1  = root+"/administrative.topo.json", // https://rugger-demast.codio.io/output/"
	url2 = root+"/color.jpg.b64",
	url3 = root+"/trans.png.b64";

 queue()
	.defer(d3.json, url1)
	.defer(d3.text, url2)
	.defer(d3.text, url3)
	.await(makeMap); /**/
/** /	
var Stone = (function () {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': url,
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
})(); /**/
	
/* *************************************************************** */
/* *************************************************************** */
/* *************************************************************** */

	// Data (getJSON: TopoJSON)
function makeMap(error, json, file2, file3){
		console.log("MakeMap: start");
		//console.log("d3.json()");
/* DATA ********************************************************** */
    var admin_0   = topojson.feature(json, json.objects.admin_0),
        admin_1   = topojson.feature(json, json.objects.admin_1),
		L1_focus  = admin_1.features.filter(function(d) { return d.properties.L0 === target; }),
        disputed  = topojson.feature(json, json.objects.disputed),
        places    = topojson.feature(json, json.objects.places),
		coast     = topojson.mesh(json, json.objects.admin_0, function(a,b) { return a===b;}),
        L0_border = topojson.mesh(json, json.objects.admin_0, function(a,b) { return a!==b;}),
		L1_border = topojson.mesh(json, json.objects.admin_1, function(a,b) { 
			return a !==b && a.properties.L0 === b.properties.L0 && a.properties.L0 === target;
		});
		// neighbors = topojson.neighbors(Stone.objects.admin_1.geometries); // coloring: full line

/* STYLES ******************************************************** */
	var S = {};
  		S.focus = wp.location.focus+ wp.stroke.no,
		S.land  = wp.location.land + wp.stroke.no,
		S.coast = wp.location.waterline+ wp.stroke.md,
		S.water = wp.location.waterarea,
		S.L0_border = wp.location.border + wp.stroke.md + wp.dash.xl,
		S.L1_border = wp.location.border + wp.stroke.md + wp.dash.no,
		S.Places_labels = wp.label.all+wp.label.admin+wp.label.sm,
		S.L1_labels     = wp.label.all+wp.label.admin+wp.label.sm+wp.label.middle+wp.label.transparent;

	
	// Projection recalculated
	var t = getTransform(admin_0,0,width, projection); // NEED BB. Island are tied otherwise.
	projection
		.scale(t.scale)
		.translate(t.translate);
	svg.attr("height", t.height);
	
	//oceans
	var bg = svg.append("g")
			.attr(":inkscape:groupmode","layer")
			.attr({'id':'bg',':inkscape:label':'background'});
	
	bg.append("g").attr("id","water")
		.attr("style", S.water)
	  .append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width",    width)
		.attr("height", t.height);


	bg.append("g")
	//.attr("transform","scale(1, 1)")
		.attr(":inkscape:groupmode","layer")
		.attr({'id':'topography_raster',':inkscape:label':'topography_(raster)'})
	  .append("image")
		.attr("width", width)
		.attr("height", t.height)
		.attr("xlink:xlink:href", "data:image/jpg;base64," + file2); // replace link by data URI // replace href link by data URI, d3js + client handle the missing xlink

/* Polygons ****************************************************** */
//Append L0 polygons 
	var L0 = svg.append("g")
 		.attr(":inkscape:groupmode","layer")
		.attr({'id':'L0',':inkscape:label':'L0'})
	.selectAll(".countries")
        .data(admin_0.features)
      .enter().append("path")
        .attr("class", "L0")
        .attr("name", function(d) { return d.properties.name; })
        .attr("style", function(d){ return d.properties.L0 === target? S.focus : S.land; } )
        //.style("fill", function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return subunits[n].color; }) + 1 | 0); })  // coloring: fill
        .attr("d", path)
		.on("click", click);
 
//Append L1 polygons 
    var L1 = svg.append("g")
 		.attr(":inkscape:groupmode","layer")
		.attr({'id':'L1',':inkscape:label':'L1'})
		.attr("style", S.focus)
	.selectAll(".subunit")
        .data(L1_focus)
      .enter().append("path")
        .attr("name", function(d) { return d.id; })
//        .attr("style", function(d){ return d.properties.L0 === target? S.focus : S.land; } ) // filter done in data
        .attr("d", path )
        //.style("fill", function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return subunits[n].color; }) + 1 | 0); })  // coloring: fill
       // .on("mouseover", )
		.on("click", click);

	var hillshade = svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id':'hillshade_raster',':inkscape:label':'hillshade_(raster)'})
	  .append("image")
		.attr("width", width)
		.attr("height", t.height)
		.attr("xlink:xlink:href", "data:image/png;base64," + file3); // replace link by data URI // replace href link by data URI, d3js + client handle the missing xlink


/* Arcs ********************************************************** */
// Admin1-borders filtered
   var L1_borders = svg.append("g")
 		.attr(":inkscape:groupmode","layer")
		.attr({'id':'L1_borders',':inkscape:label':'L1_borders'})
	.append("path")
        .datum(L1_border)
        .attr("class", "L1_border")
        .attr("style", S.L1_border) // css
        .attr("d", path);

// Admin0-borders filtered
   var L0_borders = svg.append("g")
 		.attr(":inkscape:groupmode","layer")
		.attr({'id':'L0_borders',':inkscape:label':'L0_borders'})
	.append("path")
        .datum(L0_border)
        .attr("class", "L0_border")
        .attr("style", S.L0_border) // css
        .attr("d", path);

// Coast-borders filtered
   var coasts = svg.append("g")
 		.attr(":inkscape:groupmode","layer")
		.attr({'id':'Coast',':inkscape:label':'Coast'})
	.append("path")
        .datum(coast )
        .attr("class", "coastline")
        .attr("style", S.coast) // css
        .attr("d", path);

 //Append disputed polygons 
 var disputeds = function(){ 
	if(disputed.features){
    svg.append("g")
 		.attr(":inkscape:groupmode","layer")
		.attr({'id':'Disputed',':inkscape:label':'Disputed'})
	.selectAll(".disputed")
        .data(disputed.features)
      .enter().append("path")
		.attr("name", function(d) { return d.id; })
        .attr("fill", function(d){ return d.properties.L0 === target? "url(#hash2_4)": "url(#hash4_2)"} )
        .attr("d", path )
        //.style("fill", function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return subunits[n].color; }) + 1 | 0); })  // coloring: fill
        .on("click", click);
 	}
 }()

/* DOT & LABELS **************************************************** */
// Places: dot placement ******************************************* */
 if(places.features){
    svg.append("g")
 		.attr(":inkscape:groupmode","layer")
		.attr({'id':'Places_dots',':inkscape:label':'Places_dots'})
		.attr("style", "fill:#646464;")
	.selectAll("path")
        .data(places.features)
      .enter().append("text")
        .attr("class", "place")
		.attr("name", function(d) { return d.id; })
		.attr("x",    function(d) { return path.centroid(d)[0] })
		.attr("y",    function(d) { return path.centroid(d)[1] })
		.attr("dy",".33em")
		.text(function(d){ var s = d.properties.status;
           return s==="Admin-0 capital"? "◉": s==="Admin-1 capital"? "●" : "⚪"; // ⬤◉⍟☉⚪⚫●⚬◯★☆☆⭐ ⭑ ⭒
		})
		.style(function(d){ var s = d.properties.status;
           return s==="Admin-0 capital"? wp.poi.xl: s==="Admin-1 capital"? wp.poi.md : wp.poi.sm; // ⬤◉●◯★☆⍟☆⭐ ⭑ ⭒
		});
}
		
// Places: label placement
    svg.append("g")
 		.attr(":inkscape:groupmode","layer")
		.attr({'id':'Places_labels',':inkscape:label':'Places_labels'})
		.attr("style", S.Places_labels)
	.selectAll(".place-label")
        .data(places.features)
      .enter().append("text")
        .attr("class", "place-label")
		.attr("name",   function(d) { return d.id; })
		.attr("status", function(d){return d.properties.status})
		.attr("style",  function(d){ 
		    var s,t;
            d.properties.status==="Admin-0 capital"? s=wp.label.xl:
            d.properties.status==="Admin-1 capital"? s=wp.label.md : s="";
		    d.geometry.coordinates[0] < EAST-(EAST - WEST)/10? t= "" : t="text-anchor:end;";
			return s = s+t;
		})
        .attr({"dy":".33em","x":function(d) { return d.geometry.coordinates[0] < EAST-(EAST-WEST)/10 ? 8 : -8; } }) // avoid dot overlap
		.attr("transform",  function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
        .text(function(d) { return d.geometry.coordinates[0] < EAST-(EAST-WEST)/10 ? d.id: "" } );

/* L0 labels ***************************************************** */
    svg.append("g")
 		.attr(":inkscape:groupmode","layer")
		.attr({'id':'L0_labels',':inkscape:label':'L0_labels'})
		.attr("style", S.L1_labels + wp.label.md)
	.selectAll(".countries-label")
        .data(admin_0.features)
      .enter().append("text")
        .attr("style", function(d){ return d.properties.L0 === target? "visibility:none;":""; })
        .attr("name", function(d) { return d.id ;})
		.attr("x", function (d) { return path.centroid(d)[0] })
		.attr("y", function (d) { return path.centroid(d)[1] })
		.text(function(d) { return d.id; });

/* L1 labels ***************************************************** */
    svg.append("g")
 		.attr(":inkscape:groupmode","layer")
		.attr({'id':'L1_labels',':inkscape:label':'L1_labels'})
		.attr("style", S.L1_labels)
	.selectAll(".subunit-label")
        .data(L1_focus)
      .enter().append("text")
        .attr("class", function(d){ return d.properties.L0 === target? "L1_label": "L1_label invisible"; } )
        .attr("name", function(d) { return d.id ;})
		.attr("x", function (d) { return path.centroid(d)[0] })
		.attr("y", function (d) { return path.centroid(d)[1] })
		.text(function(d) { return d.id; });

	console.log("layers end")
  }
}//END fn.InjectMap*/



/* ****************************************************** */
/* D3 helpers ****************************** */
var getTransform = function(d,padding_pc, width, projection) { 
	var pd =  (100-(2*padding_pc))/100 || (100-(2*5))/100; // default to .9
	/* GEOJSON PROFILING *********************************** */
	var b = d3.geo.path()
		.projection(projection)
		.bounds(d); // [left, bottom], [right, top] // W S E N
		// b.w = b[0][0]; b.s = b[0][1]; b.e = b[1][0]; b.n = b[1][1];
		b.dx = Math.abs(b[1][0] - b[0][0]);	// distance x = E-W
		b.dy = Math.abs(b[1][1] - b[0][1]);	// distance y = N-S
		b.cx = (b[1][0] + b[0][0]) / 2; 	// center x
		b.cy = (b[1][1] + b[0][1]) /2; 	// center y
	//compute meaningful ratio, scale, translation
	var t={};
		t.ratio = ( b.dy / b.dx );
		if (typeof height==="undefined"){ t.height=width*t.ratio;}
		else { t.height = height; console.log("height");};
		t.scale = pd * Math.min( width/b.dx, t.height/b.dy); // default: .9 * ( width / b.dx)
		t.translate = [(width/2- t.scale * b.cx), (t.height/2 - t.scale * b.cy) ]; //translation
	return t;
}

/* ****************************************************** */
/* DOWNLOAD BUTTONS MODULE ****************************** */
var downloadButtons = function(selector, projection){
	var proj = projection || 0;
d3.select(selector).html("").append("button")
	.attr("type","button")
	.attr("class", "download btn btn-warning btn-md glyphicon glyphicon-download-alt")
	.style({
		background: "#333",
		color: "#FFF",
		"font-weight": 900, 
		border: "2px solid #B10000",
		"text-decoration":"none"})
	.on("click", function () { 
	// clip if it's a map:
		if(proj !== 0 ) {
			// CLIPING DESTROY THE MAP, how to save the clip dom in variable ?
			var dx = svg.attr("width"); var dy = svg.attr("height");
	  		projection.clipExtent([[0,0],[dx,dy]]); console.log(projection.scale()); 
			svg.selectAll("path").attr("d", path);
		}
	// download:
		console.log('2');
		var e = document.createElement('script');
		if (window.location.protocol === 'https:') { 
			e.setAttribute('src', '../js/svg-crowbar.js'); } 
		else { e.setAttribute('src', '../js/svg-crowbar.js'); }	
		e.setAttribute('class', 'svg-crowbar'); 
		document.body.appendChild(e); })
	.text(" Download"); /* -- Works on Chrome. Feedback welcome for others web browsers.*/
}


/* ****************************************************** */
/* SELECT LANGUAGE MODULE ******************************* */
// 1_wiki_translate
var wikis = {"aa":"Qafár af (Afar)","ab":"Аҧсшәа (Abkhazian)","ace":"Acèh (Achinese)","af":"Afrikaans (Afrikaans)","ak":"Akan (Akan)","als":"Alemannisch (Alemannisch)","am":"አማርኛ (Amharic)","an":"aragonés (Aragonese)","ang":"Ænglisc (Old English)","ar":"العربية (Arabic)","arc":"ܐܪܡܝܐ (Aramaic)","arz":"مصرى (Egyptian Spoken Arabic)","as":"অসমীয়া (Assamese)","ast":"asturianu (Asturian)","av":"авар (Avaric)","ay":"Aymar aru (Aymara)","az":"azərbaycanca (Azerbaijani)","ba":"башҡортса (Bashkir)","bar":"Boarisch (Bavarian)","bat-smg":"žemaitėška (Samogitian)","bcl":"Bikol Central (Bikol Central)","be":"беларуская (Belarusian)","be-x-old":"беларуская (тарашкевіца)‎ (беларуская (тарашкевіца)‎)","bg":"български (Bulgarian)","bh":"भोजपुरी (भोजपुरी)","bi":"Bislama (Bislama)","bjn":"Bahasa Banjar (Banjar)","bm":"bamanankan (Bambara)","bn":"বাংলা (Bengali)","bo":"བོད་ཡིག (Tibetan)","bpy":"বিষ্ণুপ্রিয়া মণিপুরী (Bishnupuriya Manipuri)","br":"brezhoneg (Breton)","bs":"bosanski (Bosnian)","bug":"ᨅᨔ ᨕᨘᨁᨗ (Buginese)","bxr":"буряад (буряад)","ca":"català (Catalan)","cbk-zam":"Chavacano de Zamboanga (Chavacano de Zamboanga)","cdo":"Mìng-dĕ̤ng-ngṳ̄ (Min Dong Chinese)","ce":"нохчийн (Chechen)","ceb":"Cebuano (Cebuano)","ch":"Chamoru (Chamorro)","cho":"Choctaw (Choctaw)","chr":"ᏣᎳᎩ (Cherokee)","chy":"Tsetsêhestâhese (Cheyenne)","ckb":"کوردی (Sorani Kurdish)","co":"corsu (Corsican)","cr":"Nēhiyawēwin / ᓀᐦᐃᔭᐍᐏᐣ (Cree)","crh":"qırımtatarca (Crimean Turkish)","cs":"čeština (Czech)","csb":"kaszëbsczi (Kashubian)","cu":"словѣньскъ / ⰔⰎⰑⰂⰡⰐⰠⰔⰍⰟ (Church Slavic)","cv":"Чӑвашла (Chuvash)","cy":"Cymraeg (Welsh)","da":"dansk (Danish)","de":"Deutsch (German)","diq":"Zazaki (Zazaki)","dsb":"dolnoserbski (Lower Sorbian)","dv":"ދިވެހިބަސް (Divehi)","dz":"ཇོང་ཁ (Dzongkha)","ee":"eʋegbe (Ewe)","el":"Ελληνικά (Greek)","eml":"emiliàn e rumagnòl (Emiliano-Romagnolo)","en":"English (English)","eo":"Esperanto (Esperanto)","es":"español (Spanish)","et":"eesti (Estonian)","eu":"euskara (Basque)","ext":"estremeñu (Extremaduran)","fa":"فارسی (Persian)","ff":"Fulfulde (Fulah)","fi":"suomi (Finnish)","fiu-vro":"Võro (Võro)","fj":"Na Vosa Vakaviti (Fijian)","fo":"føroyskt (Faroese)","fr":"français (French)","frp":"arpetan (Franco-Provençal)","frr":"Nordfriisk (Northern Frisian)","fur":"furlan (Friulian)","fy":"Frysk (Western Frisian)","ga":"Gaeilge (Irish)","gag":"Gagauz (Gagauz)","gan":"贛語 (Gan)","gd":"Gàidhlig (Scottish Gaelic)","gl":"galego (Galician)","glk":"گیلکی (Gilaki)","gn":"Avañe`ẽ (Guarani)","got":"?￰ﾐﾌ﾿?￰ﾐﾌﾹ?￰ﾐﾌﾺ (Gothic)","gu":"ગુજરાતી (Gujarati)","gv":"Gaelg (Manx)","ha":"Hausa (Hausa)","hak":"客家語/Hak-kâ-ngî (Hakka)","haw":"Hawai`i (Hawaiian)","he":"עברית (Hebrew)","hi":"हिन्दी (Hindi)","hif":"Fiji Hindi (Fiji Hindi)","ho":"Hiri Motu (Hiri Motu)","hr":"hrvatski (Croatian)","hsb":"hornjoserbsce (Upper Sorbian)","ht":"Kreyòl ayisyen (Haitian)","hu":"magyar (Hungarian)","hy":"Հայերեն (Armenian)","hz":"Otsiherero (Herero)","ia":"interlingua (Interlingua)","id":"Bahasa Indonesia (Indonesian)","ie":"Interlingue (Interlingue)","ig":"Igbo (Igbo)","ii":"ꆇꉙ (Sichuan Yi)","ik":"Iñupiak (Inupiaq)","ilo":"Ilokano (Iloko)","io":"Ido (Ido)","is":"íslenska (Icelandic)","it":"italiano (Italian)","iu":"ᐃᓄᒃᑎᑐᑦ/inuktitut (Inuktitut)","ja":"日本語 (Japanese)","jbo":"Lojban (Lojban)","jv":"Basa Jawa (Javanese)","ka":"ქართული (Georgian)","kaa":"Qaraqalpaqsha (Kara-Kalpak)","kab":"Taqbaylit (Kabyle)","kbd":"Адыгэбзэ (Kabardian)","kg":"Kongo (Kongo)","ki":"Gĩkũyũ (Kikuyu)","kj":"Kwanyama (Kuanyama)","kk":"қазақша (Kazakh)","kl":"kalaallisut (Kalaallisut)","km":"ភាសាខ្មែរ (Khmer)","kn":"ಕನ್ನಡ (Kannada)","ko":"한국어 (Korean)","koi":"Перем Коми (Komi-Permyak)","kr":"Kanuri (Kanuri)","krc":"къарачай-малкъар (Karachay-Balkar)","ks":"कॉशुर / کٲشُر (Kashmiri)","ksh":"Ripoarisch (Colognian)","ku":"Kurdî (Kurdish)","kv":"коми (Komi)","kw":"kernowek (Cornish)","ky":"Кыргызча (Kyrgyz)","la":"Latina (Latin)","lad":"Ladino (Ladino)","lb":"Lëtzebuergesch (Luxembourgish)","lbe":"лакку (лакку)","lez":"лезги (Lezghian)","lg":"Luganda (Ganda)","li":"Limburgs (Limburgish)","lij":"Ligure (Ligurian)","lmo":"lumbaart (Lombard)","ln":"lingála (Lingala)","lo":"ລາວ (Lao)","lt":"lietuvių (Lithuanian)","ltg":"latgaļu (Latgalian)","lv":"latviešu (Latvian)","mai":"मैथिली (Maithili)","map-bms":"Basa Banyumasan (Basa Banyumasan)","mdf":"мокшень (Moksha)","mg":"Malagasy (Malagasy)","mh":"Ebon (Marshallese)","mhr":"олык марий (Eastern Mari)","mi":"Māori (Maori)","min":"Baso Minangkabau (Minangkabau)","mk":"македонски (Macedonian)","ml":"മലയാളം (Malayalam)","mn":"монгол (Mongolian)","mo":"молдовеняскэ (молдовеняскэ)","mr":"मराठी (Marathi)","mrj":"кырык мары (Hill Mari)","ms":"Bahasa Melayu (Malay)","mt":"Malti (Maltese)","mus":"Mvskoke (Creek)","mwl":"Mirandés (Mirandese)","my":"မြန်မာဘာသာ (Burmese)","myv":"эрзянь (Erzya)","mzn":"مازِرونی (Mazanderani)","na":"Dorerin Naoero (Nauru)","nah":"Nāhuatl (Nāhuatl)","nap":"Napulitano (Neapolitan)","nds":"Plattdüütsch (Low German)","nds-nl":"Nedersaksies (Low Saxon (Netherlands))","ne":"नेपाली (Nepali)","new":"नेपाल भाषा (Newari)","ng":"Oshiwambo (Ndonga)","nl":"Nederlands (Dutch)","nn":"norsk nynorsk (Norwegian Nynorsk)","no":"norsk bokmål (Norwegian (bokmål))","nov":"Novial (Novial)","nrm":"Nouormand (Nouormand)","nso":"Sesotho sa Leboa (Northern Sotho)","nv":"Diné bizaad (Navajo)","ny":"Chi-Chewa (Nyanja)","oc":"occitan (Occitan)","om":"Oromoo (Oromo)","or":"ଓଡ଼ିଆ (Oriya)","os":"Ирон (Ossetic)","pa":"ਪੰਜਾਬੀ (Punjabi)","pag":"Pangasinan (Pangasinan)","pam":"Kapampangan (Pampanga)","pap":"Papiamentu (Papiamento)","pcd":"Picard (Picard)","pdc":"Deitsch (Pennsylvania German)","pfl":"Pälzisch (Palatine German)","pi":"पालि (Pali)","pih":"Norfuk / Pitkern (Norfuk / Pitkern)","pl":"polski (Polish)","pms":"Piemontèis (Piedmontese)","pnb":"پنجابی (Western Punjabi)","pnt":"Ποντιακά (Pontic)","ps":"پښتو (Pashto)","pt":"português (Portuguese)","qu":"Runa Simi (Quechua)","rm":"rumantsch (Romansh)","rmy":"Romani (Romani)","rn":"Kirundi (Rundi)","ro":"română (Romanian)","roa-rup":"armãneashti (Aromanian)","roa-tara":"tarandíne (tarandíne)","ru":"русский (Russian)","rue":"русиньскый (Rusyn)","rw":"Kinyarwanda (Kinyarwanda)","sa":"संस्कृतम् (Sanskrit)","sah":"саха тыла (Sakha)","sc":"sardu (Sardinian)","scn":"sicilianu (Sicilian)","sco":"Scots (Scots)","sd":"سنڌي (Sindhi)","se":"sámegiella (Northern Sami)","sg":"Sängö (Sango)","sh":"srpskohrvatski / српскохрватски (Serbo-Croatian)","si":"සිංහල (Sinhala)","simple":"Simple English (Simple English)","sk":"slovenčina (Slovak)","sl":"slovenščina (Slovenian)","sm":"Gagana Samoa (Samoan)","sn":"chiShona (Shona)","so":"Soomaaliga (Somali)","sq":"shqip (Albanian)","sr":"српски / srpski (Serbian)","srn":"Sranantongo (Sranan Tongo)","ss":"SiSwati (Swati)","st":"Sesotho (Southern Sotho)","stq":"Seeltersk (Saterland Frisian)","su":"Basa Sunda (Sundanese)","sv":"svenska (Swedish)","sw":"Kiswahili (Swahili)","szl":"ślůnski (Silesian)","ta":"தமிழ் (Tamil)","te":"తెలుగు (Telugu)","tet":"tetun (Tetum)","tg":"тоҷикӣ (Tajik)","th":"ไทย (Thai)","ti":"ትግርኛ (Tigrinya)","tk":"Türkmençe (Turkmen)","tl":"Tagalog (Tagalog)","tn":"Setswana (Tswana)","to":"lea faka-Tonga (Tongan)","tpi":"Tok Pisin (Tok Pisin)","tr":"Türkçe (Turkish)","ts":"Xitsonga (Tsonga)","tt":"татарча/tatarça (Tatar)","tum":"chiTumbuka (Tumbuka)","tw":"Twi (Twi)","ty":"reo tahiti (Tahitian)","tyv":"тыва дыл (Tuvinian)","udm":"удмурт (Udmurt)","ug":"ئۇيغۇرچە / Uyghurche (Uyghur)","uk":"українська (Ukrainian)","ur":"اردو (Urdu)","uz":"oʻzbekcha (Uzbek)","ve":"Tshivenda (Venda)","vec":"vèneto (Venetian)","vep":"vepsän kel’ (Veps)","vi":"Tiếng Việt (Vietnamese)","vls":"West-Vlams (West Flemish)","vo":"Volapük (Volapük)","wa":"walon (Walloon)","war":"Winaray (Waray)","wo":"Wolof (Wolof)","wuu":"吴语 (Wu)","xal":"хальмг (Kalmyk)","xh":"isiXhosa (Xhosa)","xmf":"მარგალური (Mingrelian)","yi":"ייִדיש (Yiddish)","yo":"Yorùbá (Yoruba)","za":"Vahcuengh (Zhuang)","zea":"Zeêuws (Zeeuws)","zh":"中文 (Chinese)","zh-classical":"文言 (Classical Chinese)","zh-min-nan":"Bân-lâm-gú (Chinese (Min Nan))","zh-yue":"粵語 (Cantonese)","zu":"isiZulu (Zulu)"};
//Source: https://meta.wikimedia.org/wiki/Special:SiteMatrix
//Languages: 288!

/* ****************************************************** */
/* SELECT ITEM MODULE *********************************** */
// in _location



/* ****************************************************** */
/* REPROJECTION TOOLS MODULE **************************** */
