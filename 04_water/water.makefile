#DEFAULT VALUES (customizable):
# inherit NAME, WEST, NORTH, EAST, SOUTH from master.makefile or command.
escaped_A = $(subst $e ,_,$(NAME))
escaped_NAME = $(subst $e' ,\',$(escaped_A))# THIS TWO MAY BE MERGED ! $(subst $e' ,\',$(subst $e ,_,$(NAME)) )
WIDTH=1980
QUANTIZATION=1e4
TOPOJSON_LOC=../node_modules/topojson/bin/topojson
TOPOJSON_GLO=topojson
# Water layer:
SELECTOR_RIVERS=SCALERANK > 0 # ??
SELECTOR_LAKES=SCALERANK > 0 #NOT WORKING with -where "$(SELECTOR_LAKES)" ??


#MAKEFILE
done: topojson
	mkdir -p ../output/$(NAME)
	mv waters.topo.json -t ../output/$(NAME)/

topojson: crop
	$(TOPOJSON_LOC) \
		--id-property none \
		-p name=name \
		-p scalerank=scalerank \
		-q $(QUANTIZATION) \
		--filter=small \
		-o waters.topo.json \
		-- lakes=crop_lakes.shp rivers=crop_rivers.shp

crop: clean
	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) \
		./crop_rivers.shp ../data/natural_earth_vector/10m_physical/ne_10m_rivers_lake_centerlines.shp
	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) \
		./crop_lakes.shp ../data/natural_earth_vector/10m_physical/ne_10m_lakes.shp
#	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) ./crop_rivers.shp ne_10m_rivers_lake_centerlines_scale_rank.shp
#	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) ./crop_lakes.shp ne_10m_rivers_lake_centerlines_scale_rank.shp

clean:
	rm -f *.json
	rm -f *.dbf
	rm -f *.prj 
	rm -f *.shp
	rm -f *.shx
	rm -f *.html
	rm -f *.txt
