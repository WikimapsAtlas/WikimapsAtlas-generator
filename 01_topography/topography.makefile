#DEFAULT VALUES (customizable):
# inherit NAME, WEST, NORTH, EAST, SOUTH from master.makefile or command.
escaped_A = $(subst $e ,_,$(NAME))
#---- DEFAULT VALUES (customizable):
WIDTH=1280
PROJECTION=EPSG:3395
#---- Vectorization
QUANTIZATION=1e4
TOPOJSON_LOC=../node_modules/topojson/bin/topojson
# Topography layer:
SLICES=8
# Hillshade
AZ=315
Z=5
S=111120
# CONTEXT SETTINGS:
SHELL=/bin/bash

#MAKEFILE
done: topojson
	mkdir -p ../output/$(NAME)
	mv levels.topo.json -t ../output/$(NAME)/
	rm -f *.tmp.*

topojson: merge
	$(TOPOJSON_LOC) --id-property none -q $(QUANTIZATION) --simplify-proportion=0.5 -p name=elev  -o levels.topo.json -- levels*.tmp.shp

merge: polygonize_slices zvals
#	ogr2ogr levels.tmp.shp 					level0001.tmp.shp
	Slices=( $$(cat ./slices.tmp.txt) ); \
	for i in "$${Slices[@]}"; do \
		ogr2ogr -update -append levels.tmp.shp level$${i}.tmp.shp; \
	done

polygonize_slices: raster_slice
	Slices=( $$(cat ./slices.tmp.txt) ); \
	for i in "$${Slices[@]}"; do \
		gdal_polygonize.py level$${i}.tmp.tif -f "ESRI Shapefile" level$${i}.tmp.shp level_$${i} elev ;\
	done;

raster_slice: crop zvals
	Slices=( $$(cat ./slices.tmp.txt) ); \
	for i in "$${Slices[@]}"; do \
		gdal_calc.py -A crop_xl.tmp.tif --outfile=level$$i.tmp.tif --calc="$$i*(A>$$i)+1" --NoDataValue=0;\
	done

#---- LOWEST-TOPEST
zvals: resize
	zMin=$$(gdalinfo ./crop_xl.tmp.tif 2>&1 | sed -ne 's/.*z#actual_range=//p'| tr -d ' ' | cut -d "," -f 1 );\
	zMax=$$(gdalinfo ./crop_xl.tmp.tif 2>&1 | sed -ne 's/.*z#actual_range=//p'| tr -d ' ' | cut -d "," -f 2);\
	echo Altidutes range: $$zMin $$zMax ;\
	python ../script/slice.py $$zMin $$zMax $(SLICES) > ./slices.tmp.txt

#--- Background : Color
background_colors: resize
	gdaldem color-relief crop_xs.tmp.tif color_relief-wikimaps.txt color.tmp.tif				# GIS file
	gdalwarp -s_srs EPSG:4326 -t_srs $(PROJECTION) ./color.tmp.tif ./color.tmp.gis.tif			# reproj
	gdal_translate -co COMPRESS=JPEG -co PHOTOMETRIC=YCBCR ./color.tmp.gis.tif ./color.gis.tif	# compress

#---- Crop, Resize
resize: crop
	gdalwarp -of GTiff  -te $(WEST) $(SOUTH) $(EAST) $(NORTH) -ts $(WIDTH) 0 crop_xl.tmp.tif crop_xs.tmp.tif

reproj: crop                 
#	reproj can go here
#	gdalwarp -of GTiff -s_srs EPSG:4326 -t_srs $(PROJECTION) -r cubic crop_xl.tmp.tif reproj.tmp.tif # -s_srs EPSG:4326
crop: clean
	# depending on $(AREA_SIZE), then crop from etopo or srtm
	bash ../script/raster_source.bash $(WEST) $(NORTH) $(EAST) $(SOUTH)
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
#	rm -f *.txt
	rm -f *.xml
#	rm -f *.makefile
