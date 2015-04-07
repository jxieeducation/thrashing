#!/bin/bash

#elastic search
sudo apt-get update
#https://www.digitalocean.com/community/tutorials/how-to-install-elasticsearch-on-an-ubuntu-vps
sudo apt-get install unzip zip openjdk-6-jre python-pip
mkdir bin
curl http://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-0.90.1.zip -o temp-es.zip && unzip temp-es.zip && rm temp-es.zip && mv elasticsearch-0.90.1 ~/bin/elasticsearch && ~/bin/elasticsearch/bin/elasticsearch

#node stack
sudo apt-get install git mongodb
# http://stackoverflow.com/questions/27703218/mean-stack-on-ubuntu-14-04-suddenly-stopped-working 
#installs node and npm
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs 
node -v

git clone https://github.com/jxieeducation/thrashing
cd thrashing
mkdir databasefile
npm i
# fix mongoose shit: http://stackoverflow.com/questions/28651028/cannot-find-module-build-release-bson-code-module-not-found-js-bson

#python scheduler
sudo pip install schedule boto pymongo

# scheduler screen
screen -S scheduler
scp -i /worker.pem private_settings.json ubuntu@ec2-54-69-49-75.us-west-2.compute.amazonaws.com:~/thrashing/
python background/job.py

# screen for main app
screen -S app
sudo node app.js

#to load db from backup dump
scp -i /worker.pem ~/Downloads/backup.zip ubuntu@ec2-54-69-49-75.us-west-2.compute.amazonaws.com:~/
# migrations stuff
mongorestore .....pathtodump.....


