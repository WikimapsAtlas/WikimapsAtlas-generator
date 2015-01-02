import argparse
import subprocess

parser = argparse.ArgumentParser(
    description="Create an atlas of SVG maps",
    epilog="Example usage: python makeatlas.py -c FR")

parser.add_argument("-c", "--hasc", dest="database",
    type=str, required=True,
    help="HASC or ISO-A2 code of territory")

