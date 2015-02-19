OLD
	convert color_relief-wp.jpg 	shadedrelief.trans.png -compose Multiply -composite 		color_relief-hillshade-wp-multiply.jpg 		#color; quality: +++
	composite -dissolve 100 		shadedrelief.trans.png color_relief-wp.jpg -alpha Set 		color_relief-hillshade-wp-100.jpg 			#note: perfect ++
	composite -dissolve 100 		shadedrelief.trans.png white.jpg -alpha Set 				white_relief-hillshade-wp-100.jpg 			#note: perfect ++


#--- Trans shades
progressive_transparency: grey_wiping
	convert shadedrelief.grey2trans.tmp.png -alpha copy -channel alpha -negate +channel shadedrelief.trans.png     # ++  deleted line
	convert shadedrelief.grey2white.tmp.png -alpha copy -channel alpha -negate +channel shadedrelief.trans2.png    # +++ kept
grey_wiping: shade
	convert shadedrelief.tmp.tif -fuzz $(FUZZ)% -transparent "#DDDDDD" shadedrelief.grey2trans.tmp.png 		    	# heavier (2.6M) deleted line
	convert shadedrelief.tmp.tif -fuzz $(FUZZ)% -fill "#FFFFFF" -opaque "#DDDDDD"  shadedrelief.grey2white.tmp.png  # lighter (0.9M) kept