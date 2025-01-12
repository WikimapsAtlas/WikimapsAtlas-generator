**Wikimaps-D3js Atlas** -- A command line utility to convert massive GIS sources into elegant administrative and topographic raster, topojson files and web friendly svg maps.

**Wikimaps-D3js Atlas** takes the power of GIS to the hands of web developpers, graphists, journalists and online readers. A single command let you process super heavy GIS sources such open source administrative [NaturalEarth][a] shapefiles and topographic ETOPO/SRTM tifs into light geojson, [TopoJSON](https://github.com/mbostock/topojson) and SVG files optimized for screens display. XML shapes and groups of shapes keep the most relevant data-attributes (name, iso_2, hasc code, population [and others][b]) allowing rich data binding while the graphic aspect keeps up to modern expectations. We believe our topojson and svg files to be the finest available online due to the smart selection and presence of these data attributes easing **data binding**.

[a]: http://www.naturalearthdata.com/features/
[b]: https://github.com/WikimapsAtlas/make-modules#attributes

## Use case
```
# Generate map for India 
make -f master.makefile NAME=India ISO2=IN WEST=67.0 NORTH=37.5 EAST=99.0 SOUTH=05.0 WIDTH=1280
# Generate maps for all countries. /!\ : May take half a day.
bash ./script/world_atlas_generator.bash ./script/world_atlas_commands.txt 
```

| Topographic-Administrative  | Administrative |
| ------------- | ------------- |
| <img src="doc/WikimapsAtlas-Admin_topographic_relief.png" width="300" float="center"> | <img src="doc/WikimapsAtlas-Admin_relief.png" width="300" float="center"> |
| Topographic  | Administrative localisator |
| <img src="doc/WikimapsAtlas-Topographic.png" width="300" float="center"> | <img src="doc/WikimapsAtlas-Localisator.png" width="300" float="center"> |


Constitutives components (raster, topojson) and derivated variations (jpg, png, svg) are gathered into `/output/{Country_name}/`, as for India it represent about 70 files.

To custom the styles, edit `./js/wikiatlas.js`'s "CSS MODULE", and `./01_topography/` relative color ramps.


## Requirements
CPU :
* GIS processing is CPU needy

Disk space :
* core *data* : 3GB
* precise *dataplus*: +20GB

Environment :
* [`nodejs`](https://nodejs.org/en/download/package-manager/) v6.8.2 (LTS Boron) & `npm`

System dependencies :
* `gdal`, `topojson`, `jsdom`, `d3js`, `python`, `make`.

## Install
**On Linux Ubuntu**, run the following:
```shell
git clone https://github.com/WikimapsAtlas/WikimapsAtlas-generator.git  #get code
cd ./WikimapsAtlas-generator
npm install	 # install node dependencies and system dependencies. May need sudo.
npm run data     # download ETOPO1, NaturalEarth data (default). See ./package.json & data.makefile
# npm run dataplus # download SRTM250, SRTM90, GADM2 data (precise). See ./package.json & data.makefile

```

**On OS X** use [Homebrew](http://mxcl.github.io/homebrew/)'s `brew install <program>`. (Are you on Mac ? Help us to write this section.).

## Projections and dimensions
**Per default**, output files have the following characteristics:
* WGS 84 lat/long reference system
* .shp and .tif are either Non-projected or Mercator projected, with *cartesian* coordinates
* .topo.json are non-projected,
* .svg have Mercator projection done via d3js (see `./js/wikiatlas.js`)
* *Simplified* and *scaled* to best fit the width (default: **1280px**)

Custom projection is possible but not yet implemented. See [issue 1](https://github.com/WikimapsAtlas/make-modules/issues/1).

## Run
### Modules explained
Wikimaps Atlas is usually run via the `master.makefile`, which pass variables to sub-module makefiles generating suit of cropped shp, rasters images, topojson and svgs. Modules can be ran independently as well.

**Master:** When run, the `master.makefile` runs other layer-specialized sub-makefiles. These sub-makefiles process GIS sources, output topoJSON file(s) which `nodejs`, `jsdom`, and `D3js` convert into stand alone SVGs stored in the `./output` folder.

**Topography & reliefs:** When run, the `topography.makefile` download the raster GIS DEM sources, process them (unzip, crop, slice, polygonize, merge), to output an elegant topographic stack of polygons, topojson and WP styled SVG files.

**Hillshade relief:** When run, the `hillshade.makefile` process SRTM sources via crop, hillshading relief, resize, color relief, to output elegant shaded relief png/jpg (current) and topojson/svg.

**Administrative:** When run, the `administrative.makefile` processes the administrative L0 (countries), L1 (subunits), disputed areas and cities (places) GIS sources via unzip, crop, filter, to output elegant topojson files.

**Water:** When run, the `water.makefile` processes the rivers and lakes GIS sources via unzip and crop, to output elegant topojson files.

**D3 (svg generator):** When run, the `d3.makefile` queries the previously generated jpg, png, and topojson in order to create D3js svg visualisations, then printed into stand alone `.svg` files.

### Example
```bash
# master
make -f master.makefile NAME=India ISO2=IN WEST=67.0 NORTH=37.5 EAST=99.0 SOUTH=05.0 WIDTH=1280
# 1. topography raster & vector
make -f master.makefile topography NAME=India ISO2=IN WEST=67.0 NORTH=37.5 EAST=99.0 SOUTH=05.0 SLICES=8
# 2. hillshade module
make -f master.makefile hillshade  NAME=India ISO2=IN WEST=67.0 NORTH=37.5 EAST=99.0 SOUTH=05.0 SLICES=8
# 3. administrative module
make -f master.makefile administrative NAME=India ISO2=IN WEST=67.0 NORTH=37.5 EAST=99.0 SOUTH=05.0
# 4. water module
make -f master.makefile water NAME=India ISO2=IN WEST=67.0 NORTH=37.5 EAST=99.0 SOUTH=05.0
# 5. d3 module (depend on 1,2,3,4)
make -f master.makefile d3    NAME=India ISO2=IN WEST=67.0 NORTH=37.5 EAST=99.0 SOUTH=05.0
```

## API
This API is inspired by `ogr2ogr`, `topojson`, `gdal`, and `convert` (imageMagick) APIs. Elements are ordered by order of apparition, from master, to administrative, to shaded relief, to topography.

Commonly used:

* **NAME**: name of the target/central geographic feature, according to Natural Earth spelling.
* **ISO2**: iso_2 of the target/central geographic feature. While L1 provinces of the target area are in `administrative.topo.json` files, this parameter is used to filter the ones to visualize via d3js. 
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
* **SLICES**: number of elevation levels above sea level.
  * *default*: `8`,
  * *range* : > `2` (!).
* **PLACES**: number of non-capital places to keep. Countries capitals are always kept.
  * *default*: `15`,
  * *range* : `[0-100]`.


Advanced use:

* **PROJECTION**: code of the projection used ([list of projections](http://spatialreference.org/ref/epsg/)). Only affects rasters `.shp` & `.tif` outputs.
  * *default*: `epsg:4326` (equirectangular).
  * *major alternatives*: `epsg:3857` (mercator, requires `S=370400`)
* **SELECTOR_PLACES**: selects and keeps placess (towns and cities) via SQL query.
  * *default*, 15 most populous places: `ADM0NAME = '$(NAME)' AND ORDER BY POP_MAX DESC LIMIT 15` together with all countries capitals.
  * *alternative*, places with population above 2M : `ADM0NAME = '$(NAME)' AND POP_MAX > 2000000`
* **QUANTIZATION**: maximum number of differentiable points along either x or y dimensions
  * *default*: `1e4` (10,000), 
  * *range*: `[1e2,1e5]`.
* **Z** (aka zFactor): vertical exaggeration used to pre-multiply the elevations
  * *default*: `5`,
  * *range*: `>0`.
* **S** (aka scale): vertical exaggeration used to pre-multiply the elevations
  * *default*: `111120` (if surface in decimal degrees and vertical in meters use `S=111120`, if vertical in feets use `S=370400`)
* **AZ**: azimuth of the light, in degrees. 0 if it comes from the top of the raster, 90 from the east, ... The default value, 315, should rarely be changed as it is the value generally used to generate shaded maps.
  * *default*: `315`, 
  * *range*: `[0-359]`.
* **ALT**:  altitude of the light, in degrees. 90 if the light comes from above the DEM, 0 if it is raking light.
  * *default*: `60`,
  * *range*: `[0-90]`.

Under consideration:

* **OPACITY**: opacity for hillshade layer, used in svg files
  * *default*: `1`,
  * *range*: `[0-1]`
* **BLUR**: opacity for hillshade layer, used in svg files
  * *default*: `0`,
  * *range*: `[0-10]`
* **Source**: define the prefered raster DEM source
  * *default*: `etopo`,
  * *range*: `etopo`, `srtm250`, `srtm90`

**Note:** 
 * if the input GIS raster is in feet, then `s` scale should be edited. See `man gdal`.
 * you must have data in the right folder, with correct name, and with correct attributes, as called by the makefiles.


## Ouput
Generated files are moved into `./output/<NAME>/`.

### Constitutive elements
Files below are generated as intermediate steps before the svg maps creation.

* 2 x topographic reliefs files:
  * 1 x `elevations.topo.json`: n slices in vector format to represent signicative elevations of exponential altitude (ex: 0,50,200,500,2000, 5000m). 
  * 1 x `color.jpg` : raster relief with two relative coloramps for landmass and sea. (default: Mercator)
* 2 x  hillshades files:
  * 1 x `trans.png`: a transparent hillshade, see [How to create transparent hillshade?](http://gis.stackexchange.com/questions/144535/how-to-create-transparent-hillshade/144700#144700).  (default: Mercator)
  * 1 x `hillshades.topo.json`: vector version of the previous.
* 5 x administrative files: 
  * 1 x `administrative.topo.json` made by combining the following :
  * 1 x `admin_0.topo.json`: countries
  * 1 x `admin_1.topo.json`: subdivisions of the target country
  * 1 x `disputed.topo.json`: disputed area within the range of the query
  * 1 x `places.topo.json`: cities with population above a given number
* 1 x `waters.topo.json`: major rivers of the area.

### Attributes
Whenever available, these elements are transmitted into the final topojson files : 
* `name`: feature's English name (for all: countries, provinces, disputed, cities, rivers)
* `L0`: feature's country iso2 codes (for countries, provinces, disputed, cities), 
* `L0_3`: feature's iso3 codes (for countries, provinces, disputed, cities), 
* `L1`: feature's province hasc code (for provinces, disputed), [\*](https://github.com/WikimapsAtlas/make-modules/issues/3)
* `L0_name`: feature's country name (for provinces, disputed, cities), 
* `L1_name`: feature's province name (for cities),
* `note`: "claimed by, controlled by" (for disputed areas)
* `status`: feature's status (for cities), 
* `pop`: population (for cities), 
* `scalerank`: river scalerank. 

### End products
Files below are complete web friendly maps.
* Administrative :
  * 1 x `{NAME}_location_map,_admin_relief_(2015)-en.svg` -- raster relief and hillshade, vector admin_0, admin_1, cities, labels, rivers.
  * n x `{NAME},_{Province_name}_locator_map,_admin_relief_(2015)-en.svg` -- idem previous, with provinces enlighten.
  * n x `{NAME},_{Province_name}_locator_map,_admin_blue_(2015)-en.svg` -- idem previous, no reliefs nor hillshades, 100% vector.
  * 1 x `{NAME}_location_map,_admin_blue_(2015).svg` -- no labels.
* Topographic :
  * 1 x `{NAME}_location_map,_admin-topographic_relief_(2015)-en.svg`
  * n x `{NAME},_{Province_name}_locator_map,_admin-topographic_relief_(2015)-en.svg`
  * 1 x `{NAME}_location_map,_admin-topographic_relief_(2015).svg`
  * 1 x `{NAME}_location_map,_topographic_blue_(2015).svg`

We here mirror best practices refined by Wikipedia's cartographers over the past 10 years.

## Reference

* [OGR2ORG documentation](http://www.gdal.org/ogr2ogr.html)
* [ImageMagick/Command-Line Options](http://www.imagemagick.org/script/command-line-options.php)  —— on raster image processing
* Mike Bostock's tutorial [Let's MAKE a Map](http://bost.ocks.org/mike/map/)
* [TopoJSON](https://github.com/mbostock/topojson/wiki) > [API](https://github.com/mbostock/topojson/wiki/API-Reference), [Command Line Reference](https://github.com/mbostock/topojson/wiki/Command-Line-Reference)
, [How to bind data to your topojson?](https://github.com/mbostock/topojson/wiki/Command-Line-Reference#external-properties)
* [D3 > API](https://github.com/mbostock/d3/wiki/API-Reference)
* [D3.geo > API](https://github.com/mbostock/d3/wiki/Geo)

## Tools

* [Topojson > The Distillery](http://hugolpz.github.io/distillery/) —— pre-visualize geojson or topojsons.
* [JSONeditoronline.org](http://jsoneditoronline.org) —— explore json and topojson data structure.
* [D3js Search > Bl.ocksplorer.org](http://bl.ocksplorer.org) —— search d3js gists by d3js methods.
* [OSM Mapzen API](https://github.com/mapzen/vector-datasource/wiki/Mapzen-Vector-Tile-Service) —— serving OSM data as geojson.
* [Wikipedia:MAP/Guidelines](https://en.wikipedia.org/wiki/Wikipedia:WikiProject_Maps/Conventions) 


## Help
Report issues or ideas [on github](https://github.com/WikimapsAtlas/make-modules/issues).


## Authorship

* **Authors:** [Hugo Lopez](http://twitter.com/hugo_lz) —— project design, prototyping, refining. Technologies: git, gdal, ogr2ogr, imagemagick, topojson, nodejs / npm, jsdom, d3js.
* **Help:** [Arun Ganesh](http://twitter.com/planemad) —— project scaling up, automation. Technologies: gdal, ogr2ogr, topojson, d3js, QuantumGIS, PostgreSQL.
* **Help:** [Edouard Lopez](http://twitter.com/edouard_lopez) —— software engineering suppervision. Technologies: make, bash, git, js.

**Supports:** 
* Individuals: cartographers from the French, German, and English Wikipedias, Yuvipanda, Siko Bouterse.
* Organisations : Wikimedia Fundation's [Individual Engagement Grant](http://meta.wikimedia.org/wiki/Grants:IEG/Wikimaps_Atlas), Wikimedia-CH, Wikimedia-FR.

## Licence

[MIT License](./LICENSE) or CC-by-sa-3.0 — LOPEZ Hugo (Yug), for the Wikimedia Foundation.
