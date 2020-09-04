#---- RUN
# make -f master.makefile NAME=India ISO2=IN WEST=67.0 NORTH=37.5  EAST=99.0 SOUTH=05.0 PLACES=15 SLICE=6

#---- DEFAULT VALUES (customizable):
# Geo data
export NAME=India
export ISO2=IN
#export escaped_A = $(subst $e ,_,$(NAME))
export WEST=67.0
export NORTH=37.5
export EAST=99.0
export SOUTH=05.0
export WIDTH=1280
export AREA_SIZE=etopo
# Pseudo-Mercator|GoogleMaps|OSM=EPSG:3857 (m)
# World Mercator=EPSG:3395  (m)
# WGS84-WGS84=EPSG:4326 (⁰)  -------- GIS raw default
export PROJECTION=EPSG:3857
export PLACES=15
export SLICE=8
# script data
export VERSION=0.8

#---- MAKE SCRIPT

end: topography hillshade administrative water d3
topography:
	$(MAKE) -C 01_topography		-f topography.makefile			#works
hillshade:
	$(MAKE) -C 02_hillshade 		-f hillshade.makefile			#works
administrative:
	$(MAKE) -C 03_administrative 	-f administrative.makefile		#works
water:
	$(MAKE) -C 04_water 			-f water.makefile 				#works
grouping:
	#$(MAKE) -C 07_move 			-f merge.makefile 				# what is this for ?
d3: server
	$(MAKE) -C 09_d3 				-f d3.makefile					#works
server:
	# IMPORTANT: the d3 modules REQUIRES an http server on http://127.0.0.1:8080 OR to edit js/wikiatlas.js to active server and port
	# The code below is now in 09_d3/d3.makefile
	# node ./node_modules/.bin/forever ./node_modules/.bin/http-server --cors &
	# node ../node_modules/.bin/forever stopall
