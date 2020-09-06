#---- RUN
# make -f master.makefile d3 NAME=India ISO2=IN WEST=67.0 NORTH=37.5  EAST=99.0 SOUTH=05.0
#---- DEFAULT VALUES (customizable):
WIDTH=1280

#---- MAKEFILE
done: move
	node ../node_modules/.bin/forever stopall

move: template location topography
	mkdir -p ../output/$(NAME)
	mv ./*.svg ./template-commons.txt -t ../output/$(NAME)/

template: b64
	node template-commons.node.js
	echo "Done: Commons.Wikimedia.org template printed to .txt file"

topography: b64
	WIDTH=$(WIDTH) node jsdom@16-topographic.node.js		# see inside this file for parameters' calls

location: b64
	WIDTH=$(WIDTH) node jsdom@16-location.node.js		# see inside this file for parameters' calls

b64: server clean
	convert -quiet ../output/$(NAME)/trans.gis.tif ../output/$(NAME)/trans.png #  -blur 3x3
	convert -quiet ../output/$(NAME)/color.gis.tif ../output/$(NAME)/color.jpg
	for file in ../output/$(NAME)/*.jpg ../output/$(NAME)/*.png  ; \
	do echo $$file ; openssl base64 -in $$file -out ../output/$(NAME)/`basename $$file`.b64; \
	done;

server:
	# Note: d3.makefile and js/wikiatlas.js requires to http-server on http://127.0.0.1:8080 the resources files, staring at project root.
	node ../node_modules/.bin/forever ../node_modules/.bin/http-server ../ --cors &

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
