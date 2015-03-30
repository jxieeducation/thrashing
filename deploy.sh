#!/bin/bash

#elastic search
sudo apt-get update
#curl http://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-0.90.1.zip -o temp-es.zip && unzip temp-es.zip && rm temp-es.zip && mv elasticsearch-0.90.1 ~/bin/elasticsearch && ~/bin/elasticsearch/bin/elasticsearch
#https://www.digitalocean.com/community/tutorials/how-to-install-elasticsearch-on-an-ubuntu-vps
sudo apt-get install unzip zip
mkdir bin
curl http://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-0.90.1.zip -o temp-es.zip && unzip temp-es.zip && rm temp-es.zip && mv elasticsearch-0.90.1 ~/bin/elasticsearch && ~/bin/elasticsearch/bin/elasticsearch

#node stack
sudo apt-get install git
sudo apt-get install mongodb
# http://stackoverflow.com/questions/27703218/mean-stack-on-ubuntu-14-04-suddenly-stopped-working 
<-- installs node and npm
git clone https://github.com/jxieeducation/thrashing
cd thrashing
mkdir databasefile
npm i

#python scheduler
sudo apt-get install python-pip
sudo pip install schedule boto creepy

#mongodb screen
screen -S mongo
cd databasefile
mongod --dbpath . --smallfiles

# scheduler screen
screen -S scheduler
scp -i /worker.pem private_settings.json ubuntu@ec2-54-69-180-226.us-west-2.compute.amazonaws.com:~/thrashing/
python background/job.py

#indexing screen
screen -S indexing
nodejs background/indexDatabase.js

# screen for main app
screen -S app
--> change ports from 3000 to the real one


#to load db from backup dump
mongorestore .....pathtodump.....


