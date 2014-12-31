
# UNZIP DATA
unzip: NE ETOPO1
	unzip -n ./data/noaa/ETOPO1_Ice_g_geotiff.zip '*.tif'         
	unzip -n ./data/natural_earth_vector.zip
    

# ---------- TOPOGRAPHIC 1km from NOAA -----------------------------------#
ETOPO1: clean
	mkdir -p ./data/noaa
	curl \
		-L -C - 'http://www.ngdc.noaa.gov/mgg/global/relief/ETOPO1/data/ice_surface/grid_registered/georeferenced_tiff/ETOPO1_Ice_g_geotiff.zip' \
		-o ./data/noaa/ETOPO1_Ice_g_geotiff.zip
	### Downloaded 100%: ETOPO1, topography 1km raster. ###

# ---------- ADMINISTRATIVE from NATURAL EARTH ---------------------------#
NE:
	curl \
		-L -C - 'http://naciscdn.org/naturalearth/packages/natural_earth_vector.zip' \
		-o ./data/natural_earth_vector.zip
        ### Downloaded 100%: Natural Earth Vectors ###
clean: 
#	rm -f ./data/NE/*.zip
#	rm -f ./data/NE/*.dbf
#	rm -f ./data/NE/*.prj 
#	rm -f ./data/NE/*.shp
#	rm -f ./data/NE/*.shx
#	rm -f ./data/ETOPO1/*.zip
#	rm -f ./data/ETOPO1/*.tif
#	rm -f ./data/ETOPO1/*.tiff
