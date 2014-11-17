#---- Some peripheric GUI tools for humans
success: Qgis accessibility
	echo "======================================" 
	echo "Human-friendly GUI tools: done --------> 100% !"

#---- Sugar
Qgis:
#	sudo apt-get install add-apt-repository ;
	sudo add-apt-repository -y ppa:ubuntugis/ubuntugis-unstable
	sudo apt-get update
	sudo apt-get -y install qgis

accessibility:
	mkdir -p academic
	curl -o ./academic/ColorOracleJar.zip -C - http://colororacle.org/ColorOracleJar.zip
	unzip -n ./academic/ColorOracleJar.zip -d ./academic
	chmod a+x ./academic/ColorOracle.jar
	./academic/ColorOracle.jar
