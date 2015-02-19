# Crop.tif from SRTM_V4.1 (250m)
## boxing: 
crop: merge
	gdal_translate -projwin -005.50 051.30 10.00 041.00 world.tif crop.tif

# ----
## Merge
merge: uncompress
	gdal_merge.py -o world.tif SRTM_W_250m.tif SRTM_SE_250m.tif SRTM_NE_250m.tif
	# * is wild card.

## Unrar
uncompress: 
	unrar e -o "*.rar"
	touch *.tif

#uncompress:
#	unzip -o "./data/*.zip" -d ./data
#	touch ./data/*.tif

## Download:
## To download by hand @: https://hc.box.net/shared/1yidaheouv (temporary download url). Password: ThanksCSI!

clean:
	rm `ls | grep -v 'zip' | grep -v 'Makefile'`
