#---- RUN
# make -f shadedrelief.makefile NAME=IN WEST=67.0 NORTH=37.5  EAST=99.0 SOUTH=05.0
SHELL=/bin/bash
#---- DEFAULT VALUES (customizable):
WIDTH=1980
PROJECTION=EPSG:3395
FUZZ=7
AZ=315
Z=5
SHADOW=50
S=111120  
#S=370400 
#---- MAKEFILE
#---- End here
done: shade_trans composite regeo reproj_final clean
	mkdir -p ../output/$(NAME)
	mv ./*.{tif,jpg,png,gis.*} ../output/$(NAME)/
	# rm *.tmp.*

#reproj: shade_grey


regeo: composite
	# More in: [[commons:User:ShareMap/Hillshade_with_ImageMagick]]
#	gdal_translate -a_ullr $(WEST) $(NORTH) $(EAST) $(SOUTH) -co COMPRESS=JPEG -co PHOTOMETRIC=YCBCR ./color_hillshades.jpg ./color_hillshades.gis.tif
#	gdal_translate -a_ullr $(WEST) $(NORTH) $(EAST) $(SOUTH) -co COMPRESS=JPEG -co PHOTOMETRIC=RGB 	 ./white_hillshades.jpg ./white_hillshades.gis.tif
#dup	gdal_translate -a_ullr $(WEST) $(NORTH) $(EAST) $(SOUTH) -co COMPRESS=JPEG -co PHOTOMETRIC=YCBCR ./color.jpg ./color.gis.tif
# 	gdal_translate -a_ullr $(WEST) $(NORTH) $(EAST) $(SOUTH) -co COMPRESS=LZW  -co ALPHA=YES ./trans.png ./trans.gis.tif   

#---- COMPOSITES (Not needed!)
composite: background_colors shade_trans background_white
#	convert ./color_jpg.gis.tif 	 trans.png -compose Multiply -composite color_hillshades.jpg 	#note: perfect +++
#	convert white_bg.jpg trans.png -compose Multiply -composite white_hillshades.jpg 		#note: perfect +++

reproj_final:	

#--- Layer: transparent hillshade
shade_trans: resize 
	convert shadedrelief.tmp.tif -fuzz $(FUZZ)% -fill "#FFFFFF" -opaque "#DDDDDD"  whited.jpg 	# lighter (0.9M) kept 
	convert whited.jpg -alpha copy -channel alpha -negate +channel trans.png 					# 1: +++ & light, +++ kept
#		convert shadedrelief.tmp.tif -fuzz $(FUZZ)% -transparent "#DDDDDD" trans_to_black.tmp.png 	# 2: + (shadow AND light) uglier & heavier (2.6M) -- to deleted line
	gdal_translate -a_ullr $(WEST) $(NORTH) $(EAST) $(SOUTH) trans.png trans.tmp.gis.tif            # regeoloc
	gdalwarp -s_srs EPSG:4326 -t_srs $(PROJECTION) ./trans.tmp.gis.tif ./trans_reproj.tmp.gis.tif   # reproj
	gdal_translate -co COMPRESS=LZW -co ALPHA=YES ./trans_reproj.tmp.gis.tif ./trans.gis.tif        # compress

#--- Background : Color & White
background_colors: resize
	gdaldem color-relief crop_xs.tmp.tif color_relief-wikimaps.txt color.tmp.tif #GIS file
	gdalwarp -s_srs EPSG:4326 -t_srs $(PROJECTION) ./color.tmp.tif ./color.tmp.gis.tif         # reproj
	gdal_translate -co COMPRESS=JPEG -co PHOTOMETRIC=YCBCR ./color.tmp.gis.tif ./color.gis.tif # compress

background_white: resize
	convert crop_xs.tmp.tif -fuzz 100% -fill "#ffffffff" -opaque white  white.jpg
#	gdal_translate -a_ullr $(WEST) $(NORTH) $(EAST) $(SOUTH) -co COMPRESS=JPEG -co PHOTOMETRIC=RGB white.jpg white.gis.tif

#---- Crop, Resize
resize: shading crop
	gdalwarp -of GTiff  -te $(WEST) $(SOUTH) $(EAST) $(NORTH) -ts $(WIDTH) 0 crop_xl.tmp.tif crop_xs.tmp.tif
	gdalwarp -of GTiff  -te $(WEST) $(SOUTH) $(EAST) $(NORTH) -ts $(WIDTH) 0 shadedrelief_xl.tmp.tif shadedrelief.tmp.tif
#	gdalwarp -of GTiff -s_srs EPSG:4326 -t_srs EPSG:3857 -te $(WEST) $(SOUTH) $(EAST) $(NORTH) \
#		-ts $(WIDTH) 0 crop_xl.tmp.tif crop_xs.tmp.tif  # mercator, need to remove -s 111120

shading: crop reproj
	# must shade before resize. See http://gis.stackexchange.com/a/137290/19460
	gdaldem hillshade crop_xl.tmp.tif shadedrelief_xl.tmp.tif -s $(S) -z $(Z) -az $(AZ) -alt 60 -compute_edges
reproj: crop                 
#	reproj can go here
#	gdalwarp -of GTiff -s_srs EPSG:4326 -t_srs $(PROJECTION) -r cubic crop_xl.tmp.tif reproj.tmp.tif # -s_srs EPSG:4326
crop: clean
	# depending on $(AREA_SIZE), then crop from etopo or srtm
	bash ../script/raster_source.bash $(WEST) $(NORTH) $(EAST) $(SOUTH)

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
