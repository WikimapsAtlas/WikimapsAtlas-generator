```
This file gather *all* the commands and *only* the commands used by the Wikimaps_Atlas' make-modules.


=============================================================
SERVER ======================================================

http-server: http-server is a simple, zero-configuration command-line http server. 
	node ./node_modules/.bin/http-server --cors &

forever: maintains following command up and running
	node ./node_modules/.bin/forever ./node_modules/.bin/http-server --cors &


=============================================================
MAKEFILES ===================================================

man MAKEFILE: make - GNU make utility to maintain groups of programs
	-C dir, --directory=dir
		Change to directory `dir` before reading the makefiles or doing anything else. If multiple -C options are specified, each is  interpreted relative to the previous one: -C / -C etc is equivalent to -C /etc.  This is typically used  with  recursive  invocations  of make.
	-f file, --file=file, --makefile=FILE
		Run `file` as a makefile.
	.PHONY: make tasks do their job systematically without checking if the output files exist and is recent or not.
	@
		run command silently.
	$@ 
		value of the current task's name.
	myvar=something
		Assign "something" to variable `myvar`. Called via `$(myvar)`.
	$$
		Escaped "$", to avoid conflit with makefile variables such in `$(myvar)`.

See also: https://devhints.io/makefile

=============================================================
GIS TOOLS ===================================================

man OGR2OGR ---- converts simple features data between file formats
	-clipsrc [xmin ymin xmax ymax]|WKT|datasource|spat_extent:
		(starting with GDAL 1.7.0) clip geometries to the specified bounding box (expressed in source SRS), WKT geometry (POLYGON or MULTIPOLYGON), from a datasource or to the spatial extent of the -spat option if you use the spat_extent keyword. When specifying a datasource, you will generally want to use it in combination of the -clipsrclayer, -clipsrcwhere or -clipsrcsql options
	-sql <selector> -dialect SQLITE:
	-spat xmin ymin xmax ymax:
		spatial query extents. Only features whose geometry intersects the extents will be selected. The geometries will not be clipped unless -clipsrc is specified

man TOPOJSON ---- 
	-p, properties : https://github.com/mbostock/topojson/wiki/Command-Line-Reference#properties
	-q, --quantization, --no-quantization:
		maximum number of differentiable points along either dimension
	-s, --simplify:
		precision threshold for Visvalingam simplification
	--simplify-proportion:
		proportion of points to retain for Visvalingam simplification
	--width:
		scale and translate to fit a viewport of the specified width
	--height:
		scale and translate to fit a viewport of the specified height

man GDALDEM ----  gdaldem Tools to analyze and visualize DEMs. (since GDAL 1.7.0)
> hillshade: to generate a shaded relief map from any GDAL-supported elevation raster
	-z zFactor:
		vertical exaggeration used to pre-multiply the elevations
	-s scale:
		ratio of vertical units to horizontal. If the horizontal unit of the source DEM is degrees (e.g Lat/Long WGS84 projection) and vertial unites are in meters use scale=111120, if the vertical units are in feets use scale=370400
	-az azimuth:
		azimuth of the light, in degrees. 0 if it comes from the top of the raster, 90 from the east, ... The default value, 315 (aka 10:30am), should rarely be changed as it is the value generally used to generate shaded maps.
	-alt altitude:
		altitude of the light, in degrees. 90 if the light comes from above the DEM, 0 if it is raking light.

> color-relief : to generate a color relief map from any GDAL-supported elevation raster
	$ gdaldem color-relief input.tif color_table.txt output.tif
	# Color tiff depending on color_relief.txt file. Color_table.txt syntax: elevation R G B. 
	# Elevation as: floating point value, `nv` keyword, or percentage.
	# 0% being the minimum value found in the raster, 100% the maximum value.

man GDAL_polygonize.py ---- produces a polygon feature layer from a raster
	raster_file
		The source raster file from which polygons are derived.
	-b band:
		The band on raster_file to build the polygons from.
	-f ogr_format
		Select the output format of the file to be created. Default is GML.
	out_file
		The destination vector file to which the polygons will be written.
	layer
		The name of the layer created to hold the polygon features.
	fieldname
		The name of the field to create (defaults to "DN").

man GDAL_calc.py ---- Command line raster calculator with numpy syntax												   --/!\def of --calc & --noDataValue to recheck online.
	$	gdal_calc.py -A crop.tif --outfile=level0050.tif --calc="50*(A>50)" --NoDataValue=0
	-A
		input file.
	--oufile=file.ext
		output file.
	--calc="y*(A>x)"
		for each point of A>x is true (true=1), point value set to y*1. Allows conditional calculation depending on a Boolean's truthyness.
	--NoDataValue=x
		for each point without value, assign value=x.

man GDAL_translate.py ---- gdal_translate converts raster data between different formats.
	$gdal_translate -projwin $(WEST) $(NORTH) $(EAST) $(SOUTH) world.tif crop.tif
	-projwin ulx uly lrx lry:
		Selects a subwindow from the source image for copying, using corners given in georeferenced decimal coordinates.
	-stats:
		(GDAL >= 1.8.0) Force (re)computation of statistics.
	-a_ullr ulx uly lrx lry
		Assign/override the georeferenced bounds of the output file.
	-co (http://www.gdal.org/frmt_gtiff.html). Compression may be important:  input.tiff:5.0MB, o.png:1.6MB, o.jpg:239KB
		COMPRESS=[JPEG/LZW/PACKBITS/DEFLATE/CCITTRLE/CCITTFAX3/CCITTFAX4/NONE]
		PHOTOMETRIC=[MINISBLACK/MINISWHITE/RGB/CMYK/YCBCR/CIELAB/ICCLAB/ITULAB]
		ALPHA=[YES/NON-PREMULTIPLIED/PREMULTIPLIED/UNSPECIFIED]: This is necessary if you want to produce a greyscale TIFF file with an alpha band in -b 2, for instance.
		Frequent compression settings : JPEG + YCBCR for colored ; JPEG + RGB for grey scales ; LZW + ALPHA=YES for greyscales with transparency.

=============================================================
IMAGE PROCESSING ============================================
######## THIS IMAGE SECTION IS A DRAFT TO CONTINUE #############

Note: Use `gdal` for process in the field of GIS files whenever possible. See gdal_calc & co.
Using `convert` destroys GIS metadata therefor must be extracted then reinjected.

man CONVERT:
	convert *.svg -set filename:base "%[basename]" "%[filename:base].png"
	mkdir -p png/ ;
	convert *kiri_*.svg -set filename:base "%[basename]" "./png/%[filename:base].png"
man MOGRIFY:
	mogrify -format png *.svg 

=============================================================
UTILITIES : =================================================

man SED: sed ---- stream editor for filtering and transforming text.
	$sed -ne 's/pattern_before_match *:,//p' #print match within the current line.
	's/regexp/replacement/'
		Attempt to match regexp against the pattern space. If successful, replace that portion matched with replacement. The replacement may contain the special character & to refer to that portion of the pattern space which matched, and the special escapes \1 through \9 to refer to the corresponding matching sub-expressions (back-references) in the regexp.
	p
		Print the current pattern space.

man UNZIP: unzip ---- list, test and extract compressed files in a ZIP archive 
	$unzip -n ../data/file.zip '*.tif' -d './tmp/' # from inside file.zip, extract the *.tif only.
	-n 		never overwrite existing files.  If a output file already exists, skip the extraction of the input file without prompting. 
	'...'
		(regex) filters files within the rar, extract matches
	-d
		extract to target directory.
man UNRAR: extract files from rar archives
	$unrar e -o- './dir/file.rar' '*.tif' ./dir/
	e 		Extract files to current directory.
	-o-		Do not overwrite existing files.

man TOUCH: touch ---- change file timestamps
	$touch file.png

man CURL: curl - transfer a URL
	$curl -L -C - 'http://site.net/file.zip' -o ../data/file.zip
	-o 
		output file.
	-L, --location
		follow webpage's redirects.
	-C, --continue-at <offset>
		Continue/Resume a previous file transfer at  the  given  offset.
		Use "-C -" to tell curl to automatically find out  where/how  to resume  the  transfer. It then uses the given output/input files to figure that out.

man MKDIR: mkdir ---- make directories
	$mkdir -p ../data/ ../data/ETOPO1 			#create 2 dirs
	-p, --parents
		no error if existing, make parent directories as needed


man RM: rm ---- remove files or directories
	$rm -f *.png    #removes all *.png
	-f, --force
		ignore nonexistent files and arguments, never prompt
	-r, -R, --recursive
		<EXTREMLY DANGEROUS. @HUMANS: GET 1 MINUTE BREAK BEFORE EACH USE:> remove directories and their contents recursively. 

=============================================================
=============================================================
```