#!/bin/bash
# runs: bash ./script/world_atlas_generator.bash ./script/world_atlas_commands.txt
file=$1
while IFS= read -r line;
do
	$line
done < "$file"

#IFS: Internal Field Separator
# while IFS=' '; read -r field1 field2 field3 f4 f5 ... # for input such:  India  67.0  37.5  99.0  05.0  
