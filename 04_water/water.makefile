#---- RUN
# make -f master.makefile water NAME=India ISO2=IN WEST=67.0 NORTH=37.5  EAST=99.0 SOUTH=05.0 QUANTIZATION=1e4
#---- DEFAULT VALUES (customizable):
#---- Topojson
TOPOJSON_LOC=../node_modules/topojson/bin/topojson
QUANTIZATION=1e4

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

clean:
	rm -f *.json
	rm -f *.dbf
	rm -f *.prj 
	rm -f *.shp
	rm -f *.shx
	rm -f *.html
	rm -f *.txt
