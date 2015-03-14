#---- RUN
# make -f shadedrelief.makefile ITEM=IN WEST=67.0 NORTH=37.5  EAST=99.0 SOUTH=05.0
SHELL=/bin/bash
#---- DEFAULT VALUES (customizable):
WIDTH=1980
# 1: equirectangular, 2,3: mercator
#PROJECTION=EPSG:4326
PROJECTION=EPSG:3857
FUZZ=7
AZ=315
Z=5
SHADOW=50
S=111120  
#S=370400 
#---- MAKEFILE
#---- End here
done: shade_trans composite regeo clean reproj2
	mkdir -p ../output/$(ITEM)
	cp ./*.{jpg,png,gis.*} ../output/$(ITEM)/

regeo: composite 
	# More in: [[commons:User:ShareMap/Hillshade_with_ImageMagick]]
	gdal_translate -a_ullr $(WEST) $(NORTH) $(EAST) $(SOUTH) -co COMPRESS=JPEG -co PHOTOMETRIC=YCBCR ./color_hillshades.jpg ./color_hillshades.gis.tif
	gdal_translate -a_ullr $(WEST) $(NORTH) $(EAST) $(SOUTH) -co COMPRESS=JPEG -co PHOTOMETRIC=RGB 	 ./white_hillshades.jpg ./white_hillshades.gis.tif
	gdal_translate -a_ullr $(WEST) $(NORTH) $(EAST) $(SOUTH) -co COMPRESS=JPEG -co PHOTOMETRIC=YCBCR ./color.jpg ./color.gis.tif
	gdal_translate -a_ullr $(WEST) $(NORTH) $(EAST) $(SOUTH) -co COMPRESS=LZW -co ALPHA=YES ./trans.png ./trans.gis.tif

#----PROCESSING RASTER DATA
composite: colors_layer shade_trans background_white
	convert color.jpg 	 trans.png -compose Multiply -composite color_hillshades.jpg 		#note: perfect +++
	convert white_bg.jpg trans.png -compose Multiply -composite white_hillshades.jpg 		#note: perfect +++

#--- White, trans, color, white_rect
background_white: shade_white
	convert whited.jpg -fuzz 100% -fill "#ffffffff" -opaque white  white_bg.jpg

colors_layer: reproj
	gdaldem color-relief reproj.tmp.tif color_relief-wikimaps.txt color.tiff #GIS file
	convert color.tiff color.jpg  #tiff:5.0MB, png:1.6MB, jpg:239KB 

shade_trans: shade_white
	convert whited.jpg -alpha copy -channel alpha -negate +channel trans.png 				# nice & light, +++ kept
	convert grey2trans.tmp.png -alpha copy -channel alpha -negate +channel shadedrelief.trans.png     # ++  deleted line

shade_white: shade_grey reproj2
	convert shadedrelief.tmp.tif -fuzz $(FUZZ)% -fill "#FFFFFF" -opaque "#DDDDDD"  whited.jpg 	# lighter (0.9M) kept
# 
	convert shadedrelief.tmp.tif -fuzz $(FUZZ)% -transparent "#DDDDDD" grey2trans.tmp.png		# heavier (2.6M) deleted line

reproj2: shade_grey
	gdalwarp -of GTiff -s_srs EPSG:4326 -t_srs $(PROJECTION) shadedrelief-cropXL.tmp.tif shadedrelief.tmp.tif
	gdalwarp  -ts $(WIDTH) 0  shadedrelief.tmp.tif shadedrelief2.tmp.tif

shade_grey: reproj
	gdaldem hillshade reproj.tmp.tif  shadedrelief-reproj.tmp.tif  -s 1    -z $(Z) -az $(AZ) -alt 60 -compute_edges  # 
	gdaldem hillshade resized.tmp.tif shadedrelief-resized.tmp.tif -s $(S) -z $(Z) -az $(AZ) -alt 60 -compute_edges  # 
	gdaldem hillshade cropXL.tmp.tif  shadedrelief-cropXL.tmp.tif  -s $(S) -z $(Z) -az $(AZ) -alt 60 -compute_edges  # 

#---- Crop, Resize
reproj: resize
	gdalwarp -of GTiff -s_srs EPSG:4326 -t_srs $(PROJECTION) -r cubic resized.tmp.tif reproj.tmp.tif

resize: crop
#	convert shadedrelief.tmp.tif 	-resize $(WIDTH) shadedrelief.sized.tmp.tif
	gdalwarp  -s_srs EPSG:4326 -t_srs EPSG:4326 -te $(WEST) $(SOUTH) $(EAST) $(NORTH) \
		-ts $(WIDTH) 0  cropXL.tmp.tif resized.tmp.tif
#	gdalwarp -of GTiff -s_srs EPSG:4326 -t_srs EPSG:3857 -te $(WEST) $(SOUTH) $(EAST) $(NORTH) \
#		-ts $(WIDTH) 0 cropXL.tmp.tif resized.tmp.tif  # mercator, need to remove -s 111120

crop: clean
	gdal_translate -projwin $(WEST) $(NORTH) $(EAST) $(SOUTH) ../data/noaa/ETOPO1_Ice_g_geotiff.tif cropXL.tmp.tif

#---- DOWNLOADS
.PHONY: clean

clean:  
	rm -f *.tiff
	rm -f *.tif
	rm -f *.jpg
	rm -f *.png
	rm -f *.xml
#	rm -f *.tiff
#	rm -f *.dbf
#	rm -f *.prj 
#	rm -f *.shp
#	rm -f *.shx
#	rm -f *.html
#	rm -f *.txt
#	rm -f *.json
