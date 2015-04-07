#note run this script from the thrashing base directory
import schedule
from sitemap import generate_sitemap
from dbbackup import backup
import time
import subprocess as sub
import threading

class RunCmd(threading.Thread):
    def __init__(self, cmd, timeout):
        threading.Thread.__init__(self)
        self.cmd = cmd
        self.timeout = timeout

    def run(self):
        self.p = sub.Popen(self.cmd)
        self.p.wait()

    def Run(self):
        self.start()
        self.join(self.timeout)

        if self.is_alive():
            self.p.terminate()
            self.join()

def refreshES():
    RunCmd(['node', 'background/refreshES.js'], 50).Run()

def email():
    RunCmd(['node', 'background/email.js'], 50).Run()

def feed():
    RunCmd(['node', 'background/feed.js'], 50).Run()

def related_tutorial():
    RunCmd(['node', 'background/related_tutorial.js'], 50).Run()

# note 11:00 UTC is 3:00 in Pacific time 
# python jobs
schedule.every().day.at("11:00").do(backup)
schedule.every().day.at("11:35").do(generate_sitemap)
# js jobs
schedule.every(4).hours.do(refreshES)
schedule.every().day.at("12:00").do(email)
schedule.every(15).minutes.do(feed)
schedule.every().day.at("18:00").do(related_tutorial)

while True:
    schedule.run_pending()
    time.sleep(60)
