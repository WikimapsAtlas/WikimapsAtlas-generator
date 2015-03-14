#DEFAULT VALUES (customizable):
# inherit ITEM, WEST, NORTH, EAST, SOUTH from master.makefile or command.
escaped_A = $(subst $e ,_,$(ITEM))
WIDTH=1980
#PROJECTION=EPSG:3395
PROJECTION=EPSG:3857
QUANTIZATION=1e4
TOPOJSON_LOC=../node_modules/topojson/bin/topojson
TOPOJSON_GLO=topojson
# Topography layer:
SLICES=8

# CONTEXT SETTINGS:
SHELL=/bin/bash

#MAKEFILE
done: topojson
	mkdir -p ../output/$(ITEM)
	mv levels.topo.json levels.tmp.geo.json -t ../output/$(ITEM)/

topojson: geojsonize
	$(TOPOJSON_LOC) --id-property none -q $(QUANTIZATION) --simplify-proportion=0.5 -p name=elev -o levels.topo.json -- levels.tmp.geo.json
	# --simplify-proportion=0.05 

geojsonize: merge
	ogr2ogr -f GeoJSON -where "elev < 10000" levels.tmp.geo.json levels.tmp.shp

merge: polygonize_slices zvals
#	ogr2ogr levels.tmp.shp 					level0001.tmp.shp
	Slices=( $$(cat ./tmp.txt) ); \
	for i in "$${Slices[@]}"; do \
		echo $$i ;\
		ogr2ogr -update -append levels.tmp.shp level$${i}.tmp.shp; \
	done

polygonize_slices: raster_slice zvals
	Slices=( $$(cat ./tmp.txt) ); \
	for i in "$${Slices[@]}"; do \
		echo $$i ;\
		gdal_polygonize.py level$${i}.tmp.tif -f "ESRI Shapefile" level$${i}.tmp.shp level_$${i} elev ;\
	done;

raster_slice: crop zvals
	Slices=( $$(cat ./tmp.txt) ); \
	for i in "$${Slices[@]}"; do \
		echo $$i ;\
		gdal_calc.py -A crop.tmp.tif --outfile=level$$i.tmp.tif --calc="$$i*(A>$$i)" 	--NoDataValue=0;\
	done

#---- LOWEST-TOPEST
zvals: crop
	zMin=$$(gdalinfo cropXL.tmp.tif 2>&1 | sed -ne 's/.*z#actual_range=//p'| tr -d ' ' | cut -d "," -f 1 );\
	zMax=$$(gdalinfo cropXL.tmp.tif 2>&1 | sed -ne 's/.*z#actual_range=//p'| tr -d ' ' | cut -d "," -f 2);\
	echo $$zMin;\
	echo $$zMax;\
	python slice.py $$zMin $$zMax $(SLICES) > ./tmp.txt

#---- Crop, resize, regeolocalise
crop: clean
	gdal_translate -projwin $(WEST) $(NORTH) $(EAST) $(SOUTH) ../data/noaa/ETOPO1_Ice_g_geotiff.tif cropXL.tmp.tif
	gdalwarp -of GTiff -s_srs epsg:4326 -t_srs $(PROJECTION) -te $(WEST) $(SOUTH) $(EAST) $(NORTH) \
		-ts $(WIDTH) 0 cropXL.tmp.tif crop.tmp.tif
	# ulx uly lrx lry (geodegrees)  // W N E S #todo: add name parameter
#	convert crop.origin.tif 	-resize $(WIDTH) crop.small.tif
#	gdal_translate -a_ullr $(WEST) $(NORTH) $(EAST) $(SOUTH) crop.small.tif crop.tmp.tif
#	gdalinfo -mm crop.tmp.tif

clean:
	rm -f *.json
	rm -f *.dbf
	rm -f *.prj 
	rm -f *.shp
	rm -f *.shx
	rm -f *.tmp.*
#	rm -f *.tif
#	rm -f *.tiff
	rm -f *.html
	rm -f *.txt
	rm -f *.xml
#	rm -f *.makefile
