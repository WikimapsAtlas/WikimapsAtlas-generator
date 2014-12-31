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
S=111120
#S=370400   // frequent alternative
PROJECTION=epsg:4326
#PROJECTION=epsg:3857 // mercator
#---- MAKEFILE
#---- End here
done: transparencies_layer hillshades_composite regeocoordinates clean
	mkdir -p ../files/$(escaped_ITEM)
	cp ./color_hillshades.jpg ../files/$(escaped_ITEM)/ # NEEED MORE !!!!!!!!

regeocoordinates: hillshades_composite 
	# More in: [[commons:User:ShareMap/Hillshade_with_ImageMagick]]
	gdal_translate -a_ullr $(WEST) $(NORTH) $(EAST) $(SOUTH) -co COMPRESS=JPEG -co PHOTOMETRIC=YCBCR ./color_hillshades.jpg ./color_hillshades.gis.tif

#----PROCESSING RASTER DATA
hillshades_composite: colors_layer transparencies_layer white_rectangle
	convert color.jpg 	 trans.png -compose Multiply -composite color_hillshades.jpg 		#note: perfect +++
	convert white_bg.jpg trans.png -compose Multiply -composite white_hillshades.jpg 		#note: perfect +++

#--- White, trans, color, white_rect
white_rectangle: resize
	convert whited.jpg -fuzz 100% -fill "#ffffffff" -opaque white  white_bg.jpg

colors_layer: resize
	gdaldem color-relief resized.tmp.tif color_relief-wikimaps.txt color.tiff #GIS file
	convert color.tiff color.jpg  #tiff:5.0MB, png:1.6MB, jpg:239KB 

transparencies_layer: grey_whitening
	convert whited.jpg -alpha copy -channel alpha -negate +channel trans.png 				# nice & light

grey_whitening: shade
	convert shadedrelief.tmp.tif -fuzz $(FUZZ)% -fill "#FFFFFF" -opaque "#DDDDDD"  whited.jpg 	# lighter (0.9M)

#--- Shaded relief (grey)
shade: resize
	gdaldem hillshade resized.tmp.tif shadedrelief.tmp.tif -s $(S) -z $(Z) -az $(AZ) -alt 60 -compute_edges  # 

#---- Crop, Resize
resize: crop
#	convert shadedrelief.tmp.tif 	-resize $(WIDTH) shadedrelief.sized.tmp.tif
	gdalwarp -of GTiff -s_srs epsg:4326 -t_srs $(PROJECTION) -te $(WEST) $(SOUTH) $(EAST) $(NORTH) \
		-ts $(WIDTH) 0 cropXL.tmp.tif resized.tmp.tif
#	gdalwarp -of GTiff -s_srs epsg:4326 -t_srs epsg:3857 -te $(WEST) $(SOUTH) $(EAST) $(NORTH) \
#		-ts $(WIDTH) 0 cropXL.tmp.tif resized.tmp.tif  #mercator, need to remove -s 111120


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
