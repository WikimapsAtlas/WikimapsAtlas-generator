#---- RUN
# make -f master.makefile d3 NAME=India ISO2=IN WEST=67.0 NORTH=37.5  EAST=99.0 SOUTH=05.0
#---- DEFAULT VALUES (customizable):
WIDTH=1280

#---- MAKEFILE
done: location topographic
done2:
	mkdir -p ../output/$(NAME)
	mv ./*.svg ./*.tpl -t ../output/$(NAME)/

topographic: b64
	WIDTH=$(WIDTH) node topographic.node.js		# see inside this file for parameters' calls

location: b64
	WIDTH=$(WIDTH) node location.node.js		# see inside this file for parameters' calls

b64: clean
	convert ../output/$(NAME)/trans.gis.tif -blur 3x3  ../output/$(NAME)/trans.png 
	convert ../output/$(NAME)/color.gis.tif ../output/$(NAME)/color.jpg
	for file in ../output/$(NAME)/*.jpg ../output/$(NAME)/*.png  ; \
	do echo $$file ; openssl base64 -in $$file -out ../output/$(NAME)/`basename $$file`.b64; \
	done;

server:
	node ../node_modules/.bin/forever ../node_modules/.bin/http-server --cors &

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
