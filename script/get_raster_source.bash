#!/bin/bash
# bash ./script.bash param1 param2 param3 param4
# Variable --------------------------------------------------------- #
WEST=$1
NORTH=$2
EAST=$3
SOUTH=$4
# Context ---------------------------------------------------------- #
rm -f ./tmp/*
mkdir -p ./tmp/
# ------------------------------------------------------------------ #
# Core ------------------------------------------------------------- #
if [[ ${AREA_SIZE} == "etopo" ]]; then
	echo "Source selected: ETOPO (1km/px)"
	gdal_translate -projwin $WEST $NORTH $EAST $SOUTH -eco ../data/noaa/ETOPO1_Ice_g_geotiff.tif crop_xl_.tmp.tif
fi
# ------------------------------------------------------------------ #
if [[ ${AREA_SIZE} == "srtm250"  ]]; then
	echo "Source selected: SRTM (1px=250m)"
	files=(`ls ../data/cgiar-csi_250/ | grep .tif$`)
	for i in "${!files[@]}"
	do
		echo "Processing GIS raster: ${files[${i}]}"
		gdal_translate -projwin $WEST $NORTH $EAST $SOUTH -eco ../data/cgiar-csi_250/${files[${i}]} ./tmp/crop.${i}.tmp.tif
	done
#	inputs=`ls ./tmp/crop.*.tmp.tif | tr '\n' ' '`
#	echo ${inputs}
	echo "Merging raw tiles: -----------------------------"
	gdal_merge.py -o ./crop_xl_.tmp.tif ./tmp/crop.*.tmp.tif		# -n -32768
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
	echo "Merging raw tiles: -----------------------------"
	gdal_merge.py -o ./crop_xl_.tmp.tif ./tmp/crop.*.tmp.tif		# -n -32768
fi
# ------------------------------------------------------------------ #
# ------------------------------------------------------------------ #
if [[ ${AREA_SIZE} == "test" ]]; then
	echo "Source selected: gis raster in ./data/test"

	files=(`ls ../data/test/ | grep .tif$`)
	for i in "${!files[@]}"
	do
		echo "Processing GIS raster: ${files[${i}]}"
		gdal_translate -projwin $WEST $NORTH $EAST $SOUTH -eco ../data/test/${files[${i}]} ./tmp/crop.${i}.tmp.tif
	done
	echo "Merging raw tiles: -----------------------------"
	gdal_merge.py -o ./crop_xl_.tmp.tif ./tmp/crop.*.tmp.tif 	# -n -32768
fi
gdal_fillnodata.py -md 400 ./crop_xl_.tmp.tif ./crop_xl.tmp.tif # if pixels with no data, calculate their values, fill.
gdal_translate -projwin $WEST $NORTH $EAST $SOUTH -eco ../data/noaa/ETOPO1_Ice_g_geotiff.tif crop_xl_etopo.tmp.tif
