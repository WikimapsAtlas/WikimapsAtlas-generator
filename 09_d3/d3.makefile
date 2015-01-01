#---- RUN
# make -f master.makefile ITEM=India WEST=67.0 NORTH=37.5  EAST=99.0 SOUTH=05.0
EXPORT imgb64=nothing

#---- DEFAULT VALUES (customizable):
# Some variables are defined by master.makefile & called by svgcreator.node.js 
#	geo: { WEST, NORTH, EAST, SOUTH } ==> see master file's variable declaration
#	script: { DATE, VERSION }         ==> see master file's variable declaration

#---- MAKEFILE
output: b64 clean
	node svgcreator.node.js

b64: clean
	for file in ../output/$(ITEM)/*.gis.*; \
	do echo $$file ; openssl base64 -in $$file -out ./img/`basename $$file`.b64; \
	done
	# ../output/India/color.gis.tif ; ../output/India/color_hillshades.gis.tif
	# ../output/India/trans.gis.tif ; ../output/India/white_hillshades.gis.tif

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
