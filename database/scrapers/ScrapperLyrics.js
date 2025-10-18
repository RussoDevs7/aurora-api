const request = require('request');
const cheerio = require('cheerio');

class ScrapperLyrics {

    static getHTML(url, config = {}) {
       return new Promise((resolve, reject) => {
          request({
            url,
            ...config
          }, (error, res, body) => {
            if (error) return reject(error);
            try {
               body = JSON.parse(body);
            } catch { }
			resolve(body);
	      });
       });
   };
   
   static UserAgent() {
       const oos = [ 'Macintosh; Intel Mac OS X 10_15_5', 'Macintosh; Intel Mac OS X 10_11_6', 'Windows NT 10.0; Win64; x64', 'Windows NT 10.0; WOW64', 'Windows NT 10.0', 'Macintosh; Intel Mac OS X 10_15_7', 'Macintosh; Intel Mac OS X 10_6_6', 'Macintosh; Intel Mac OS X 10_9_5', 'Macintosh; Intel Mac OS X 10_10_5', 'Macintosh; Intel Mac OS X 10_7_5', 'Macintosh; Intel Mac OS X 10_11_3', 'Macintosh; Intel Mac OS X 10_10_3', 'Macintosh; Intel Mac OS X 10_6_8', 'Macintosh; Intel Mac OS X 10_10_2', 'Macintosh; Intel Mac OS X 10_10_3', 'Macintosh; Intel Mac OS X 10_11_5' ];
       return `Mozilla/5.0 (${oos[Math.floor(Math.random() * oos.length)]}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 3) + 87}.0.${Math.floor(Math.random() * 190) + 4100}.${Math.floor(Math.random() * 50) + 140} Safari/537.36`;
   };
   
   static get(query) {
      return new Promise((resolve, reject) => {
        this.getHTML(`https://solr.sscdn.co/letras/m1/?q=${query}&wt=json&callback=LetrasSug`, {
          headers: {
            'User-Agent': this.UserAgent()
          }
        }).then(async(response) => {
            if (typeof response === 'string') {
               const start = response.indexOf('(');
               const end = response.lastIndexOf(')');
               if (start !== -1 && end !== -1 && start < end) {
                   const jsonString = response.slice(start + 1, end);
                   const jsonData = JSON.parse(jsonString);
                   const result = await Promise.all(jsonData.response.docs.map(async(doc) => {
                      const responseSong = await this.getHTML(`https://www.letras.mus.br/${doc.dns || ''}/${doc.url || doc.urlal || ''}/`, {});
                      const $ = cheerio.load(responseSong);
                      const imgSet = $('.thumbnail img').attr('srcset');
                      const img = imgSet ? imgSet.split(', ')[1].split(' ')[0] : null;
                      const lyrics = $('.lyric-original p').map((i, el) => $(el).html().replace(/<br\/?>/g, '\n')).get().join('\n\n');
                      return { 
                      criador: `RussoDevs7`,
                        ...doc, 
                        img,
                        
                        lyrics 
                      };
                   }));
                   if (result.length === 0) return reject('Nenhum resultado encontrado.');
                   return resolve(result);
               }
            }
        }).catch((error) => reject(error.message));
     });
  }
  
}

module.exports = ScrapperLyrics;