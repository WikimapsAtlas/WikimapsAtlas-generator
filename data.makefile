# VARIABLES
#DATA_DIR=./data
# For wikiatlas-server :
DATA_DIR=../../data/download 

# UNZIP DATA
unzip: data
	unzip -n $(DATA_DIR)/ETOPO1_Ice_g_geotiff.zip '*.tif' 
	touch ETOPO1_Ice_g_geotiff.tif
    
    
# DOWNLOAD DATA
data: NE ETOPO1

# ---------- TOPOGRAPHIC 1km from NOAA -----------------------------------#
ETOPO1: clean
	mkdir -p $(DATA_DIR)/noaa
	curl \
		-L -C - 'http://www.ngdc.noaa.gov/mgg/global/relief/ETOPO1/data/ice_surface/grid_registered/georeferenced_tiff/ETOPO1_Ice_g_geotiff.zip' \
		-o $(DATA_DIR)/noaa/ETOPO1_Ice_g_geotiff.zip
	### Downloaded 100%: ETOPO1, topography 1km raster. ###

# ---------- ADMINISTRATIVE from NATURAL EARTH ---------------------------#
NE: clean NE_0 NE_countries NE_subunits NE_places NE_disputed NE_rivers NE_lakes
	### Downloaded 100%: NaturalEarthData.com's, admin shapefiles. ###
NE_0:
	mkdir -p ./data/NE/ 
NE_countries:
	curl \
		-L -C - 'http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_0_countries.zip' \
		-o ./data/NE/countries.zip
NE_subunits:
	curl \
		-L -C - 'http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_1_states_provinces.zip' \
		-o ./data/NE/subunits.zip 
NE_places:
	curl \
		-L -C - 'http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_populated_places.zip' \
		-o ./data/NE/places.zip
NE_disputed:
	curl \
		-L -C - 'http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_0_disputed_areas.zip' \
		-o ./data/NE/disputed.zip
NE_rivers:
	curl \
		-L -C - 'http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/physical/ne_10m_rivers_lake_centerlines.zip' \
		-o ./data/NE/rivers.zip
NE_lakes:
	curl \
		-L -C - 'http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/physical/ne_10m_lakes.zip' \
		-o ./data/NE/lakes.zip
clean: 
#	rm -f ./data/NE/*.zip
#	rm -f ./data/NE/*.dbf
#	rm -f ./data/NE/*.prj 
#	rm -f ./data/NE/*.shp
#	rm -f ./data/NE/*.shx
#	rm -f ./data/ETOPO1/*.zip
#	rm -f ./data/ETOPO1/*.tif
#	rm -f ./data/ETOPO1/*.tiff
