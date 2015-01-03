# Add path to API
#import sys
#sys.path.insert(0, '../api')
#import utils

import argparse
import subprocess
import json
from pprint import pprint


parser = argparse.ArgumentParser(
    description="Create an atlas of SVG maps",
    epilog="Example usage: python makeatlas.py -c IN -b '67.0,5.0,99.0,37.5'")

parser.add_argument("-C", "--hasc", dest="hasc",
    type=str, default='W',
    help="""HASC or ISO-A2 code of territory.""")

parser.add_argument("-B", "--bbox", dest="bbox",
    type=str, default=None,
    help="""Bounding box of map canvas in decimal degrees. Formatted as 'left,bottom,right,top' or 'minLon,minLat,maxLon,maxLat'""")

parser.add_argument("-b", "--buffer", dest="buffer",
    type=int, default='2',
    help="""Percentage of buffer area around the territory included in the map""")

args = parser.parse_args()


    
class Bbox:
    "Bounding box coordinates"
    def __init__(self, bbox):
        self.wsen = bbox
        self.w = float(bbox.split(',')[0])
        self.s = float(bbox.split(',')[1])
        self.e = float(bbox.split(',')[2])
        self.n = float(bbox.split(',')[3])
        self.buffer_bbox(args.buffer)
        
    def buffer_bbox(self, buffer_percentage):
        "Extend the bounds by a small percentage to include surrounding areas" 
        buffer_percentage *= 0.01 
        self.w = self.w - abs(self.w) * buffer_percentage
        self.s = self.s - abs(self.s) * buffer_percentage
        self.e = self.e + abs(self.e) * buffer_percentage
        self.n = self.n + abs(self.n) * buffer_percentage

        
def load_index():
    # Read country list
    with open('../data/json/index.json', 'r') as f:
        try:
            index = json.load(f)
            for region in index["index"]:
                # Generate atlas if territory code found in index file, or generate all if argument is W
                if args.hasc == 'W' or  args.hasc == region["hasc"] :
                    make_wikiatlas(region["hasc"],region["name"],Bbox(region["bbox"]))

        finally:
                f.close()
    return 0

def make_wikiatlas(hasc,name,bbox):
    "Run master.makefile for an item"
    
    print "Making maps for {} with extents {}".format(name, bbox.wsen)
    command = "make -f master.makefile ITEM={} WEST={} NORTH={}  EAST={} SOUTH={}".format(hasc,bbox.w,bbox.n,bbox.e,bbox.s) 
    subprocess.call(command, shell=True)

if __name__ == '__main__':
    # If country code and bbox parameters are set
    if(args.hasc != 'W' and args.bbox is not None):
        make_wikiatlas(args.hasc,'',args.bbox)
    else:
        #Generate atlas using parameters from index file
        load_index()