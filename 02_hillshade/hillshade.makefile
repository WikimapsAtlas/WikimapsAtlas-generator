#---- RUN
# make -f hillshades.makefile NAME=India ISO2=IN WEST=67.0 NORTH=37.5  EAST=99.0 SOUTH=05.0
# See also: [[commons:User:ShareMap/Hillshade_with_ImageMagick]]
SHELL=/bin/bash
#---- DEFAULT VALUES (customizable):
WIDTH=1280
PROJECTION=EPSG:3395
#---- Vectorization
TOPOJSON_LOC=../node_modules/topojson/bin/topojson
QUANTIZATION=1e4
#---- Hillshade
FUZZ=7
AZ=315
Z=5
S=111120
#S=370400

#---- MAKEFILE
#---- End here
done: shade_trans shade_topojson slope
	mkdir -p ../output/$(NAME)
	mv ./*.{gis.tif,*.json} -t ../output/$(NAME)/
	rm -f *.tmp.*

#---- NON-GIS COMPOSITES (Not needed!)
composite: background_colors shade_trans
#	convert ./color_jpg.gis.tif trans.png -compose Multiply -composite color_hillshades.jpg	#note: perfect +++
#	convert white_bg.jpg trans.png -compose Multiply -composite white_hillshades.jpg		#note: perfect +++

#------------------------------------------------------------------ #
shade_topojson: shade_slices_vector
	$(TOPOJSON_LOC) --id-property none \
		-q $(QUANTIZATION) \
		--simplify-proportion=0.25 \
		-o hillshades.topo.json \
		-- shade_70=./shade/1.tmp.shp shade_140=./shade/2.tmp.shp shade_200=./shade/3.tmp.shp
shade_slices_vector: shade_slices_raster
	for i in 1 2 3; do \
		gdal_polygonize.py ./shade/$${i}.tmp.tif -f "ESRI Shapefile" ./shade/$${i}.tmp.shp shade_$${i} shade ;\
	done
shade_slices_raster: resize
	mkdir -p ./shade/
	gdal_calc.py -A ./hillshades.gis.tif --outfile=./shade/1.tmp.tif --calc="70*(A<70)"   --NoDataValue=0
	gdal_calc.py -A ./hillshades.gis.tif --outfile=./shade/2.tmp.tif --calc="140*(A<140)" --NoDataValue=0
	gdal_calc.py -A ./hillshades.gis.tif --outfile=./shade/3.tmp.tif --calc="200*(A<200)" --NoDataValue=0

# Layer: transparent hillshade ------------------------------------ #
shade_trans: resize
	gdal_calc.py -A ./hillshades.gis.tif --outfile=./greys.tmp.tif   --calc="255*(A>200) + 1*(A<=200)" 		# filter out whites above X , set grey to 255.
	gdal_calc.py -A ./hillshades.gis.tif --outfile=./opacity.tmp.tif --calc="1*(A>200)   + (256-A)*(A<=200)" 	# filter out whites above X , set opacity to 1/255. Else, invert opacity.
	gdalbuildvrt -separate ./trans.tmp.vrt ./greys.tmp.tif ./opacity.tmp.tif
	gdalwarp -of GTiff ./trans.tmp.vrt ./trans.gis.tmp.vrt   # reproj
#	gdal_translate 					-co ALPHA=YES ./trans.gis.tmp.vrt ./trans_nocompress.gis.tif
	gdal_translate -co COMPRESS=LZW -co ALPHA=YES ./trans.gis.tmp.vrt ./trans.gis.tif

slope: crop
	gdalwarp -of GTiff -ts $(WIDTH) 0 crop_xl.tmp.tif crop_xs.tmp.tif
	gdaldem slope crop_xs.tmp.tif slope.tmp.tif
	gdaldem color-relief -co compress=lzw slope.tmp.tif slope.txt slope.gis.tif

#---- Crop, Resize
resize: shading crop
	gdalwarp -of GTiff -s_srs EPSG:4326 -t_srs $(PROJECTION) hillshades_xl.tmp.tif hillshades_reproj.tmp.tif
	gdalwarp -of GTiff -ts $(WIDTH) 0 hillshades_reproj.tmp.tif hillshades.gis.tif

shading: crop reproj
# must shade before resize. See http://gis.stackexchange.com/a/137290/19460
	# composite hillshades: 
	gdaldem hillshade crop_xl.tmp.tif hillshades_A.tmp.tif -s $(S) -z $(Z) -az `expr $(AZ) +  1` -alt 60 -compute_edges
	gdaldem hillshade crop_xl.tmp.tif hillshades_B.tmp.tif -s $(S) -z $(Z) -az `expr $(AZ) + 40` -alt 60 -compute_edges
	gdaldem hillshade crop_xl.tmp.tif hillshades_C.tmp.tif -s $(S) -z $(Z) -az `expr $(AZ) - 40` -alt 60 -compute_edges
	gdal_calc.py -A hillshades_A.tmp.tif -B hillshades_B.tmp.tif -C hillshades_C.tmp.tif \
		--outfile=./hillshades_xl.tmp.tif --calc="(A*(A<=B)*(A<=C)+ B*(B<A)*(B<=C)+ C*(C<A)*(C<B))"
	gdal_calc.py -A hillshades_A.tmp.tif -B hillshades_B.tmp.tif -C hillshades_C.tmp.tif \
		--outfile=./hillshades_xl_multiply.tmp.tif --type=Float32 --calc="(A*B*C)^(1/3)"

reproj: crop                 
#	reproj can go here
#	gdalwarp -of GTiff -s_srs EPSG:4326 -t_srs $(PROJECTION) -r cubic crop_xl.tmp.tif reproj.tmp.tif # -s_srs EPSG:4326

crop: clean
	# depending on AREA_SIZE, then crop from etopo or srtm :
	bash ../script/get_raster_source.bash $(WEST) $(NORTH) $(EAST) $(SOUTH)

.PHONY: clean

clean:  
	rm -f *.tiff
	rm -f *.tif
	rm -f *.jpg
	rm -f *.png
	rm -f *.xml
	rm -f *.vrt
#	rm -f *.tiff
#	rm -f *.dbf
#	rm -f *.prj
#	rm -f *.shp
#	rm -f *.shx
#	rm -f *.html
#	rm -f *.txt
#	rm -f *.json
