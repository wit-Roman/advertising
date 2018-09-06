const request = require('request');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const mysql = require('mysql');
//const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const mysql_real_escape_string = require('./../static-methods.js').mysql_real_escape_string;

exports.loadingGoogleApi = async function (param) {
  console.log('Partners');
  const parser = new Parser(param[2],'Partners');
  return await parser.amortization(param[0],param[1],param[2]);
}

exports.loadingAdvse = async function (param) {
  console.log('Advse');
  const parser = new Parser(0,'Advse');
  return await parser.amortization(param[0],param[1]);
}

exports.loadingAdvseTable = async function(param) {
  console.log('AdvseTable');
  const parser = new Parser(0,'AdvseTable');
  return await parser.AdvseTable(param[0]);
}

exports.loadingAdvsePage = async function(param) {
  console.log('AdvseTablePage');
  const parser = new Parser(0,'AdvseTablePage');
  return await parser.AdvseTablePage();
}

exports.loadingCombine = async function(param) {
  console.log('CombineTables');
  const parser = new Parser(0,'CombineTables');
  return await parser.CombineTables(param[0],param[1],param[2],param[3]);
}

class Parser {
  constructor(address,source) {
    this._arrResults = [];
    this.address = address;
    this.source = source;
    this.mongodb = {};
    const objDate = new Date();
    this.TableName = this.source+'-'+this.address+'-'+objDate.getDate()+'-'+(objDate.getMonth()+1)+'-'+objDate.getFullYear();
    this.headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36','Content-Type': 'application/x-www-form-urlencoded','X-Requested-With':'XMLHttpRequest'};
    this.SQLopen();
  }
  SQLopen() {
    let SQLquery = "";
    if (this.source === "Partners") {
      MongoClient.connect('mongodb://dbRoman:***@localhost:27017/admin', { useNewUrlParser: true } ).then( connection => {
        this.mongodb = connection;
        this.mongodb.db("admin").createCollection(this.TableName);
      }).catch(error => {
        console.log('ERROR:', error);
      });
      
      SQLquery += "CREATE TABLE IF NOT EXISTS `rang-"+this.TableName+"` ( id BIGINT(11) PRIMARY KEY, num SMALLINT, displayName VARCHAR(64), websiteUrl VARCHAR(64), displayImageUrl VARCHAR(128) ) ENGINE=InnoDB DEFAULT CHARSET=utf8; ";
    } 
    if (this.source === "Advse") {
      SQLquery += "CREATE TABLE IF NOT EXISTS `clients-"+this.TableName+"` ( i INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, num SMALLINT, name VARCHAR(64), websiteUrl VARCHAR(64), showsCount MEDIUMINT, clicksCount MEDIUMINT, CTR DECIMAL(4,1), numer INT ) ENGINE=InnoDB DEFAULT CHARSET=utf8; ";
    }
    if (this.source === "AdvseTable") {
      SQLquery += "CREATE TABLE IF NOT EXISTS `rating-Advse` ( i INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, id BIGINT(11) NULL UNIQUE, num SMALLINT, name VARCHAR(64), websiteName VARCHAR(64), websiteUrl VARCHAR(64), clientsCount MEDIUMINT, companiesCount MEDIUMINT, showsCount MEDIUMINT, clicksCount MEDIUMINT, CTR DECIMAL(4,1), rang DECIMAL(10,3) ) ENGINE=InnoDB DEFAULT CHARSET=utf8; ";
    }
    if (this.source === "AdvseTablePage") {
      SQLquery += "CREATE TABLE IF NOT EXISTS `rating-"+this.TableName+"` ( i SMALLINT NOT NULL, id BIGINT(11) NULL, num SMALLINT PRIMARY KEY, name VARCHAR(64), websiteName VARCHAR(64), websiteUrl VARCHAR(64), clientsCount MEDIUMINT, companiesCount MEDIUMINT, showsCount MEDIUMINT, clicksCount MEDIUMINT, CTR DECIMAL(4,1), rang DECIMAL(10,3) ) ENGINE=InnoDB DEFAULT CHARSET=utf8; ";
    }
    if (this.source === "CombineTables") {
      SQLquery += "CREATE TABLE IF NOT EXISTS `used` ( i SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, param VARCHAR(16), name VARCHAR(64) ) ENGINE=InnoDB DEFAULT CHARSET=utf8; TRUNCATE TABLE `used`; ";
    }
    
    this.SQLoperation(SQLquery);
  }
  SQLoperation (SQLquery) {
    this.mysqlConn = mysql.createConnection({
      host: "localhost",
      user: "wit",
      password: "***",
      database : "adv",
      multipleStatements: true
    });
    this.mysqlConn.connect();
    var result = true;
    this.mysqlConn.query(SQLquery, (error) => {
      if (error) {
        result = false;
        throw error;
      }
    });
    this.mysqlConn.end();
    return result;
  }
  amortization(s,f) {
    return new Promise( (resolve,reject) => {
      const _obj = this;
      var i = s;
      let time = setTimeout(async function run() {
        
        var result =  await _obj[_obj.source](i).then(ready => {
          console.log(ready);
        }).catch(error => {
          console.dir(error);
          reject(0);
        });

        if (i < f) {
          i++;
          _obj._arrResults.push(result);
          setTimeout(run, 200);
        } else {
          if ( _obj._arrResults.every(x => x != 0) ) {
            resolve(1);
          } else {
            reject(0);
          }
          clearTimeout(time); 
        }

      }, 200);
    })
  }

  Partners(i) {
    return new Promise( (resolve,reject) => {
      const pageSize = 10;
      i = i * pageSize;
      const gpsMotivations = '***';
      const requestMetadata_partnersSessionId = "***";
      const key = "***";
      const url = "***";
      
      request.get(url, async (error, response, body) => {
        if(error) { 
          console.dir(error);
          reject(0);
        }

        const dump = JSON.parse(body);        

        if ( dump.hasOwnProperty('companies') ) {
          let SQLquery = "";      

          dump.companies.forEach( (company,index) =>{
            company.num = parseInt(i+index);
            this.mongodb.db("admin").collection(this.TableName).insert(company);
            SQLquery += "INSERT INTO `rang-"+this.TableName+"` (`id`, `num`, `displayName`, `websiteUrl`, `displayImageUrl` ) VALUES ( "+parseInt(company.id)+", "+company.num+", '"+mysql_real_escape_string(company.localizedInfos[0].displayName)+"', '"+company.websiteUrl+"', '"+company.publicProfile.displayImageUrl+"' ); ";
          });
          this.SQLoperation(SQLquery);
          console.log(`№ ${i}, STATUS: ${response.statusCode}`);
        } else {
          console.log(`№ ${i}, STATUS: ${response.statusCode} empty`);
        }

        resolve(true);
      });
    })
  }

  Advse(i) {
    return new Promise( (resolve,reject) => {
      const _obj = this;
      let timeout = setTimeout(function run(p=0,SQLquery="") {
        let options = {
          url: '***',
          headers: {'X-Requested-With':'XMLHttpRequest'}
        };
  
        function callback (error, response, body) {
          if(error) return console.dir(error);
          const dom = new JSDOM(`<table><tbody>`+body);
          //console.log(  dom.serialize().slice(0,128)  );
          const elem = dom.window.document.querySelectorAll("tr.smalltext.c"+i);
          let data = { num: i, elem: [] };
          
          if ( typeof elem[0] !== "undefined" && response.statusCode === 200 ) {
            elem.forEach( (tr,index) =>{
              if (tr.querySelector(".left a") !== null ) {
                data.elem[index] = {
                  numer: parseInt( tr.querySelectorAll("td")[0].innerHTML )
                }
                SQLquery += "INSERT INTO `clients-"+_obj.TableName+"` (`num`, `name`, `websiteUrl`, `showsCount`, `clicksCount`, `CTR`, `numer`) VALUES ( "+i+", '"+mysql_real_escape_string(tr.querySelector("td.left a").innerHTML)+"', '"+tr.querySelector(".left a").href+"', "+parseInt( tr.querySelectorAll("td")[2].innerHTML )+", "+parseInt( tr.querySelectorAll("td")[3].innerHTML )+", "+ tr.querySelectorAll("td")[4].innerHTML +", "+parseInt( tr.querySelectorAll("td")[0].innerHTML )+" ); ";
              }
            });
            //if (data.elem.length > 1) db.collection('advse').insert(data); 

            console.dir(`№ ${i}, STATUS: ${response.statusCode}, result: ${data.elem.length}, page: ${p}`);
          } 
          recursive(data.elem.length);
        }
        request.get(options,callback);

        function recursive(length) {
          p += 50;
        
          if (p < 3000 && length > 1 ) {
            setTimeout(run, 200, p, SQLquery);
          } else {
            clearTimeout(timeout);
            if (SQLquery.length > 1) ( _obj.SQLoperation(SQLquery) ) ? resolve(true) : reject(false);
            resolve(p);
          }
        }

      }, 200 );

    });
  }

  AdvseTable(file = '***') {
    return new Promise( (resolve,reject) => {
      let SQLquery = "";
      const result = fs.readFile(file, 'utf8', (err, contents) => {
        if (err) throw err;
        
        const dom = new JSDOM(contents);
        const table = dom.window.document.getElementById("tbody");
        const arrClass = table.querySelectorAll("tr");

        arrClass.forEach((tr,index)=>{
          if (tr != null && typeof tr !== "undefined") {
          const num = parseInt(tr.getAttribute("class").substring(1));
          const websiteName = mysql_real_escape_string(tr.querySelector("td.agency_title a.classic").innerHTML);
          const websiteUrl = mysql_real_escape_string(tr.querySelector("td.agency_title a.classic").href);
          tr.querySelectorAll("td.agency_title a.classic")[0].remove();
          tr.querySelectorAll("td.agency_title br")[0].remove();
          const name = mysql_real_escape_string(tr.querySelectorAll("td.agency_title")[0].innerHTML.trim());
          const companiesCount = parseInt(tr.querySelectorAll("td")[2].innerHTML);
          const showsCount = parseInt(tr.querySelectorAll("td")[3].innerHTML);
          const clicksCount = parseInt(tr.querySelectorAll("td")[4].innerHTML);
          const CTR = parseFloat(tr.querySelectorAll("td")[5].innerHTML);
          const rang = parseFloat(tr.querySelectorAll("td")[6].innerHTML);
          const clientsCount = parseInt(tr.querySelectorAll("td a.client_link")[0].innerHTML);
          SQLquery += "INSERT INTO `rating-Advse` (`num`,`websiteName`,`websiteUrl`,`name`,`companiesCount`,`showsCount`,`clicksCount`,`CTR`,`rang`,`clientsCount`) VALUES ( "+num+", '"+websiteName+"', '"+websiteUrl+"', '"+name+"', "+companiesCount+", "+showsCount+", "+clicksCount+", "+CTR+", "+rang+", "+clientsCount+" ); ";
          }
        });
        ( this.SQLoperation(result) ) ? resolve(true) : reject(false);
      });
      
      
    })
  }

  AdvseTablePage() {
    return new Promise( (resolve,reject) => {
      const url = '***';
  
      request.get(url, async (error, response, body) => {
        if(error) { 
          console.dir(error);
          reject(0);
        }
        let SQLquery = "";
        const dom = new JSDOM(body);
        const table = dom.window.document.querySelector("table.agencies_table tbody");
        const arrClass = table.querySelectorAll("tr");

        arrClass.forEach((tr,index)=>{
          if (tr != null && typeof tr !== "undefined") {
            if (tr.hasAttribute("class") && tr.querySelector("td.agency_title a.classic") != null ) {
              const num = parseInt(tr.getAttribute("class").substring(1));
              const websiteName = mysql_real_escape_string(tr.querySelector("td.agency_title a.classic").innerHTML);
              const websiteUrl = mysql_real_escape_string(tr.querySelector("td.agency_title a.classic").href);
              tr.querySelectorAll("td.agency_title a.classic")[0].remove();
              tr.querySelectorAll("td.agency_title br")[0].remove();
              const name = mysql_real_escape_string(tr.querySelectorAll("td.agency_title")[0].innerHTML.trim());
              const companiesCount = parseInt(tr.querySelectorAll("td")[2].innerHTML);
              const showsCount = parseInt(tr.querySelectorAll("td")[3].innerHTML);
              const clicksCount = parseInt(tr.querySelectorAll("td")[4].innerHTML);
              const CTR = parseFloat(tr.querySelectorAll("td")[5].innerHTML);
              const rang = parseFloat(tr.querySelectorAll("td")[6].innerHTML);
              const clientsCount = parseInt(tr.querySelectorAll("td a.client_link")[0].innerHTML);
              SQLquery += "INSERT INTO `rating-"+this.TableName+"` (`i`,`num`,`websiteName`,`websiteUrl`,`name`,`companiesCount`,`showsCount`,`clicksCount`,`CTR`,`rang`,`clientsCount`) VALUES ( "+(index)+", "+num+", '"+websiteName+"', '"+websiteUrl+"', '"+name+"', "+companiesCount+", "+showsCount+", "+clicksCount+", "+CTR+", "+rang+", "+clientsCount+" ); ";
            }
          }
        });
        console.dir(` STATUS: ${response.statusCode}, result: ${arrClass.length}`);
        ( this.SQLoperation(SQLquery) ) ? resolve(true) : reject(false);
        //SQLquery += "UPDATE `rating-Advse` INNER JOIN `"+partners+"` ON `rating-Advse`.name LIKE `"+partners+"`.displayName OR `rating-Advse`.websiteUrl LIKE `"+partners+"`.websiteUrl OR `rating-Advse`.websiteName LIKE `"+partners+"`.websiteUrl SET `rating-Advse`.id = `"+partners+"`.id WHERE `rating-Advse`.id IS NULL; ";
      });
      
    })
  }

  CombineTables(partners,advse,clients,mongo) {
    let SQLquery = "";
    SQLquery += "INSERT INTO `used` (`param`,`name`) VALUES ( 'partners', '"+partners+"' ); ";
    SQLquery += "INSERT INTO `used` (`param`,`name`) VALUES ( 'advse', '"+advse+"' ); ";
    SQLquery += "INSERT INTO `used` (`param`,`name`) VALUES ( 'clients', '"+clients+"' ); ";
    SQLquery += "INSERT INTO `used` (`param`,`name`) VALUES ( 'mongo', '"+mongo+"' ); ";

    SQLquery += "UPDATE `"+advse+"` INNER JOIN `"+partners+"` ON `"+partners+"`.websiteUrl LIKE concat('%',`"+advse+"`.websiteUrl,'%') OR `"+partners+"`.websiteUrl LIKE concat('%',`"+advse+"`.websiteName,'%') OR `"+partners+"`.displayName LIKE concat('%',`"+advse+"`.name,'%') SET `"+advse+"`.id = `"+partners+"`.id WHERE `"+advse+"`.id IS NULL; ";
  
    SQLquery += "SET FOREIGN_KEY_CHECKS=0; ";
    //SQLquery += "ALTER TABLE `"+advse+"` DROP INDEX `num`; ";
    SQLquery += "ALTER TABLE `"+clients+"` ADD INDEX (`num`); ";
    SQLquery += "ALTER TABLE `"+clients+"` ADD FOREIGN KEY (`num`) REFERENCES `"+advse+"`(`num`) ON DELETE NO ACTION ON UPDATE NO ACTION; ";

    //SQLquery += "ALTER TABLE `"+advse+"` DROP INDEX `num`; ";
    SQLquery += "ALTER TABLE `"+advse+"` ADD INDEX (`id`); ";
    SQLquery += "ALTER TABLE `"+advse+"` ADD FOREIGN KEY (`id`) REFERENCES `"+partners+"`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION; ";

    SQLquery += "ALTER TABLE `comments` ADD INDEX (`id`); ";
    SQLquery += "ALTER TABLE `comments` ADD FOREIGN KEY (`id`) REFERENCES `"+partners+"`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION; ";

    SQLquery += "SET FOREIGN_KEY_CHECKS=1; ";

    return ( this.SQLoperation(SQLquery) ) ? true : false;
  }

}
