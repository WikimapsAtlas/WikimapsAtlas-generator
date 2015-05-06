#---- RUN
# make -f hillshades.makefile NAME=IN WEST=67.0 NORTH=37.5  EAST=99.0 SOUTH=05.0
SHELL=/bin/bash
#---- DEFAULT VALUES (customizable):
WIDTH=1280
PROJECTION=EPSG:3395
FUZZ=7
AZ=315
Z=5
S=111120  
#S=370400 
#---- MAKEFILE
#---- End here
done: shade_trans composite regeo reproj_final clean
	mkdir -p ../output/$(NAME)
	mv ./*.{tif,jpg,png,gis.*} ../output/$(NAME)/
	# rm *.tmp.*

regeo: composite
	# More in: [[commons:User:ShareMap/Hillshade_with_ImageMagick]]

#---- COMPOSITES (Not needed!)
composite: background_colors shade_trans background_white
#	convert ./color_jpg.gis.tif 	 trans.png -compose Multiply -composite color_hillshades.jpg 	#note: perfect +++
#	convert white_bg.jpg trans.png -compose Multiply -composite white_hillshades.jpg 		#note: perfect +++

reproj_final:
#	gdalwarp -of GTiff -s_srs EPSG:4326 -t_srs EPSG:3857 -te $(WEST) $(SOUTH) $(EAST) $(NORTH) \
#		-ts $(WIDTH) 0 crop_xl.tmp.tif crop_xs.tmp.tif  # mercator, need to remove -s 111120

#--- Layer: transparent hillshade
shade_trans: resize 
	gdal_calc.py -A ./hillshade.tmp.tif --outfile=./color.tmp.tif   --calc="255*(A>220) + A*(A<=220)" 		# filter out whites above X , set grey to 255.
	gdal_calc.py -A ./hillshade.tmp.tif --outfile=./opacity.tmp.tif --calc="1*(A>220) + (256-A)*(A<=220)" 	# filter out whites above X , set opacity to 1. Else, invert opacity.
	gdalbuildvrt -separate ./trans_.gis.vrt ./color.tmp.tif ./opacity.tif
	gdalwarp -s_srs EPSG:4326 -t_srs $(PROJECTION) ./trans_.gis.vrt ./trans.tmp.gis.tif   # reproj
	gdal_translate -co COMPRESS=LZW -co ALPHA=YES ./trans.gis.vrt ./trans.gis.tif  

#--- Background : Color
background_colors: resize
	gdaldem color-relief crop_xs.tmp.tif color_relief-wikimaps.txt color.tmp.tif #GIS file
	gdalwarp -s_srs EPSG:4326 -t_srs $(PROJECTION) ./color.tmp.tif ./color.tmp.gis.tif         # reproj
	gdal_translate -co COMPRESS=JPEG -co PHOTOMETRIC=YCBCR ./color.tmp.gis.tif ./color.gis.tif # compress

#---- Crop, Resize
resize: shading crop
	gdalwarp -of GTiff -ts $(WIDTH) 0 crop_xl.tmp.tif crop_xs.tmp.tif
	gdalwarp -of GTiff -ts $(WIDTH) 0 hillshades_xl.tmp.tif hillshades.tmp.tif

shading: crop reproj
	# must shade before resize. See http://gis.stackexchange.com/a/137290/19460
	gdaldem hillshade crop_xl.tmp.tif hillshades_xl.tmp.tif -s $(S) -z $(Z) -az $(AZ) -alt 60 -compute_edges
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
