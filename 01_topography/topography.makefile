#DEFAULT VALUES (customizable):
# inherit NAME, WEST, NORTH, EAST, SOUTH from master.makefile or command.
escaped_A = $(subst $e ,_,$(NAME))
WIDTH=1280
PROJECTION=EPSG:3395
QUANTIZATION=1e4
TOPOJSON_LOC=../node_modules/topojson/bin/topojson
TOPOJSON_GLO=topojson
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
	mv levels.topo.json  -t ../output/$(NAME)/
	mv shades.topo.json -t ../output/$(NAME)/

topojson: merge
	$(TOPOJSON_LOC) --id-property none -q $(QUANTIZATION) --simplify-proportion=0.5 -p name=elev  -o levels.topo.json -- levels*.tmp.shp
	$(TOPOJSON_LOC) --id-property none -q $(QUANTIZATION) -s `expr $(AREA_SIZE) / 1000000` -o shades.topo.json -- shade_50=shade_1.tmp.shp shade_100=shade_2.tmp.shp shade_150=shade_3.tmp.shp shade_200=shade_4.tmp.shp
	# --simplify-proportion=0.05 

#geojsonize: 
#	ogr2ogr -f GeoJSON -where "elev < 10000" levels.tmp.geo.json levels.tmp.shp
#	ogr2ogr -f GeoJSON shades.tmp.geo.json shades.tmp.shp

merge: polygonize_slices zvals
#	ogr2ogr levels.tmp.shp 					level0001.tmp.shp
	Slices=( $$(cat ./slices.tmp.txt) ); \
	for i in "$${Slices[@]}"; do \
		ogr2ogr -update -append levels.tmp.shp level$${i}.tmp.shp; \
	done

polygonize_slices: raster_slice zvals
	Slices=( $$(cat ./slices.tmp.txt) ); \
	for i in "$${Slices[@]}"; do \
		gdal_polygonize.py level$${i}.tmp.tif -f "ESRI Shapefile" level$${i}.tmp.shp level_$${i} elev ;\
	done;
	for i in 1 2 3 4; do \
		gdal_polygonize.py shade_$${i}.tmp.tif -f "ESRI Shapefile" shade_$$i.tmp.shp shade_$${i} shade ;\
	done

raster_slice: crop zvals
	Slices=( $$(cat ./slices.tmp.txt) ); \
	for i in "$${Slices[@]}"; do \
		gdal_calc.py -A crop_xl.tmp.tif --outfile=level$$i.tmp.tif --calc="$$i*(A>$$i)+1" --NoDataValue=0;\
	done

	gdal_calc.py -A ./shadedrelief.tmp.tif --outfile=shade_1.tmp.tif --calc="50*(A<50)"   --NoDataValue=0
	gdal_calc.py -A ./shadedrelief.tmp.tif --outfile=shade_2.tmp.tif --calc="100*(A<100)" --NoDataValue=0
	gdal_calc.py -A ./shadedrelief.tmp.tif --outfile=shade_3.tmp.tif --calc="150*(A<150)" --NoDataValue=0
	gdal_calc.py -A ./shadedrelief.tmp.tif --outfile=shade_4.tmp.tif --calc="200*(A<200)" --NoDataValue=0

#---- LOWEST-TOPEST
zvals: resize
	zMin=$$(gdalinfo crop_xl.tmp.tif 2>&1 | sed -ne 's/.*z#actual_range=//p'| tr -d ' ' | cut -d "," -f 1 );\
	zMax=$$(gdalinfo crop_xl.tmp.tif 2>&1 | sed -ne 's/.*z#actual_range=//p'| tr -d ' ' | cut -d "," -f 2);\
	echo Altidutes range: $$zMin $$zMax ;\
	python ../script/slice.py $$zMin $$zMax $(SLICES) > ./slices.tmp.txt

#---- Crop, Resize
resize: shading crop
	gdalwarp -of GTiff  -te $(WEST) $(SOUTH) $(EAST) $(NORTH) -ts $(WIDTH) 0 crop_xl.tmp.tif crop_xs.tmp.tif
	gdalwarp -of GTiff  -te $(WEST) $(SOUTH) $(EAST) $(NORTH) -ts $(WIDTH) 0 shadedrelief_xl.tmp.tif shadedrelief.tmp.tif

shading: crop reproj
	# must shade before resize. See http://gis.stackexchange.com/a/137290/19460
	gdaldem hillshade crop_xl.tmp.tif shadedrelief_xl.tmp.tif -s $(S) -z $(Z) -az $(AZ) -alt 60 -compute_edges
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
	rm -f *.txt
	rm -f *.xml
#	rm -f *.makefile
