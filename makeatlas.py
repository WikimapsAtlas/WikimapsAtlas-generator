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
    type=str, default='67.0,5.0,99.0,37.5',
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

        
def load_index(hasc):
    # Read country list
    with open('../data/json/index.json', 'r') as f:
        try:
            index = json.load(f)
            
            for region in index["index"]:
                print "Making maps for {} with extents {}".format(region["name"],region["bbox"])
                bbox = Bbox(region["bbox"])
                command = "make -f master.makefile ITEM={} WEST={} NORTH={}  EAST={} SOUTH={}".format(region["hasc"],bbox.w,bbox.n,bbox.e,bbox.s) 
                subprocess.call(command, shell=True)
    
        finally:
                f.close()
    return 0

if __name__ == '__main__':
    load_index(args.hasc)