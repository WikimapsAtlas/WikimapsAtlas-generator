#---- RUN
# make -f master.makefile ITEM=India WEST=67.0 NORTH=37.5  EAST=99.0 SOUTH=05.0
EXPORT imgb64=nothing
escaped_A = $(subst $e ,_,$(ITEM))
escaped_ITEM = $(subst $e' ,\',$(escaped_A))# THIS TWO MAY BE MERGED ! $(subst $e' ,\',$(subst $e ,_,$(ITEM)) )

#---- DEFAULT VALUES (customizable):
# Some variables are defined by master.makefile & called by svgcreator.node.js 
#	geo: { WEST, NORTH, EAST, SOUTH } ==> see master file's variable declaration
#	script: { DATE, VERSION }         ==> see master file's variable declaration

#---- MAKEFILE
output: clean b64
	node svgcreator.node.js

b64: clean
#	openssl base64 -in ../output/$(ITEM)/color_relief-hillshade-wp-multiply.jpg -out image.b64

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
