# Add path to API
import sys
sys.path.insert(0, '../api')

import argparse
import subprocess
import utils

parser = argparse.ArgumentParser(
    description="Create an atlas of SVG maps",
    epilog="Example usage: python makeatlas.py -c IN -b '67.0,5.0,99.0,37.5'")

parser.add_argument("-c", "--hasc", dest="hasc",
    type=str, required=True,
    help="""HASC or ISO-A2 code of territory.""")

parser.add_argument("-b", "--bbox", dest="bbox",
    type=str,
    help="""Bounding box of map canvas in decimal degrees. Formatted as 'left,bottom,right,top' or 'minLon,minLat,maxLon,maxLat'""")

args = parser.parse_args()

if __name__ == '__main__':
    command = "make -f" 
    subprocess.call(command, shell=True)