from creepy import Crawler

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