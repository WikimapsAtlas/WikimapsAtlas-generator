#---- RUN
# make -f master.makefile d3 NAME=India ISO2=IN WEST=67.0 NORTH=37.5  EAST=99.0 SOUTH=05.0
#---- DEFAULT VALUES (customizable):
WIDTH=1280

#---- MAKEFILE
done: location topographic
	mkdir -p ../output/$(NAME)
	mv ./*{.svg,.tpl} ../output/$(NAME)/
	
topographic: b64
	WIDTH=$(WIDTH) node topographic.node.js		# see inside this file for parameters' calls

location: b64
	WIDTH=$(WIDTH) node location.node.js		# see inside this file for parameters' calls

b64: clean server
	convert ../output/$(NAME)/trans.gis.tif ../output/$(NAME)/trans.png 
	convert ../output/$(NAME)/color.gis.tif ../output/$(NAME)/color.jpg
	for file in ../output/$(NAME)/*.jpg ../output/$(NAME)/*.png  ; \
	do echo $$file ; openssl base64 -in $$file -out ../output/$(NAME)/`basename $$file`.b64; \
	done;

server:
#	node ../node_modules/.bin/http-server &
clean:
	rm -f *.svg
#	rm -f *.json
#	rm -f *.dbf
#	rm -f *.prj 
#	rm -f *.shp
#	rm -f *.shx
#	rm -f *.tif
#	rm -f *.html
#	rm -f *.txt
#	rm -f *.makefile
