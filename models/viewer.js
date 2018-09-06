const mysql = require('mysql');
const MongoClient = require('mongodb').MongoClient;
const methods = require('../static-methods.js');

class Viewer {
    constructor(){
        this.actual = 0;
        this.data = {
            content: [],
            detail: {}
        }
        this.table = {}
        this.usedTables();
    }
    usedTables() {
        let SQLquery = "SELECT * FROM `used`; ";
        methods.SQLoperation(SQLquery).then(result => {
             result.forEach(element => {
                if (element.param === "partners") this.table.partners = element.name;
                if (element.param === "advse") this.table.advse = element.name;
                if (element.param === "clients") this.table.clients = element.name;
                if (element.param === "mongo") this.table.mongo = element.name;
            })
        })
        this.mongodb = {};
        MongoClient.connect('mongodb://dbRoman:***@localhost:27017/admin', { useNewUrlParser: true } ).then( connection => {
            this.mongodb = connection;
        }).catch(error => {
            console.log('ERROR:', error);
        });
    }
    getTable(param) {
        return new Promise( (resolve,reject) => {
             
            let SQLquery = "SELECT * FROM `"+this.table.partners+"` ORDER BY `num` ASC LIMIT "+param.pagination*50+",50; ";
                
            methods.SQLoperation(SQLquery).then(result => {
                if ( result.length < 1 ) {
                    resolve( {status:404} );
                } else {
                    this.actual = Date.now();
                    this.data.content[param.pagination] = result;
                    this.data.content[param.pagination].status = 200;
                    resolve(this.data.content[param.pagination]);
                }
            }).catch(error => {
                console.dir(error);
                resolve({status:404});
                reject(error);
            });
          
        });
    }
    async getDetail(param) {
            console.log("getDetail");
            this.data.detail[param.id] = {};
            let SQLquery = "";
            /*
            SELECT * FROM `rating-AdvseTablePage-0-20-8-2018` RIGHT JOIN `clients-Advse-0-17-8-2018` ON `rating-AdvseTablePage-0-20-8-2018`.num = `clients-Advse-0-17-8-2018`.num WHERE `rating-AdvseTablePage-0-20-8-2018`.id = 8742528519 ORDER BY `clients-Advse-0-17-8-2018`.showsCount DESC
            SELECT * FROM `comments` WHERE `id` = */
            /*SELECT * FROM `rang-Partners-Russia-23-8-2018` 
                INNER JOIN `rating-AdvseTablePage-0-20-8-2018` ON `rang-Partners-Russia-23-8-2018`.id = `rating-AdvseTablePage-0-20-8-2018`.`id` 
                RIGHT JOIN `clients-Advse-0-17-8-2018` ON `rating-AdvseTablePage-0-20-8-2018`.num = `clients-Advse-0-17-8-2018`.num
                LEFT JOIN `comments` ON `rang-Partners-Russia-23-8-2018`.id = `comments`.id
            WHERE `rang-Partners-Russia-23-8-2018`.id = 8742528519
            ORDER BY `clients-Advse-0-17-8-2018`.numer ASC*/

            SQLquery = "SELECT * FROM `"+this.table.partners+"` LEFT JOIN `"+this.table.advse+"` ON `"+this.table.partners+"`.id = `"+this.table.advse+"`.id WHERE `"+this.table.partners+"`.id = "+param.id;
            
            let data1 = await this.db_operation(SQLquery);

            if ( data1.status === 404 ) {
                return {status:404};
            } 
            if ( data1.status === 200 ) {
                SQLquery = "SELECT * FROM `"+this.table.advse+"` RIGHT JOIN `"+this.table.clients+"` ON `"+this.table.advse+"`.num = `"+this.table.clients+"`.num WHERE `"+this.table.advse+"`.id = "+param.id+" ORDER BY `"+this.table.clients+"`.num ASC; ";
                let data2 = await this.db_operation(SQLquery);
                if ( data2.status === 200 ) this.data.detail[param.id].advse = data2;
            }
            if ( data1.status === 200 ) {
                SQLquery = "SELECT * FROM `comments` WHERE `id` = "+param.id;
                let data3 = await this.db_operation(SQLquery);
                if ( data3.status === 200 ) this.data.detail[param.id].comments = data3;
            }

            var session = {};
            if ( data1.status === 200 ) {
                SQLquery = "SELECT `active`,`comCount` FROM `sessions` WHERE `auth` = '"+param.auth+"' LIMIT 1; ";
                let data4 = await this.db_operation(SQLquery);
                if ( data4.status === 200 ) session = {session:data4[0]};
            }

            if ( data1.status === 200 ) {
                SQLquery = "";
                let data5 = await this.db_operation(SQLquery,param.id);
                if ( data5.status === 200 ) this.data.detail[param.id].partners = data5;
            }

            if ( data1.status === 200 ) {
                this.data.detail[param.id].main = data1;
                this.data.detail[param.id].status = 200;
                
                return Object.assign( this.data.detail[param.id], session ) ;
            }
            //this.mongodb
        
    }
    db_operation(SQLquery,id=0) {
        return new Promise( (resolve,reject) => {
            if ( SQLquery.length > 1 ) {
                methods.SQLoperation(SQLquery).then(result => {
                    if ( result.length < 1 ) {
                        resolve( {status:404} );
                    } else {
                        result.status = 200;
                        resolve( result );
                    }
                }).catch(error => {
                    console.dir(error);
                    resolve({status:404});
                    reject(error);
                });
            } else if ( id ) {
                this.mongodb.db("admin").collection(this.table.mongo).findOne( {id:id.toString()}, (err, result) => {
                    if (err) throw err;
                    if ( result.length < 1 ) {
                        resolve( {status:404} );
                    } else {
                        result.status = 200;
                        resolve( result );
                    }
                });
            }
        });
    }
}

var ViewerCache = new Viewer();

exports.loadingViewer = async function(param) {
    if ( ViewerCache.actual
        && typeof ViewerCache.data.content[param.pagination] === "object"
        && param.refresh ) {
        console.log('main:cache');
        return ViewerCache.data.content[param.pagination];
    } else {
        //ViewerCache = new Viewer();
        console.log('main:sql');
        return await ViewerCache.getTable(param);
    }
}

exports.loadingViewerDetail = async function(param) {
    if ( ViewerCache.actual && typeof ViewerCache.data.detail[param.id] === "object" ) {
        console.log('detail:cache');
        return ViewerCache.data.detail[param.id];
    } else {
        console.log('detail:sql');
        return await ViewerCache.getDetail(param);
    }
}