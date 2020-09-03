/**
* Created with Wikiatlas.
* User: hugolpz
* Version: 2014.09.04 */
/* Sister js ***************************************************** */
/* http://wikimapsatlas.github.io/static/js/wikimaps.atlas.js **** */
console.log("wikiatlas.js")

/* *************************************************************** */
/* D3JS SUGAR **************************************************** */
/* Interactive clicks helpers ************************************ */
function click(a){ 
	var name = a.properties.name || a.id ; console.log(name); 
	d3.select("#interactions")
		.append("div")
		.html('(<a href="http://en.wikipedia.org/wiki/'+name+'">wiki</a>) '+name);
}
function dblclick(a){ window.location.assign("http://en.wikipedia.org/wiki/"+a.properties.name, '_blank');}
function urlToData(name_,nodejs){
	var root;
	return root = nodejs? "http://127.0.0.1:8080/output/"+name_ : "../output/"+name_;
	console.log('root',root)
}	
/* Math helpers ************************************************** */
function parallel(φ, λ0, λ1) {
  if (λ0 > λ1) λ1 += 360;
  var dλ = λ1 - λ0,
      step = dλ / Math.ceil(dλ);
  return d3.range(λ0, λ1 + 0.5 * step, step).map(function(λ) { return [normalise(λ), φ]; });
}
function normalise(x) {
  return (x + 180) % 360 - 180;
}

/* Frame helpers ************************************************* */
// Get Bounding Box
var getBBoxPxViaElementAttr = function (selector){
	// var bb = getBBox(selector);
	var bb = d3.selectAll(selector).attr("bounds").split(",");
	bb = [[bb[0],bb[1]],[bb[2],bb[3]]];
	return bb;
};
// Augment Bounding Box
var bbPxToAugmentBBoxPx = function (bb,marginPx) {
	// [[left, top], [right, bottom]] for svg px bb
	var bbOut = [[bb[0][0]-marginPx,bb[0][1]-marginPx],[bb[1][0]+marginPx,bb[1][1]+marginPx]];
    return bbOut;
};
// Get Bounding Box Rectangle path
var bbPxToXmlBBoxPath = function (bb) {
	var l = bb[0][0], t = bb[0][1], 
	r = bb[1][0], b = bb[1][1];  
	var path = "M "+l+','+b+' '+r+','+b+' '+r+','+t+' '+l+','+t+' Z'; // http://jsfiddle.net/jwrmwxzt/6/
	return path;
};
// Get Bounding Box Circle data
var bbPxToXmlBBoxCircleData = function (bb) {
	var l = bb[0][0], t = bb[0][1], r = bb[1][0], b = bb[1][1],
	cx = (r+l)/2, cy=(t+b)/2, cr = (r-l)<(b-t)? (b-t)/2: (r-l)/2;
	var circleData = [ cx, cy, cr ]; // http://jsfiddle.net/jwrmwxzt/6/
	return circleData;
};
// Get from initial Bounding Box, wanted margin, and condition an augmented BB's path
var bbPxToAugmentedXmlBBox = function(bb,marginPx,condition) {
	if (condition) { 
		bb = bbPxToAugmentBBoxPx(bb,marginPx);
		return bbPxToXmlBBoxPath(bb);
	}
};

/* Elevations helpers ******************************************** */
var getElevationsDomain = function(elevations_json){
	var elevationsKeys  =  Object.keys(elevations_json.objects),
		elevationLength = elevationsKeys.length, // 7
		elevationDomain = [];
	for(var i=0; i<elevationLength; i++){
		var code = Number( elevationsKeys[i].replace(/[^\d.-]/g, '') );
		console.log("Layers & current: "+elevationLength+ " // "+ code);
		elevationDomain.push(code);
	}
	return elevationDomain;
};
var elevationType = function (elevationDomain){
	var min = d3.min(elevationDomain), 
		max = d3.max(elevationDomain),
		type="";
	if(min>=0) {
		type = min<300&&max<2000? "plain&hills":
			min>=300&&max<2000? "hills":
				min>=300&&max>=2000? "hills&mounts": 
					"all";
	}else if (min<0) { type = min>-200? "sea":"deep_sea"; }
   console.log("Topographic type: "+type);
	return type;
};
var selectColorRange = function (elevationDomain){
	var range=[],
	type = elevationType(elevationDomain);
	switch(type){
		case "all"			: range = ['#94BF8B','#EFEBC0','#AA8753','#FFFFFF']; break;
		case "plain&hills"	: range = ['#94BF8B','#EFEBC0','#AA8753']; break;
		case "hills"		: range = [          '#EFEBC0','#AA8753']; break;
		case "hills&mounts"	: range = [          '#EFEBC0','#AA8753','#FFFFFF']; break;
		case "sea"			: range = ['#71ABD8','#D8F2FE']; break;
		case "deep_sea"		: range = ['#002040','#71ABD8','#D8F2FE']; break;
	}	console.log("Topographic D3 range: "+range);
	return range;
};
var topographicColorScale = function (elevationDomain){
	var colorRange = selectColorRange(elevationDomain);
	var d = (elevationDomain.length)/colorRange.length;
	var newDomain = []; // number of elements of domain and range must be equal. See D3 > Quantitative-Scales#linear_domain > "polylinear scale"
	for (var i=0; i < colorRange.length; i++){ newDomain.push(0+i*d);}
	var scale = d3.scale.linear()
		.domain(newDomain)
		.range(colorRange);
	console.log("Topographic D3 domain:"+ newDomain);
	return scale;
};

/* ****************************************************** */
/* WIKIPEDIA CSS MODULE ********************************* */
// Based and extended from: https://en.wikipedia.org/wiki/Wikipedia:WikiProject_Maps/Conventions
var wp={   
	stroke: {
		0: "stroke:none;stroke-linejoin:round;",
		no:"stroke:none;stroke-linejoin:round;",
		xs:"stroke-width:0.5px;stroke-linejoin:round;",
		sm:"stroke-width:1.0px;stroke-linejoin:round;",
		md:"stroke-width:1.5px;stroke-linejoin:round;",
		lg:"stroke-width:2.0px;stroke-linejoin:round;",
		xl:"stroke-width:3.0px;stroke-linejoin:round;"
	},
	dash: { // http://jsfiddle.net/tgq925aL/
		no: "stroke-dasharray:none;",		// L1
		sm: "stroke-dasharray: 4,4;",		// normal dash (disputed)
		md: "stroke-dasharray: 8,4;",		// 
		xl: "stroke-dasharray: 16,4,3,4;"	// international
	},
	label: {
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
	},
	poi: {
		admin:"fill:#646464;",
		water:"fill:#0978AB;",	
		xs: "font-size: 8px;",
		sm: "font-size:10px;",
		md: "font-size:12px;",
		xl: "font-size:16px;",
		xxl:"font-size:20px;"
	},
	location: {  
		no:        "fill:none;",
		locator:   "fill:#B10000;",
		frame :    "fill-opacity:0.3; stroke:#B10000;",
		focus :    "fill:#FEFEE9;",
		land  :    "fill:#E0E0E0;",
		border:    "fill: none; stroke:#646464;",	// line_sm
		waterline: "fill: none; stroke:#0978AB;",	// line_sm
		waterarea: "fill:#C6ECFF;",
		temp:      "fill-opacity:0.6;stroke-dasharray:4,4;dasharray:4,4;"
}};
/* STYLES ******************************************************** */
var S = {  // note on naming convention : if layers exist, take exact same name, #Rivers => S.Rivers.
	focus : wp.location.focus+ wp.stroke.no,
	land  : wp.location.land + wp.stroke.no,
	Disputed: wp.stroke.md + wp.dash.sm,
	L1_frames : wp.location.locator + wp.location.frame + wp.stroke.md + "pointer-events:none;",
	Background: wp.location.waterarea,
	Rivers: wp.location.waterline,    // stroke-width => computed later
	Lakes : wp.location.waterline + wp.location.waterarea + wp.stroke.sm,
	Coast : wp.location.waterline+ wp.stroke.md,
	L0_borders : wp.location.border + wp.stroke.md + wp.dash.xl,
	L1_borders : wp.location.border + wp.stroke.sm + wp.dash.no,
	Places		: wp.label.all+ wp.label.admin + wp.label.middle,
	Places_labels	: wp.label.all+ wp.label.admin + wp.label.sm,
	L0_labels		: wp.label.all+ wp.label.admin + wp.label.md + wp.label.middle,
	L1_labels		: wp.label.all+ wp.label.admin + wp.label.sm + wp.label.middle,
	Elevations : "pointer-events:none;"
};
/* Hash:patterns **************************************** */
//Pattern injection : disputed-in, disputed-out
var injectPattern = function(selector){
	// location maps. Note: "hash2_4" means "hash pattern overlay, 2px colored (on), 4px not colored (off)".
	var pattern_disputed_in = d3.select(selector).append("defs")
		.append("pattern")
			.attr({ id:"hash2_4", width:"6", height:"6", patternUnits:"userSpaceOnUse", patternTransform:"rotate(-45)"})
		.append("rect")
			.attr({ width:"2", height:"6", transform:"translate(0,0)", fill:"#E0E0E0" }); // (!) fill: wp.location.land
	var pattern_disputed_out = d3.select(selector).append("defs")
		.append("pattern")
			.attr({ id:"hash4_2", width:"6", height:"6", patternUnits:"userSpaceOnUse", patternTransform:"rotate(-45)"})
		.append("rect")
			.attr({ width:"2", height:"6", transform:"translate(0,0)", fill:"#FEFEE9" }); // (!) fill: wp.location.focus
// To style shapes:
//    .attr("fill", function(d){ return d.properties.L0 === iso_a2? "url(#hash2_4)": "url(#hash4_2)"} ;)
};

/* ****************************************************** */
/* GRID MODULE ****************************************** */
var graticule = function($D3selector,step) {
	d3.geo.graticule().step([step, step]);
	$D3selector.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)
		.style({'fill': 'none', 'stroke': '#0978AB', 'stroke-linejoin': 'round'})
		.style({'stroke-width': 0.5 });
};

/* ****************************************************** */
/* LOCATOR MAP MODULE *********************************** */
var localisator = function (hookId, width, title, id, WEST, NORTH, EAST, SOUTH, nodejs) {
/* Init ************************************************* */
	var height = width;
	var lon_central = function(){ 
		var num= EAST>WEST? -(WEST+EAST)/2 : -(WEST+EAST)/2+180;
		return num;
	}();

	var proj = d3.geo.orthographic()
		.scale(1/2*width)
		.rotate([ lon_central, -(NORTH+SOUTH)/2 +10 ])
		.translate([width / 2 , height / 2 ])
		.clipAngle(90);

	var path = d3.geo.path()
		.projection(proj);

/* SVG container **************************************** */
	var svg = d3.select(hookId).append("svg")
		.attr("id", title+"-orthographic_globe_locator_(wikiatlas_2016)")
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
			proj.rotate([ lon_central, -(NORTH+SOUTH)/2 +10 ]);
			svg.selectAll("path").attr("d", path);
		});

/* SVG background *************************************** */
// Blue circle
	var earthDisk = svg.append("circle")
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
	gradient.append("svg:stop")			// middle step setting
		.attr("offset", "50%")
		.attr("stop-color", "#FFF")
		.attr("stop-opacity", 0.3);
	gradient.append("svg:stop")			// final step setting
		.attr("offset", "100%")
		.attr("stop-color", "#009")
		.attr("stop-opacity", 0.3);
	// Gradiant-circle
	var earthOcean = svg.append('circle')	// append gradient to circle
		.attr('cx', width / 2)
		.attr('cy', height / 2)
		.attr('r', width/2 )
		.attr('fill', 'url(#gradient)');
	
var root= urlToData("world-sp.07",nodejs); timer.now("Ready to load files");

/* GIS data injection *********************************** */
d3.json(root+"/administrative.topo.json", function(error, Stone) {
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
		.attr("id", function(d){ return d.properties.name.replace(/ |\.|'/g, "_");} )
		.attr("name", function(d){ return d.properties.name; } )
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
		var d = 5;
		// var d= (Math.abs(NORTH-SOUTH) + Math.abs(EAST-WEST)) / 20;
		var geoRect = { type: "Polygon", coordinates: [
			[[WEST-d,SOUTH-d]]
				.concat(parallel(NORTH+d, WEST-d, EAST+d))
				.concat(parallel(SOUTH-d, WEST-d, EAST+d).reverse())
			]};	
		var area = d3.geo.path().projection(function(geoRect){return geoRect;}).area(geoRect);
		console.log(area);
		if(area <250){
			hook.append("path")
			.datum(geoRect)
				.style({'fill': '#B10000', 'fill-opacity': 0.3, 'stroke': '#B10000', 'stroke-linejoin': 'round','stroke-width': 1 })
				.attr("d", path);
			}
		};
	redwindow (WEST,SOUTH,EAST,NORTH,svg);
	
	var label = svg.append("text")
		.attr("x", width / 2)
		.attr("text-anchor","middle")
		.text(title)
		.attr("y", height * 57/100 );
});

};


/* **************************************************************** */
/* LOCATION MAP MODULE  ******************************************* */
/* **************************************************************** */

var locationMap = function(hookId, width, iso_a2, title, WEST, NORTH, EAST, SOUTH, nodejs, mapType){
	mapType = mapType || { rich_background: true, base_administrative:false, base_topography:true, borders: true, labels:true };
	// mapType = mapType || { rich_background: true, base_administrative:true, base_topography:false, borders: true, labels:true };
	console.log("locationMap()");
/* SETTINGS ******************************************************* */
// SVG injection:
var width  = width || 600,
	title_ = title.replace(/ /g, "_").replace(/(_)+/g, "_"),
	titleId = title.replace(/[^a-zA-Z0-9]/gi, "_").replace(/(_)+/g, "_");
var svg = d3.select(hookId).append("svg:svg")
        .attr('version', '1.1')
		.attr("width", width)
		.attr("id", titleId)
		//.attr(':xmlns:xlink','').attr('xmlns:xlink','').attr('xlink','')
//		.attr(':xmlns:geo','http://www.w3.org/2000/svg')
		.attr(':xmlns:inkscape','http://www.inkscape.org/namespaces/inkscape')
		.attr(":xmlns:cc","http://creativecommons.org/ns#");
	/*  var svg = d3.select(hookId).append("svg").attr("width", width)
	svg.attr(':xmlns','http://www.w3.org/2000/svg')		// if not: file does not appear to have any style information
			.attr(':xmlns:xlink','http://www.w3.org/1999/xlink')// if not: Namespace prefix xlink for href
			// no = client: no img; crowbar: raster yes; node: raster yes ?
			.attr(":xmlns:rdf","http://www.w3.org/1999/02/22-rdf-syntax-ns#") 
	; */

	$('svg').attr('xmlns:geo', 'http://www.w3.org/2000/svg');

var geo = svg.append(':geo:g')
		.attr(':xmlns:geo','http://www.w3.org/2000/svg')
		.attr(':geo:id','geo')
		.attr(':geo:syntax', "WSEN bounding box in decimal degrees")
		.attr(':geo:west',  WEST)
		.attr(':geo:south', SOUTH)
		.attr(':geo:east',  EAST)
		.attr(':geo:north', NORTH)
		.attr(':geo:title', title); timer.now("Wrote XML metadata (WNES, title)");

injectPattern("svg"); //Pattern injection : disputed-in, disputed-out
console.log("pattern()"); 			timer.now("Add patterns");

// Runs code server or client side => raster images urls
var root= urlToData(title,nodejs); timer.now("Ready to load files");

var urls = [
	root+"/administrative.topo.json", // https://rugger-demast.codio.io/output/"
	root+"/color.jpg.b64",
	root+"/trans.png.b64", 
	root+"/waters.topo.json",
	root+"/elevations.topo.json"
];
console.log('URLS:', urls[0], urls[5])
 queue()
	.defer(d3.json, urls[0])	// timer.now("Load file: administrative");
	.defer(d3.text, urls[1])	// timer.now("Load file: color");
	.defer(d3.text, urls[2])	// timer.now("Load file: trans");
	.defer(d3.json, urls[3])	// timer.now("Load file: waters");
	.defer(d3.json, urls[4])	// timer.now("Load file: elevations");
	.await(makeMap); timer.now("Loaded files");
console.log('Queue():','/* **************************************** */')

/* *************************************************************** */
/* *************************************************************** */
/* *************************************************************** */

	// Data (getJSON: TopoJSON)
function makeMap(error, json, file2, file3, waters, elevations){								timer.now("MakeMap() start! -----------");

/* DATA ********************************************************** */
    var admin_0   = topojson.feature(json, json.objects.admin_0),
        admin_1   = topojson.feature(json, json.objects.admin_1),
		L1_focus  = admin_1.features.filter(function(d) { return d.properties.L0_name === title; }),
        disputed  = topojson.feature(json, json.objects.disputed),
        rivers    = topojson.feature(waters, waters.objects.rivers),
        lakes     = topojson.feature(waters, waters.objects.lakes),
        places    = topojson.feature(json, json.objects.places),
		coast     = topojson.mesh(json, json.objects.admin_0, function(a,b) { return a===b;}),
        L0_border = topojson.mesh(json, json.objects.admin_0, function(a,b) { return a!==b;}),
		L1_border = topojson.mesh(json, json.objects.admin_1, function(a,b) { return a !==b && a.properties.L0 === b.properties.L0 && a.properties.L0 === iso_a2; }),
		Disputed_border = topojson.mesh(json, json.objects.admin_0, function(a,b) { return a===b;});

		// neighbors = topojson.neighbors(Stone.objects.admin_1.geometries); // coloring: full line
	
	
	// Projection default
	var projection = d3.geo.mercator()
		.scale(1)
		.translate([0, 0]);//  .pointRadius(4)
	// Projection recalculated
	var focusFrameGeojson = { type: "Polygon", coordinates: [ [[WEST,SOUTH],[WEST,NORTH],[EAST,NORTH],[EAST,SOUTH],[WEST,SOUTH]] ]};
	var t = getTransform(focusFrameGeojson,0,width, projection); 
	projection
		.scale(t.scale)
		.translate(t.translate);
	svg.attr("height", t.height);
	var path = d3.geo.path()
		.projection(projection); 														timer.now("Define projection & transformed projection");
	
/* *************************************************************** */
/* META ********************************************************** */
/* *************************************************************** */ timer.now("Define minor meta (svg name)!-----------");
var administrativeMeta = function (){ svg.attr("name", title_+"_administrative_map_(2016)"); };
var topographicMeta = function (){ svg.attr("name", title_+"_topographic_map_(2016)"); };

/* *************************************************************** */
/* DEFINE LAYERS DRAWING ***************************************** */
/* *************************************************************** */ timer.now("Define drawing: -----------");
var drawBackground = function() {
	svg.append("g")
			.attr(":inkscape:groupmode","layer")
			.attr({'id':'Background',':inkscape:label':'Background'})
		.attr("style", S.Background)
		.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width",    width)
		.attr("height", t.height);
};
var drawRelief_raster = function() {
	svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id':'Relief_raster',':inkscape:label':'Relief_raster'})
		.append("image")
		.attr("width", width)
		.attr("height", t.height)
		.attr("xlink:xlink:href", "data:image/jpeg;base64," + file2); // replace link by data URI // replace href link by data URI, d3js + client handle the missing xlink
};

/* Polygons ****************************************************** */
//Append L0 polygons 
var drawL0 = function() {
	svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id':'L0',':inkscape:label':'L0'})
	.selectAll(".countries")
        .data(admin_0.features)
      .enter().append("path")
        .attr("class", "L0")
        .attr("code", function(d) { return d.properties.L0; })
        .attr("name", function(d) { return d.properties.name; })
        .attr("style", function(d){ return d.properties.L0 === iso_a2? S.focus : S.land; } )
        //.style("fill", function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return subunits[n].color; }) + 1 | 0); })  // coloring: fill
        .attr("d", path)
		.on("click", click);
};

//Append L1 polygons 
var drawL1 = function(){ 
	svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id':'L1',':inkscape:label':'L1'})
		.attr("style", S.focus)
	.selectAll(".subunit")
        .data(L1_focus)
      .enter().append("path")
        .attr("code", function(d) { return d.properties.L1; })
        .attr("name", function(d) { return d.properties.name; })
//        .attr("style", function(d){ return d.properties.L0 === iso_a2? S.focus : S.land; } ) // filter done in data
		.attr("bounds", function(d){ var bb = path.bounds(d), o = {'left':bb[0][0],'top':bb[0][1],'right':bb[1][0],'bottom':bb[1][1]}; return JSON.stringify(o);} )
		.attr("area", function(d){ return path.area(d);} )
        //.style("fill", function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return subunits[n].color; }) + 1 | 0); })  // coloring: fill
        .attr("d", path )
		// .on("mouseover", )
		.on("click", click);
};
var drawL1_frames = function(){ svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id':'L1_frames',':inkscape:label':'L1_frames'})
		.attr("style", S.L1_frames)
	.selectAll("path")
        .data(L1_focus)
      .enter().append("path")
		.attr("style","opacity:0;")
		.attr("name", function(d){ return "Frame for "+d.properties.name;})
		.attr("d", function(d){
			var bb = path.bounds(d), margin=width/100*5, condition = path.area(d)<=margin*margin;
			return bbPxToAugmentedXmlBBox(bb, margin, condition);
		});
};

	
 //Append disputed polygons 
 var drawDisputed = function(){ 
	if(disputed.features){
    svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id':'Disputed',':inkscape:label':'Disputed'})
		.attr("style", S.Disputed+"stroke:#646464;")
	.selectAll(".disputed")
        .data(disputed.features)
      .enter().append("path")
		.attr("name", function(d) { return d.properties.name; })
        .attr("fill", function(d){ return d.properties.L0 === iso_a2? "url(#hash2_4)": "url(#hash4_2)";} )
        .attr("d", path )
        //.style("fill", function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return subunits[n].color; }) + 1 | 0); })  // coloring: fill
        .on("click", click);
	}
 };

/* ************************************************************************** */
/* Elevations *************************************************************** */
var drawElevations = function(){
	var svg_elevation = svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id': 'Elevations',':inkscape:label':'Elevations'});

	var drawElevations = function(json_data, name, i){
		var color = colorScale(i);		// console.log("current: "+ i + "/" + elevationsKeys[i]+", color: "+color);
		svg_elevation.append("g")
			.attr({'id': name,':inkscape:label': name})
			.attr("style", "fill:"+color+";"+S.Elevations )
			.selectAll(".altitude")
		.data(json_data.features)
			.enter().append("path")
			//  .attr("style", function(d){ return "fill:#88BB88;fill:opacity:0.2"; } )
			//.attr("style", "fill:"+S.elevations[iteration]+";" )
			.attr("d", path )
			.on("click",click);
	};
	if(elevations.objects){
		var elevationsDomain = getElevationsDomain(elevations);	//	console.log(elevationsDomain);  // [0, 100, 200, 500, 1000, 2000, 5000]
		var colorScale = topographicColorScale(elevationsDomain);
		var elevationsKeys = Object.keys(elevations.objects), l=elevationsKeys.length;
		for(var i=0; i<l;i++){
			var name = elevationsKeys[i];
			var data = topojson.feature(elevations, elevations.objects[name]);
			drawElevations(data,name,i);
		}
	}
};
/* Hillshdes vector ******************************************************** */
/** /
	var svg_hillshades_vector = svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id': 'Hillshades_vector',':inkscape:label':'Hillshades_vector'})
		.attr("style", function(d){ return "fill:#88BB88;fill-opacity:0.3"; } );

	var drawHillshades = function(json_data, name){
		if(json_data.features){
		var code = name.replace(/[^\d.-]/g, '');
		svg_elevation.append("g")
			.attr({'id': name,':inkscape:label': name})
			.selectAll(".altitude")
		.data(json_data.features)
			.enter().append("path")
			.attr("d", path );
		}
	};
	for(var i in hillshades.objects){
		var name = i; // Object.keys(elevations.objects)[i];
		var data = topojson.feature(hillshades, hillsahdes.objects[name]);
		drawHillshades(data,name);
	};
	/**/
	
/* Hillshades *************************************************************** */
var drawHillshade_raster = function(){ 
	svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id':'Hillshade_raster',':inkscape:label':'Hillshade_raster'})
	.append("image")
		.attr("width", width)
		.attr("height", t.height)
		.attr("style","pointer-events:none;opactiy:0.6;")
		.attr("xlink:xlink:href", "data:image/png;base64," + file3); // replace link by data URI // replace href link by data URI, d3js + client handle the missing xlink
};

 //Append rivers polygons 
 var drawRivers = function(){ 
	if(rivers.features){
    svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id':'Rivers',':inkscape:label':'Rivers'})
		.attr("style", S.Rivers + wp.stroke.xs)
	.selectAll(".rivers")
        .data(rivers.features)
      .enter().append("path")
		.attr("name", function(d) { return d.properties.name; })
		.attr("style", function(d) { return d.properties.scalerank >3? null: S.Rivers+wp.stroke.sm; })
        //.style("fill", function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return subunits[n].color; }) + 1 | 0); })  // coloring: fill
        .attr("d", path );
	}
 };
 //Append lakes polygons 
 var drawLakes = function(){ 
	if(lakes.features){
    svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id':'Lakes',':inkscape:label':'Lakes'})
		.attr("style", S.Lakes)
	.selectAll(".lakes")
        .data(lakes.features)
      .enter().append("path")
		.attr("name", function(d) { return d.properties.name; })
        //.style("fill", function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return subunits[n].color; }) + 1 | 0); })  // coloring: fill
        .attr("d", path );
	}
 };

/* BORDERS ******************************************************** */
// Admin1-borders filtered
   var drawL1_borders = function(){ svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id':'L1_borders',':inkscape:label':'L1_borders'})
	.append("path")
        .datum(L1_border)
        .attr("class", "L1_border")
        .attr("style", S.L1_borders) // css
        .attr("d", path);
};
// Admin0-borders filtered
   var drawL0_borders = function(){ svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id':'L0_borders',':inkscape:label':'L0_borders'})
	.append("path")
        .datum(L0_border)
        .attr("class", "L0_border")
        .attr("style", S.L0_borders) // css
		.attr("d", path);
};
// Coast-borders filtered
   var drawCoasts = function(){ svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id':'Coast',':inkscape:label':'Coast'})
	.append("path")
        .datum(coast )
        .attr("class", "coastline")
        .attr("style", S.Coast) // css
        .attr("d", path);
};

/* DOT & LABELS **************************************************** */
// Places_dots: dot placement ************************************** */
var drawPlaces_dots = function(){
	if(places.features){
    svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id':'Places_dots',':inkscape:label':'Places_dots'})
		.attr("style", S.Places)
	.selectAll("path")
        .data(places.features)
      .enter().append("text")
        .attr("class", "place")
		.attr("name", function(d) { return d.properties.name; })
		.attr("x",    function(d) { return path.centroid(d)[0]; })
		.attr("y",    function(d) { return path.centroid(d)[1]; })
		.attr("dy",".33em")
		.text(function(d){ var s = d.properties.status;
           return s==="Admin-0 capital"? "◉": s==="Admin-1 capital"? "●" : "⚪"; // ⬤◉⍟☉⚪⚫●⚬◯★☆☆⭐ ⭑ ⭒
		})
		.style(function(d){ var s = d.properties.status;
           return s==="Admin-0 capital"? wp.poi.xl: s==="Admin-1 capital"? wp.poi.md : wp.poi.sm; // ⬤◉●◯★☆⍟☆⭐ ⭑ ⭒
		});
	}
};
/* Places labels ************************************************** */
var drawPlaces_labels = function(){
	svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id':'Places_labels',':inkscape:label':'Places_labels'})
		.attr("style", S.Places_labels)
	.selectAll(".place-label")
        .data(places.features)
      .enter().append("text")
        .attr("class", "place-label")
		.attr("name",   function(d){ return d.properties.name; })
		.attr("status", function(d){ return d.properties.status;})
		.attr("style",  function(d){ 
			var s,t;
            d.properties.status==="Admin-0 capital"? s=wp.label.xl:
            d.properties.status==="Admin-1 capital"? s=wp.label.md: s="";
			d.geometry.coordinates[0] < EAST-(EAST - WEST)/10? t= "" : t="text-anchor:end;";
			return s+t;
		})
        .attr({"dy":".33em","x":function(d) { return d.geometry.coordinates[0] < EAST-(EAST-WEST)/10 ? 5 : -5; } }) // avoid dot overlap
		.attr("transform",  function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
        .text(function(d) { return d.geometry.coordinates[0] < EAST-(EAST-WEST)/10 ? d.properties.name: ""; } );
};
/* L0 labels ***************************************************** */
var drawL0_labels = function(){
	svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id':'L0_labels',':inkscape:label':'L0_labels'})
		.attr("style", S.L0_labels)
	.selectAll(".countries-label")
        .data(admin_0.features)
      .enter().append("text")
        .attr("style", function(d){ return d.properties.L0 === iso_a2? "visibility:none;":""; })
        .attr("name", function(d) { return d.properties.name ;})
		.attr("x", function (d) { return path.centroid(d)[0]; })
		.attr("y", function (d) { return path.centroid(d)[1]; })
		.text(function(d) { return d.properties.name; });
};
/* L1 labels ***************************************************** */
var drawL1_labels = function(){
	svg.append("g")
		.attr(":inkscape:groupmode","layer")
		.attr({'id':'L1_labels',':inkscape:label':'L1_labels'})
		.attr("style", S.L1_labels)
	.selectAll(".subunit-label")
        .data(L1_focus)
      .enter().append("text")
        .attr("class", function(d){ return d.properties.L0 === iso_a2? "L1_label": "L1_label invisible"; } )
        .attr("name", function(d) { return d.properties.name ;})
		.attr("x", function (d) { return path.centroid(d)[0]; })
		.attr("y", function (d) { return path.centroid(d)[1]; })
		.text(function(d) { return d.properties.name; });
};
	
/* DRAWING ! ***************************************************** */
	timer.now("Start drawing!-----------");
	if(mapType.rich_background){
		drawBackground();							timer.now("Background");
		drawRelief_raster();						timer.now("Relief_raster");
	}else{
		drawBackground();							timer.now("Background");
	}
	if(mapType.base_administrative){ 
		administrativeMeta();  
		drawL0();									timer.now("L0");
	//	drawElevations();
		drawL1();									timer.now("L1");
	}
	if(mapType.base_topography){
		topographicMeta();
		drawL0(); d3.selectAll(hookId+' #L0 > *').attr("style","fill:#94BF8B;");	timer.now("L0");
		drawElevations();															timer.now("Elevations");
		drawL1(); d3.select(hookId+' #L1').attr("style","opacity:0;");				timer.now("L1");
	}
	if(mapType.base_topography || mapType.base_administrative ){ 
		drawHillshade_raster();						timer.now("Hillshade_raster");
		drawRivers();								timer.now("Rivers");
		drawLakes();								timer.now("Lakes");
		drawCoasts();								timer.now("Coasts");
	}
	if(mapType.borders && mapType.base_administrative){
		drawDisputed();	d3.select(hookId+' #Disputed').style({"opacity":0.6});	timer.now("Disputed");
	}else if(mapType.borders && mapType.base_topography){ 
		drawDisputed();	d3.select(hookId+' #Disputed').style({"opacity":0.4});	timer.now("Disputed");}
	if(mapType.borders){ 
		drawL1_borders();							timer.now("L1_borders");
		drawL0_borders();							timer.now("L0_borders");
		drawL1_frames();							timer.now("L1_frames");
	}
	if(mapType.labels){
		drawPlaces_dots();							timer.now("Places_dots");
		drawPlaces_labels();						timer.now("Places_labels");
		drawL0_labels();							timer.now("L0_labels");
		drawL1_labels();							timer.now("L1_labels");
	}
	timer.toll(timer);	

	console.log("layers end");
  }
};//END fn.InjectMap*/



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
		b.cx = (b[1][0] + b[0][0]) / 2;		// center x
		b.cy = (b[1][1] + b[0][1]) /2;		// center y
	//compute meaningful ratio, scale, translation
	var t={};
		t.ratio = ( b.dy / b.dx );
		if (typeof height==="undefined"){ t.height=width*t.ratio;}
		else { t.height = height; console.log("height");}
		t.scale = pd * Math.min( width/b.dx, t.height/b.dy); // default: .9 * ( width / b.dx)
		t.translate = [(width/2- t.scale * b.cx), (t.height/2 - t.scale * b.cy) ]; //translation
	return t;
};

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
};
/* ****************************************************** */
/* TIMER (performance check) **************************** */
// use: var timer = []; timer.push([now(),"comment"]); timer.push([now(),"comment"]); cl.timer(timer);
var timer = { 
	records:[],
	now : function(comment) { timer.records.push([new Date(), comment|| "" ]) },
	toll: function(){
		var array = timer.records;
		for(var i=0; i<array.length -1;i++){ 
        	console.log("Period_"+i+"⟶"+(i+1)+" : " +((array[i+1][0]-array[i][0])/1000).toFixed(3)+"sec.          "+array[i][1]); // local period x<=>x+1
		}	console.log("Period_0⟶"+(array.length-1)+" : "+(array[array.length-1][0]-array[0][0])/1000+"sec. (total) <-----------------------"); // total period
	}
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
