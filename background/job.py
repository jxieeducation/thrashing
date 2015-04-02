#note run this script from the thrashing base directory
import schedule
from subprocess import call
from sitemap import generate_sitemap
from dbbackup import backup

def refreshES():
    call(['node', 'background/refreshES.js'])
    call(['nodejs', 'background/refreshES.js'])

def email():
    call(['node', 'background/email.js'])
    call(['nodejs', 'background/email.js'])

def feed():
    call(['node', 'background/feed.js'])
    call(['nodejs', 'background/feed.js'])

def related_tutorial():
    call(['node', 'background/related_tutorial.js'])
    call(['nodejs', 'background/related_tutorial.js'])

# note 11:00 UTC is 3:00 in Pacific time 
# python jobs
schedule.every().day.at("11:00").do(backup)
schedule.every().day.at("11:00").do(generate_sitemap)
# js jobs
schedule.every(4).hour.do(refreshES)
schedule.every().day.at("12:00").do(email)
schedule.every(15).minutes.do(feed)
schedule.every().day.at("18:00").do(related_tutorial)

while True:
    schedule.run_pending()
    time.sleep(60)
