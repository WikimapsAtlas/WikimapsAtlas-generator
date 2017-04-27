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
export SLICE=6
# script data
export VERSION=0.8

#---- MAKE SCRIPT

end: topography hillshade administrative water d3
topography:
	#works
	$(MAKE) -C 01_topography	-f topography.makefile
hillshade:
	#works
	$(MAKE) -C 02_hillshade 	-f hillshade.makefile
administrative:
	#works
	$(MAKE) -C 03_administrative 	-f administrative.makefile
water:
	#works
	$(MAKE) -C 04_water 		-f water.makefile
grouping:
	# to do (?)
#	$(MAKE) -C 07_move 		-f merge.makefile
d3: server
	#works
	$(MAKE) -C 09_d3 		-f d3.makefile
server:
	node ./node_modules/.bin/forever ./node_modules/.bin/http-server --cors &
