#---- RUN
# make -f shadedrelief.makefile ITEM=India WEST=67.0 NORTH=37.5  EAST=99.0 SOUTH=05.0

#---- DEFAULT VALUES (customizable):
WIDTH=1980
RATIO=($(NORTH)-$(SOUTH)) / ($(EAST)-$(WEST))
HEIGHT=$(WIDTH)*$(RATIO)  
FUZZ=7
AZ=315
Z=5
SHADOW=50

#---- MAKEFILE
#---- End here
done: progressive_transparency shadow_relief regeocoordinates clean
	mkdir -p ../files/$(escaped_ITEM)
	mv ./color_relief-hillshade-wp-multiply.jpg ../files/$(escaped_ITEM)/ # NEEED MORE !!!!!!!!

regeocoordinates: shadow_relief 
	# [[commons:User:ShareMap/Hillshade_with_ImageMagick]]
	gdal_translate -a_ullr $(WEST) $(NORTH) $(EAST) $(SOUTH) ./color_relief-hillshade-wp-multiply.jpg ./color_relief-hillshade-wp-multiply.gis.tif

#----PROCESSING RASTER DATA
shadow_relief: color_layer white_layer progressive_transparency
	composite -dissolve $(SHADOW) 	shadedrelief.trans.png color_relief-wp.jpg -alpha Set 		color_relief-hillshade-wp-0$(SHADOW).jpg 	#note: perfect +
	composite -dissolve 100 		shadedrelief.trans.png color_relief-wp.jpg -alpha Set 		color_relief-hillshade-wp-100.jpg 			#note: perfect ++
	convert color_relief-wp.jpg 	shadedrelief.trans.png -compose Multiply -composite 		color_relief-hillshade-wp-multiply.jpg 		#note: perfect +++
	#White+shadow:
	composite -dissolve 100 		shadedrelief.trans.png white.jpg -alpha Set 				white_relief-hillshade-wp-100.jpg #note: perfect
	convert white.jpg 				shadedrelief.trans.png -compose Multiply -composite 		white_relief-hillshade-wp-multiply.jpg 		#note: perfect +++

color_layer: resize
	# $man gdaldem : color-relief
	# Color tiff depending on color_relief.txt file. Format: elevation R G B. 
	# Elevation as floating point value, `nv` keyword, or percentage.
	# 0% being the minimum value found in the raster, 100% the maximum value.
	gdaldem color-relief resized_mercator.tmp.tif color_relief-wikimaps.txt color_relief-wp.tiff #GIS file
	#resizing
	convert color_relief-wp.tiff -resize $(WIDTH) color_relief-wp.jpg  #tiff:5.0MB, png:1.6MB, jpg:239KB 

white_layer: resize
	convert shadedrelief.tmp.tif            -fill "#ffffffff" white.jpg
#	convert shadedrelief.tmp.tif -fuzz 100% -fill "#ffffffff" -opaque white  white.jpg

#--- Trans shades
progressive_transparency: grey_wiping
	convert shadedrelief.grey_no.tmp.png       -alpha copy -channel alpha -negate +channel shadedrelief.trans.png
	convert shadedrelief.grey_to_white.tmp.png -alpha copy -channel alpha -negate +channel shadedrelief.trans2.png
grey_wiping: shade
	convert shadedrelief.tmp.tif -fuzz $(FUZZ)% -transparent "#DDDDDD" shadedrelief.grey_no.tmp.png
	convert shadedrelief.tmp.tif -fuzz $(FUZZ)% -fill "#FFFFFF" -opaque "#DDDDDD"  shadedrelief.grey_to_white.tmp.png


shade: resize
	gdaldem hillshade resized_mercator.tmp.tif shadedrelief.tmp.tif -z $(Z) -s 111120 -az $(AZ) -alt 60 -compute_edges

#---- Crop, Resize
resize: crop
#	convert shadedrelief.tmp.tif 	-resize $(WIDTH) shadedrelief.sized.tmp.tif
	gdalwarp -of GTiff -s_srs epsg:4326 -t_srs epsg:4326 -te $(WEST) $(SOUTH) $(EAST) $(NORTH) \
		-ts $(WIDTH) 0 cropXL.tmp.tif resized_equirect.tmp.tif
	gdalwarp -of GTiff -s_srs EPSG:4326 -t_srs EPSG:3857 resized_equirect.tmp.tif resized_mercator.tmp.tif

crop: unzip
	gdal_translate -projwin $(WEST) $(NORTH) $(EAST) $(SOUTH) ETOPO1_Ice_g_geotiff.tif cropXL.tmp.tif

#---- DOWNLOADS
unzip: clean
	unzip -n ../../data/download/ETOPO1_Ice_g_geotiff.zip '*.tif' 
	touch ETOPO1_Ice_g_geotiff.tif

.PHONY: clean

clean:  
	rm -f *.tiff
	rm -f *.tmp.tif
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
