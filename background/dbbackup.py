import time
import datetime
from subprocess import call
import boto
import json
import sys

AWS_key = ""
AWS_secret = ""
with open('private_settings.json') as data_file:    
    data = json.load(data_file)
    AWS_key = data['AWS-key']
    AWS_secret = data['AWS-secret']

conn = boto.connect_s3(AWS_key, AWS_secret)

bucket_name = "thrashing"
bucket = conn.get_bucket(bucket_name, validate=False)

from boto.s3.key import Key
k = Key(bucket)

import sys
def percent_cb(complete, total):
    sys.stdout.write('.')
    sys.stdout.flush()

def backup():
	call(['mongodump', '-o', 'databasefile/dump'])
	call(['zip' ,'-r', 'databasefile/backup.zip', 'databasefile/dump/'])
	db_file = "databasefile/backup.zip"
	print "uploading " + datetime.datetime.now().strftime("%y/%m/%d/backup.zip")
	k.key = datetime.datetime.now().strftime("%y/%m/%d/backup.zip")
	k.set_contents_from_filename(db_file, cb=percent_cb, num_cb=10)

backup()