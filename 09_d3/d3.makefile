#---- RUN
# make -f master.makefile NAME=India WEST=67.0 NORTH=37.5  EAST=99.0 SOUTH=05.0
EXPORT imgb64=nothing

#---- DEFAULT VALUES (customizable):
# Some variables are defined by master.makefile & called by svgcreator.node.js 
#	geo: { WEST, NORTH, EAST, SOUTH } ==> see master file's variable declaration
#	script: { DATE, VERSION }         ==> see master file's variable declaration
WIDTH=1980
#HEIGHT=`identify ../output/$(NAME)/color.gis.tif | cut -f 3 -d " " | sed s/.*x//`

#---- MAKEFILE
done: output
	mkdir -p ../output/$(NAME)
	mv ./*.svg ../output/$(NAME)/
	
output: b64
#	WIDTH=$(WIDTH) node svgcreator.node.js 		# see inside this file for parameters' calls
	WIDTH=$(WIDTH) node location.node.js		# see inside this file for parameters' calls

b64: clean server
	for file in ../output/$(NAME)/*.jpg; \
	do echo $$file ; openssl base64 -in $$file -out ../output/$(NAME)/`basename $$file`.b64; \
	done
	for file in ../output/$(NAME)/*.png; \
	do echo $$file ; openssl base64 -in $$file -out ../output/$(NAME)/`basename $$file`.b64; \
	done

server:
#	node ../node_modules/.bin/http-server
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
