#!/bin/bash
# Example : bash ./script.bash WEST=dd.dd NORTH={dd} EAST={ddd} SOUTH={d} AREA_SIZE=srtm250
# Variable --------------------------------------------------------- #
WEST=$1
NORTH=$2
EAST=$3
SOUTH=$4
SOURCE="etopo" # to use in later developments
# Context ---------------------------------------------------------- #
rm -f ./tmp/*
mkdir -p ./tmp/
# AREA_SIZE should be steradian
# SOURCE should be used for etopo, srtm250, srtm90
# ------------------------------------------------------------------ #
# Core ------------------------------------------------------------- #
# ------------------------------------------------------------------ #
if [[ ${AREA_SIZE} == "srtm250" ]]; then
	echo "Source selected: SRTM (1px=250m)"
	files=(`ls ../data/cgiar-csi_250/ | grep .tif$`)
	for i in "${!files[@]}"
	do
		echo "Processing GIS raster: ${files[${i}]}"
		gdal_translate -projwin $WEST $NORTH $EAST $SOUTH -eco ../data/cgiar-csi_250/${files[${i}]} ./tmp/crop.${i}.tmp.tif
	done
fi
# ------------------------------------------------------------------ #
if [[ ${AREA_SIZE} == "srtm90" ]]; then
	echo "Source selected: SRTM(1px= 90m)"
	files=(`ls ../data/cgiar-csi_90/ | grep .tif$`)
	for i in "${!files[@]}"
	do
		echo "Processing GIS raster: ${files[${i}]}"
		gdal_translate -projwin $WEST $NORTH $EAST $SOUTH -eco ../data/cgiar-csi_90/${files[${i}]} ./tmp/crop.${i}.tmp.tif
	done
fi
# ------------------------------------------------------------------ #
if [[ ${AREA_SIZE} == "test" ]]; then
	echo "Source selected: gis raster in ./data/test"
	files=(`ls ../data/test/ | grep .tif$`)
	for i in "${!files[@]}"
	do
		echo "Processing GIS raster: ${files[${i}]}"
		gdal_translate -projwin $WEST $NORTH $EAST $SOUTH -eco ../data/test/${files[${i}]} ./tmp/crop.${i}.tmp.tif
	done
fi


echo "Merging tiles: -------------------------------"
if [[ ${AREA_SIZE} == "srtm250" || ${AREA_SIZE} == "srtm90" || ${AREA_SIZE} == "test" ]]; then
	echo "Merging tiles: -------------------------------"
	gdal_merge.py -o ./crop_xl_raw.tmp.tif ./tmp/crop.*.tmp.tif	|| true	# -n -32768 ; <output_file> <input_file>
fi

# ------------------------------------------------------------------ #
#Etopo crop : ALWAYS. FOR NOW. MAY NEED CHANGE AND DROP.
#if [[ ${AREA_SIZE} == "etopo" || -z ${AREA_SIZE} ]]; then
	echo "Source selected: ETOPO (1km/px)"
	gdal_translate -projwin $WEST $NORTH $EAST $SOUTH -eco ../data/noaa/ETOPO1_Ice_g_geotiff.tif ./tmp/crop_xl.etopo.tmp.tif
	cp ./tmp/crop_xl.etopo.tmp.tif ./crop_xl.etopo.tmp.tif
#	cp ./tmp/crop_xl.etopo.tmp.tif ./crop_xl_raw.tmp.tif
#fi


echo "Fillnodata: ----------------------------------"
gdal_fillnodata.py -md 400 ./crop_xl_raw.tmp.tif ./crop_xl.tmp.tif # if pixels with no data, calculate their values, fill.; <input_file> <output_file>
