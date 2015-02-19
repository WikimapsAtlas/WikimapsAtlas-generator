srtm:
   #	curl -L -C - 'http://gis-lab.info/data/srtm-tif/srtm_[01-01]_[01-03].zip' -o './data/SRTM_V41_#1_#2.zip'
	wget -nd -P data -r --no-parent --random-wait --timestamping http://gis-lab.info/data/srtm-tif/
   #	touch ./data/*.zip

clean:
	rm `ls | grep -v 'zip' | grep -v 'Makefile'`


	
