#!/bin/bash

while IFS=; read -r subject W N E S
do
	make subject="$subject" W="$W" N="$N" E="$E" S="$S"
done
