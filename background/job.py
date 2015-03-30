#note run this script from the thrashing base directory
import schedule
import time
import datetime
from subprocess import call
import boto
import json
from creepy import Crawler
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

def generate_sitemap():
    siteurl = ""
    class SiteCrawler(Crawler):
        urls = []
        def process_document(self, doc):
            if doc.status == 200:
                if siteurl in doc.url:
                    self.urls += [doc.url]
            else:
                pass
    def getUrls (url):
        crawler = SiteCrawler()
        crawler.set_follow_mode(Crawler.F_SAME_HOST)
        crawler.add_url_filter('\.(jpg|jpeg|gif|png|js|css|swf)$')
        siteurl = url
        crawler.crawl(url)
        return crawler.urls

    intro = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n'
    end = '</urlset>'
    body = ''
    urls = getUrls("http://www.thrashing.io")
    for url in urls:
        body += '<url>\n'
        body += '\t<loc>' + url + '</loc>\n'
        body += '</url>\n'
    output = intro + body + end
    out = 'public/sitemap.xml'
    f = open(out,'w')
    f.write(output)
    f.close()

# note 11:00 UTC is 3:00 in Pacific time 
schedule.every().day.at("11:00").do(backup)
schedule.every().day.at("11:00").do(generate_sitemap)

while True:
    schedule.run_pending()
    time.sleep(60)
