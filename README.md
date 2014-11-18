NOTE : PROJECT & DOCUMENTATION ARE ONGOING. 
`<section title> (xx%)` EXPRESS THE SECTION'S DEGREE OF COMPLETION.

# WikimapsAtlas
Wikimaps Atlas makefiles and Single Page Applications takes the power of GIS to the hands of common webdevs, graphists, scientists, journalists and online readers.  Excessively heavy GIS sources are processed into geojson, [TopoJSON](https://github.com/mbostock/topojson) and SVG optimized for screens display. Shapes and groups of shapes keep key metadatas allowing rich data binding while the graphic side keep up to the solid and elegant Wikipedia Map Conventions (cf references). You output maps of any large area.

![ORGANIGRAM][1]

[1]: http://i.stack.imgur.com/Vc0qK.png

## Installation (100%)
We will install gdal, nodejs, npm's modules topojson and jsdom, as well as NaturalEarth and SRTM GIS data.

**On Linux Ubuntu**, run the following:
```shell
sudo apt-get install git make  # tools needed for install
git clone git@github.com:WikimapsAtlas/make-modules.git #get code
cd ./make-modules
make -f ./install.makefile     # install needed tools
make -f ./data.makefile        # install default data (recommanded)
```

**On OS X** use [Homebrew](http://mxcl.github.io/homebrew/)'s `brew install <program>`. (Are you on Mac ? We need Mac users feedbacks and welcome a brew version of our linux installation process!).

**Help needed?** Please report issues or ideas [to us](https://github.com/WikimapsAtlas/make-modules/issues).

## Projections and dimensions (100%)
**Per default**, output files have the following characteristics:
* WGS 84 lat/long reference system
* Non-projected or Mercator projected, *cartesian* coordinates
* *Simplified* and *scaled* to best fit a width of **1980px**

**Reprojection** is possible by editing at several points. As these modules are serverside, we recommand to reproject ([list of projections](http://spatialreference.org/ref/epsg/)) early on, before or at the top of the crop task:
```bash
# using ogr2ogr 
ogr2ogr -f 'ESRI Shapefile' -t_srs 'EPSG:...' output.shp input.shp
# then crop vector files via ogr2ogr -clipsrc, raster files via gdal_translate -projwin.
```

Within the nodejs module, D3js codes should be keep projection-agnostic, something such: 
```javascript
var path = d3.geo.path()
    .projection(null);
```
For more, see [Reproject shp/topojson : ways to reproject my data and comparative manual?](http://stackoverflow.com/questions/23086493/)

## Use
Wikimaps Atlas is usually run using the `master.makefile`, which pass variables to sub-module makefiles generating a full suit of topojson and svgs. Modules can be ran independently as well.

### Master (100%)
**Action:** When run, the `master.makefile` runs other layer-specialized sub-makefiles. These sub-makefiles download process the GIS sources, output topoJSON file(s) which `nodejs`, `jsdom`, and `D3js` codes can convert into stand alone SVGs. Command:
```bash
    make -f master.makefile ITEM=India WEST=67.0 NORTH=37.5  EAST=99.0 SOUTH=05.0 WIDTH=1800
```
Sub-makefiles could also be run separatedly.

### Administrative  (100%)

**Action:** When run, the `administrative.makefile` download administrative L0 (countries), L1 (subunits), and cities (places) GIS sources, process them (unzip, crop, filter), to output an elegant composite stack of your target L1 district upon L0 backgrounds, as topojson and WP styled SVG files. Direct command :

    make -f administrative.makefile ITEM=India WEST=67.0 NORTH=37.5  EAST=99.0 SOUTH=05.0 SELECTOR_L1="admin IN ('INDIA')"

### Topography (100%)
**Action:** When run, the `topography.makefile` download the raster GIS DEM sources, process them (unzip, crop, slice, polygonize, merge), to output an elegant topographic stack of polygons, topojson and WP styled SVG files. Direct command :

    make -f topography.makefile ITEM=India WEST=67.0 NORTH=37.5  EAST=99.0 SOUTH=05.0 SLICES=8

### Shaded relief (100%)
**Action:** When run, the `shadedrelief.makefile` download the raster GIS DEM sources, process them (unzip, crop, shaded relief, resize, colorize), to output several elegant shaded relief png/jpg (current) or topojson/svg (planned). Needs WNES. Direct command :

    make -f shadedrelief.makefile ITEM=India WEST=67.0 NORTH=37.5  EAST=99.0 SOUTH=05.0 SLICES=8

For similar data and similar px dimensions, file sizes are `.tif`:5.0MB, `.png`:1.6MB, `.jpg`:239KB. Also, whenever possible and relevant, we use the lighter format.

## Ouput
Generated files are built with a strict structure. Polygons have clear `id` allowing easy **data biding**. By default, we propose a basic serie of combinations into refined, data binding friendly svgs maps.

### Basic elements (80%)
* administrative.topo.json, containing:
 * `admin_0` (countries)
 * `admin_1` (subdivisions of the target country)
 * `places` (cities with population above a given number):
* topographic: 
 * levels.geo.json
 * levels.topo.json
* 2 hillshades:
 * hillshade_grey (GIS tif)
 * hillshade_trans (png)
* 1 color-relief (wikipedia style):
 * color+hillshade_000pc (GIS tif)
* 1 composite:
 * color+hillshade_multiply (jpg)

### Refined svg (30%)
We mirror best practices refined by Wikipedia cartographers over the past 8 years.
* Administrative
 * {ITEM}_administrative_location_map.svg -- without labels
 * {ITEM}_administrative_location_map-en.svg -- with English labels
* Waters
 * {ITEM}_rivers_location_map.topojson
* Topography (vector)
 * {ITEM}_topography_location_map.svg
* Shaded relief:
 * {ITEM}_shaded_relief_map-transparent.png
 * {ITEM}_shaded_relief_map-white.jpg
 * {ITEM}_shaded_relief_map-wikimaps.jpg (wp colored relief)
* Localisator:
 * {ITEM}_globe_localisator.svg

## API
This API is inspired by `ogr2ogr`, `topojson`, `gdal`, and `convert` (imageMagick) APIs. Elements are ordered by order of apparition, from master, to administrative, to shaded relief, to topography.

* **ITEM**: name of the target/central geographic item, according to Natural Earth spelling.
* **WEST**: Westernmost longitude value of the bounding box. 
 * *range*: `[180.0,-180.0]`.
* **NORTH**: Northernmost latitude value of the bounding box.
 * *range*: `[80.0,-80.0]` (GIS data often missing for poles)
* **EAST**: Easternmost longitude value of the bounding box.
 * *range*: `[180.0,-180.0]`.
* **SOUTH**: Southernmost latitude value of the bounding box.
 * *range*: `[80.0⁰,-80.0]` (GIS data often missing for poles)
* **WIDTH**: width of the final SVG and associated bitmaps (tif, png). The EIGHT is calculated from `WNES` values and the `WIDTH`.
 * *default*: `1980` (px), 
 * *range*: `>0`.
* **SELECTOR_L1**: selects and keeps L1 administrative areas via SQL query.
 * *default*: `"admin IN ('India')"`
* **SELECTOR_PLACES**: selects and keeps placess (towns and cities) via SQL query.
 * *default*, 30 biggest places: `ADM0NAME = '$(ITEM)' AND ORDER BY POP_MAX DESC LIMIT 30`
 * *alternative*, places with population above 2M : `ADM0NAME = '$(ITEM)' AND POP_MAX > 2000000`
* **QUANTIZATION**: maximum number of differentiable points along either x and y dimensions
 * *default*: `1e4`, 
 * *range*: `[1e2,1e5]`.
* **Z** (aka zFactor): vertical exaggeration used to pre-multiply the elevations
 * *default*: `5`,
 * *range*: `>0`.
* **AZ**: azimuth of the light, in degrees. 0 if it comes from the top of the raster, 90 from the east, ... The default value, 315, should rarely be changed as it is the value generally used to generate shaded maps.
 * *default*: `315`, 
 * *range*: `[0-359]`.
* **ALT**:  altitude of the light, in degrees. 90 if the light comes from above the DEM, 0 if it is raking light.
 * *default*: `60`,
 * *range*: `[0-90]`.
* **FUZZ** (fuzzy selection): colors within this distance of grey 50% are considered equal it and processed.
 * *default*: `7`,
 * *range*: `[0-100]`.
* **SHADOW**: opacity of the hillshade upon color-relief
 * *range*: `[0-100]`.
<!-- Topography: -->
* **SLICES**: number of elevation levels above sea level.
 * *default*: `8`,
 * *range* : > `2` (!). 

**Note:** 
 * if the input GIS raster is in feet, then `s` scale should be edited. See `man gdal`.
 * you must have data in the right folder, with correct name, and with correct attributes, as called by the makefiles.

## Gallery of Examples

* {HAND OF SCREENSHOT EXAMPLE HERE}

## Manuals of reference

* [OGR2ORG documentation](http://www.gdal.org/ogr2ogr.html)
* [ImageMagick/Command-Line Options](http://www.imagemagick.org/script/command-line-options.php)  —— on raster image processing
* Mike Bostock's tutorial [Let's MAKE a Map](http://bost.ocks.org/mike/map/)
* [TopoJSON](https://github.com/mbostock/topojson/wiki)
 * [TopoJSON > API](https://github.com/mbostock/topojson/wiki/API-Reference)
 * [TopoJSON > Command Line Reference](https://github.com/mbostock/topojson/wiki/Command-Line-Reference)
 * [Topojson > External properties](https://github.com/mbostock/topojson/wiki/Command-Line-Reference#external-properties) —— to bind data to your topojson.
* [D3 > API](https://github.com/mbostock/d3/wiki/API-Reference)
* [D3.geo > API](https://github.com/mbostock/d3/wiki/Geo)

## Tools

* [Topojson > The Distillery](http://hugolpz.github.io/distillery/) —— pre-visualize geojson or topojsons.
* [JSONeditoronline.org](http://jsoneditoronline.org) —— explore json and topojson data structure.
* [OSM Mapzen API](https://github.com/mapzen/vector-datasource/wiki/Mapzen-Vector-Tile-Service) —— serving OSM data as geojson.
* [Wikipedia:MAP/Guidelines](https://en.wikipedia.org/wiki/Wikipedia:WikiProject_Maps/Conventions) 


## Licence (100%)

Copyright 2014 [MIT License](./LICENSE) — LOPEZ Hugo, GANESH Arun, LOPEZ Edouard.

## Authors (100%)

* [Hugo Lopez](http://twitter.com/hugo_lz) —— project design, prototyping, refining. Technologies: gdal, ogr2ogr, imagemagick, topojson, nodejs, jsdom, d3js.
* [Arun Ganesh](http://twitter.com/planemad) —— project improvement, scaling up, automation. Technologies: gdal, ogr2ogr, topojson, d3js, QuantumGIS, PostgreSQL.
* [Edouard Lopez](http://twitter.com/edouard_lopez) —— software engineering suppervision. Technologies: make, bash, git, js.

## Supports (100%)

Individuals: cartographers from the French, German, and English Wikipedias, Yuvipanda, Siko Bouterse.

Organisations : Wikimedia Fundation's [Individual Engagement Grant](http://meta.wikimedia.org/wiki/Grants:IEG/Wikimaps_Atlas), Wikimedia-CH, Wikimedia-FR.
