#DEFAULT VALUES (customizable):
# inherit NAME, WEST, NORTH, EAST, SOUTH from master.makefile or command.
escaped_A = $(subst $e ,_,$(NAME))
#---- DEFAULT VALUES (customizable):
WIDTH=2000
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
end:  background_colors topojson
	mkdir -p ../output/$(NAME)
	mv ./*.{gis.tif,*.json} -t ../output/$(NAME)/
	rm -f *.tmp.*

topojson: vector_slices
	$(TOPOJSON_LOC) --id-property none \
		-q $(QUANTIZATION) \
		--simplify-proportion=0.25 \
		-o elevations.topo.json --  \
		`ls elevation[^a-zA-Z]*.tmp.shp|sort -k1.10n | sed 's/\(elevation\([^a-zA-Z]*\).tmp.shp\)/elevation_\2=\1/' | tr '\n' ' '`

vector_slices: raster_slices
	Slices=( $$(cat ./slices.tmp.txt) ); \
	for i in "$${Slices[@]}"; do \
		gdal_polygonize.py elevation$${i}.tmp.tif -f "ESRI Shapefile" elevation$${i}.tmp.shp elevation_$${i} elev ;\
	done;

raster_slices: crop zvals
	Slices=( $$(cat ./slices.tmp.txt) ); \
	for i in "$${Slices[@]}"; do \
		gdal_calc.py -A crop_xs.tmp.tif --outfile=elevation$${i}.tmp.tif --calc="($${i}+1)*(A>$${i})" --NoDataValue=-15000; \
	done

#---- LOWEST-TOPEST
zvals: resize
	zMin=$$(gdalinfo -mm ./crop_xl.tmp.tif | sed -ne 's/.*Computed Min\/Max=//p'| tr -d ' ' | cut -d "," -f 1 | cut -d . -f 1);\
	zMax=$$(gdalinfo -mm ./crop_xl.tmp.tif | sed -ne 's/.*Computed Min\/Max=//p'| tr -d ' ' | cut -d "," -f 2 | cut -d . -f 1);\
	echo Altidutes range: $$zMin $$zMax ;\
	python ../script/slice.py $$zMin $$zMax $(SLICES) > ./slices.tmp.txt

#--- Background : Color
background_colors: resize
	gdal_calc.py -A crop_xs.tmp.tif       --outfile=crop_xs_land.tmp.tif --calc="A*(A>=0)-1*(A<0)" --NoDataValue=-1 # gdallocationinfo ./crop_xs_land.tmp.tif -valonly 10 1800   > -1 (as by --calc="")
	gdal_calc.py -A crop_xs_etopo.tmp.tif --outfile=crop_xs_sea.tmp.tif  --calc="A*(A<0)+1*(A>=0)" --NoDataValue=1 # gdallocationinfo ./crop_xs_sea.tmp.tif  -valonly 10 1800   > -4567
	gdaldem color-relief crop_xs_land.tmp.tif color_relief-wikimaps_land.txt crop_xs_land_color.tmp.vrt 	# gdallocationinfo ./color_land.tmp.vrt   -valonly 10 1800   > null: 0,0,0 (due to color ramp)
	gdaldem color-relief crop_xs_sea.tmp.tif  color_relief-wikimaps_sea.txt  crop_xs_sea_color.tmp.vrt  	# gdallocationinfo ./color_sea.tmp.vrt    -valonly 10 1800   > val : 22,59,94 (due to color ramp)
	gdalwarp  crop_xs_land_color.tmp.vrt crop_xs_land_color.tmp.tif		# tif get 3 bands (RGB) 						# 
	gdalwarp  crop_xs_sea_color.tmp.vrt  crop_xs_sea_color.tmp.tif		# tif get bands (RGB)  						#
	#merge attempts
	gdal_merge.py -o color.tmp.tif -n 0 crop_xs_land_color.tmp.tif crop_xs_sea_color.tmp.tif
#	gdaldem color-relief crop_xs.tmp.tif color_relief-wikimaps_pc.txt color.tmp.tif					# GIS file
	gdalwarp -s_srs EPSG:4326 -t_srs $(PROJECTION) ./color.tmp.tif ./color_reproj.tmp.tif			# reproj
	gdal_translate -co COMPRESS=JPEG -co PHOTOMETRIC=YCBCR ./color_reproj.tmp.tif ./color.gis.tif	# compress

#---- Crop, Resize
resize: crop
	echo "Resize various raw raster for speed"
	gdalwarp -of GTiff  -te $(WEST) $(SOUTH) $(EAST) $(NORTH) -ts $(WIDTH) 0 crop_xl.tmp.tif crop_xs.tmp.tif
	# gdalwarp -of GTiff  -te $(WEST) $(SOUTH) $(EAST) $(NORTH) -ts `expr $(WIDTH) \* 2` 0 crop_xl.tmp.tif crop_sm.tmp.tif
	gdalwarp -of GTiff  -te $(WEST) $(SOUTH) $(EAST) $(NORTH) -ts $(WIDTH) 0 crop_xl_etopo.tmp.tif crop_xs_etopo.tmp.tif

reproj: crop                 
#	reproj can go here
#	gdalwarp -of GTiff -s_srs EPSG:4326 -t_srs $(PROJECTION) -r cubic crop_xl.tmp.tif reproj.tmp.tif # -s_srs EPSG:4326
crop: clean
	# depending on $(AREA_SIZE), then crop from etopo or srtm
	bash ../script/get_raster_source.bash $(WEST) $(NORTH) $(EAST) $(SOUTH)
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
