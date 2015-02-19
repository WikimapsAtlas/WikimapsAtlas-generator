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
module.exports = {
	locationMap : function(hookId, width, target, title, WEST, NORTH, EAST, SOUTH){
	
/* SETTINGS ******************************************************************** */
// SVG injection:
var width  = 600;
var svg = d3.select("#hook").append("svg")
		.attr("width", width)
		.attr('xmlns','http://www.w3.org/2000/svg')
		.attr('xlink','http://www.w3.org/1999/xlink')
		.attr(':xmlns:geo','http://www.example.com/boundingbox/')
		.attr(':xmlns:inkscape','http://www.inkscape.org/namespaces/inkscape');
/* Tags:
	console.log(d3.ns.prefix);
//	d3.ns.prefix.geo = "http://www.example.com/boundingbox/";
//	d3.ns.prefix.inkscape ="http://www.inkscape.org/namespaces/inkscape";
	console.log(d3.ns.prefix); */

	//	d3.ns.qualify("geo:bb");
	svg.append(":geo:g").attr("id","geo")
    	.attr(':geo:syntax', "WSEN bounding box in decimal degrees")
    	.attr(':geo:WEST',  WEST)
    	.attr(':geo:SOUTH', SOUTH)
    	.attr(':geo:EAST',  EAST)
    	.attr(':geo:NORTH', NORTH)
    	.attr(':geo:Title', title);
	
// Projection default
var projection = d3.geo.mercator()
		.scale(1)
		.translate([0, 0]);
var path = d3.geo.path()
		.projection(projection); //  .pointRadius(4)
	
injectPattern("#hook svg"); //Pattern injection : disputed-in, disputed-out

 
// Data (getJSON: TopoJSON)
d3.json("../output/"+target+"/administrative.topo.json", function(error, Stone) {

/* DATA ********************************************************** */
    var admin_0   = topojson.feature(Stone, Stone.objects.admin_0),
        admin_1   = topojson.feature(Stone, Stone.objects.admin_1),
        disputed  = topojson.feature(Stone, Stone.objects.disputed),
        places    = topojson.feature(Stone, Stone.objects.places),
		coast     = topojson.mesh(Stone, Stone.objects.admin_0, function(a,b) { return a===b;}),
        L0_border = topojson.mesh(Stone, Stone.objects.admin_0, function(a,b) { return a!==b;}),
		L1_border = topojson.mesh(Stone, Stone.objects.admin_1, function(a,b) { 
			return a !==b && a.properties.L0 === b.properties.L0 && a.properties.L0 === target;
		}),
		neighbors = topojson.neighbors(Stone.objects.admin_1.geometries); // coloring: full line

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
	var t = getTransform(admin_0,-1,width, projection); // NEED BB. Island are tied otherwise.
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
	// Oceans rasters : INACTIVE
	getImageBase64('../output/'+target+'/image.png', function (image) {
		bg.append("g")
			//.attr("transform","scale(1, 1)")
			.attr(":inkscape:groupmode","layer")
			.attr({'id':'topography_(raster)',':inkscape:label':'topography_(raster)'})
		.append("image")
			.attr("class", "topography_raster")
		  .attr("href", "data:image/png;base64," + image)
			.attr("width", width)
			.attr("height", t.height)
			.style("opacity", 0.1); // replace href link by data URI, d3js + client handle the missing xlink
	})
/* Polygons ****************************************************** */
//Append L0 polygons 
	var L0 = svg.append("g")
 		.attr(":inkscape:groupmode","layer")
		.attr({'id':'L0',':inkscape:label':'L0'})
	.selectAll(".countries")
        .data(admin_0.features)
      .enter().append("path")
        .attr("class", "L0")
        .attr("style", function(d){ return d.properties.L0 === target? S.focus : S.land; } )
        .attr("name", function(d) { return d.properties.id; })
        //.style("fill", function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return subunits[n].color; }) + 1 | 0); })  // coloring: fill
        .attr("d", path)
		.on("click", click);
 
//Append L1 polygons 
    var L1 = svg.append("g")
 		.attr(":inkscape:groupmode","layer")
		.attr({'id':'L1',':inkscape:label':'L1'})
	.selectAll(".subunit")
        .data(admin_1.features)
      .enter().append("path")
        .attr("class", function(d){ return d.properties.L0 === target? "L1": "L1 invisible"; } )
        .attr("style", function(d){ return d.properties.L0 === target? S.focus : S.land; } )
        .attr("name", function(d) { return d.id; })
        .attr("d", path )
        //.style("fill", function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return subunits[n].color; }) + 1 | 0); })  // coloring: fill
       // .on("mouseover", )
		.on("click", click);
	

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
        .attr("fill", function(d){ return d.properties.L0 === target? "url(#hash2_4)": "url(#hash4_2)"} )
		.attr("name", function(d) { return d.id; })
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
		.attr("x", function (d) { return path.centroid(d)[0] })
		.attr("y", function (d) { return path.centroid(d)[1] })
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
		.attr("status", function(d){return d.properties.status})
		.attr("style",function(d){ 
		    var s,t;
            d.properties.status==="Admin-0 capital"? s=wp.label.xl:
            d.properties.status==="Admin-1 capital"? s=wp.label.md : s="";
		    d.geometry.coordinates[0] < EAST-(EAST - WEST)/10? t= "" : t="text-anchor:end;";
			return s = s+t;
		})
        .attr({"dy":".33em","x":function(d) { return d.geometry.coordinates[0] < EAST-(EAST-WEST)/10 ? 8 : -8; } }) // avoid dot overlap
		.attr("transform",  function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
        .text(function(d) { return d.geometry.coordinates[0] < EAST-(EAST-WEST)/10 ? d.id: "" } );



/* L1 labels ***************************************************** */
    svg.append("g")
 		.attr(":inkscape:groupmode","layer")
		.attr({'id':'L1_labels',':inkscape:label':'L1_labels'})
		.attr("style", S.L1_labels)
	.selectAll(".subunit-label")
        .data(admin_1.features)
      .enter().append("text")
        .attr("class", function(d){ return d.properties.L0 === target? "L1_label": "L1_label invisible"; } )
        .attr("data-name", function(d) { return d.id ;})
		.attr("x", function (d) { return path.centroid(d)[0] })
		.attr("y", function (d) { return path.centroid(d)[1] })
		.text(function(d) { return d.id; });
})
}//END fn.InjectMap*/

,

/* ****************************************************** */
/* D3 helpers ****************************** */
getTransform : function(d,padding_pc, width, projection) { 
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

}; // end module


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
		if (window.location.protocol === 'https:') { e.setAttribute('src', 'https://rawgit.com/NYTimes/svg-crowbar/gh-pages/svg-crowbar.js'); } 
		else { e.setAttribute('src', 'http://nytimes.github.com/svg-crowbar/svg-crowbar.js'); } 
		e.setAttribute('class', 'svg-crowbar'); 
		document.body.appendChild(e); })
	.text(" Download"); /* -- Works on Chrome. Feedback welcome for others web browsers.*/
}


/* ****************************************************** */
/* SELECT LANGUAGE MODULE ******************************* */
// 1_wiki_translate


/* ****************************************************** */
/* SELECT ITEM MODULE *********************************** */
// in _location



/* ****************************************************** */
/* REPROJECTION TOOLS MODULE **************************** */





