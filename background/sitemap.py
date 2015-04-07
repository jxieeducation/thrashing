from pymongo import MongoClient

c = MongoClient()
db = c.thrashing

def generate_sitemap():
    baseurl = "http://www.thrashing.io/"
    theUrls = ["http://www.thrashing.io/", "http://www.thrashing.io/signin", "http://www.thrashing.io/signup"]
    for tutorial in db['tutorials'].find():
        theUrls += [baseurl + "tutorial/" + str(tutorial['_id'])]
    for user in db['users'].find():
        theUrls += [baseurl + "profile/" + str(user['_id'])]

    intro = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n'
    end = '</urlset>'
    body = ''
    print "urls scraped"
    for url in theUrls:
        body += '<url>\n'
        body += '\t<loc>' + url + '</loc>\n'
        body += '</url>\n'
    print "xml generated"
    output = intro + body + end
    out = 'public/sitemap.xml'
    f = open(out,'w')
    f.write(output)
    f.close()
