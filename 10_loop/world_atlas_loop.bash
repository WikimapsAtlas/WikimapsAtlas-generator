#!/bin/bash
# runs: bash ./10_loop/world_atlas_loop.bash ./10_loop/commands.txt
file=$1
while IFS= read -r line;
do
	$line
done < "$file"

#IFS: Internal Field Separator
# while IFS=' '; read -r field1 field2 field3 f4 f5 ... # for input such:  India  67.0  37.5  99.0  05.0  
