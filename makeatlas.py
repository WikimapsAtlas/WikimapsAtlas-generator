# Add path to API
#import sys
#sys.path.insert(0, '../api')
#import utils

import argparse
import subprocess


parser = argparse.ArgumentParser(
    description="Create an atlas of SVG maps",
    epilog="Example usage: python makeatlas.py -c IN -b '67.0,5.0,99.0,37.5'")

parser.add_argument("-c", "--hasc", dest="hasc",
    type=str, required=True, default='IN',
    help="""HASC or ISO-A2 code of territory.""")

parser.add_argument("-b", "--bbox", dest="bbox",
    type=str, default='67.0,5.0,99.0,37.5',
    help="""Bounding box of map canvas in decimal degrees. Formatted as 'left,bottom,right,top' or 'minLon,minLat,maxLon,maxLat'""")

args = parser.parse_args()


    
class Bbox:
    """Bounding box coordinates"""
    def __init__(self, bbox):
        self.wsen = bbox
        self.w = bbox.split(',')[0]
        self.s = bbox.split(',')[1]
        self.e = bbox.split(',')[2]
        self.n = bbox.split(',')[3]
        
def mastermake():
    bbox = Bbox(args.bbox)
    print bbox.w
    command = "make -f master.makefile ITEM={} WEST={} NORTH={}  EAST={} SOUTH={}".format(args.hasc,bbox.w,bbox.n,bbox.e,bbox.s) 
    subprocess.call(command, shell=True)
    
def getbbox(hasc):
    return

if __name__ == '__main__':
    mastermake()