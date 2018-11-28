//const mysql = require('mysql');
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
        MongoClient.connect('', { useNewUrlParser: true } ).then( connection => {
            this.mongodb = connection;
        }).catch(error => {
            console.log('ERROR:', error);
        });
    }
    getTable(param) {
        return new Promise( (resolve,reject) => {
            var SQLquery = "";
            if (!param.source) {
                SQLquery = "SELECT * FROM `"+this.table.partners+"` ORDER BY `num` ASC; ";
            } else {
                SQLquery = "SELECT `"+this.table.advse+"`.i AS num, `"+this.table.advse+"`.id, `"+this.table.advse+"`.name AS displayName, `"+this.table.advse+"`.websiteUrl, `"+this.table.partners+"`.displayImageUrl, `"+this.table.partners+"`.MonthlyBudget, `"+this.table.partners+"`.industries, `"+this.table.partners+"`.services FROM `"+this.table.advse+"`	LEFT JOIN `"+this.table.partners+"` ON `"+this.table.advse+"`.id = `"+this.table.partners+"`.id ORDER BY `"+this.table.advse+"`.i ASC; ";
            }
            methods.SQLoperation(SQLquery).then(result => {
                if ( result.length < 1 ) {
                    resolve( {status:404} );
                } else {
                    this.actual = Date.now();
                    result.forEach(elem=>{
                        if ( elem.hasOwnProperty('industries') && elem.industries !== null  ) {
                          elem.industries = elem.industries.split('","');
                        } else {
                          elem.industries = [];
                        }
                        if ( elem.hasOwnProperty('services') && elem.services !== null ) {
                          elem.services = elem.services.split('","');
                        } else {
                          elem.services = [];
                        }
                        if ( elem.hasOwnProperty('MonthlyBudget') && elem.MonthlyBudget !== null ) {
                          
                        } else {
                          elem.MonthlyBudget = 0;
                        }
                    });
                    const arr_source = (!param.source) ? 0 : 1; 
                    this.data.content[arr_source] = result;
                    this.data.content[arr_source].status = 200;
                    this.data.content[arr_source].date = this.table.partners.slice(-10);
                    resolve(this.data.content[arr_source]);
                }
            }).catch(error => {
                console.dir(error);
                reject(error);
                resolve({status:404});
            });
        })
    }
    async getDetail(param) {
            this.data.detail[param.id] = {};
            let SQLquery = "";
            var data1 = {};

            if (param.id < 1000) {
                data1.status = 200;
            } else {
                SQLquery = "";
                data1 = await this.db_operation(SQLquery,param.id);
                
                if ( data1.hasOwnProperty('industries') && data1.industries !== null  ) {
                    data1.industries = data1.industries.split('","');
                } else {
                    data1.industries = [];
                }
                if ( data1.hasOwnProperty('services') && data1.services !== null ) {
                    data1.services = data1.services.split('","');
                } else {
                    data1.services = [];
                }
                if ( data1.hasOwnProperty('MonthlyBudget') && data1.MonthlyBudget !== null ) {
                    
                } else {
                    data1.MonthlyBudget = 0;
                }
                
                if ( data1.status === 200 ) this.data.detail[param.id].partners = data1;
                if ( data1.status === 404 ) return {status:404};
            }
        
            if ( data1.status === 200 ) {
                SQLquery = "SELECT `i`,`id`,`num`,`name`,`websiteName`,`websiteUrl`,`clientsCount`,`companiesCount`,`showsCount`,`clicksCount`,`CTR`,`rang` FROM `"+this.table.advse+"` WHERE `"+this.table.advse+"`.id = "+param.id+"; ";
                let data2 = await this.db_operation(SQLquery);
                if ( data2.status === 200 ) this.data.detail[param.id].advse = data2;
                
                if ( data2.status === 200 ) {
                    SQLquery = "SELECT `name`,`websiteUrl`,`showsCount`,`clicksCount`,`CTR`,`numer` FROM `"+this.table.clients+"` WHERE `"+this.table.clients+"`.num = "+data2[0].num+" ORDER BY `"+this.table.clients+"`.numer ASC; ";
                    let data0 = await this.db_operation(SQLquery);
                    if ( data0.status === 200 ) this.data.detail[param.id].clients = data0;
                }
            }          

            if ( data1.status === 200 ) {
                SQLquery = "SELECT `star`,`name`,`text`,`datetime` FROM `comments` WHERE `id` = "+param.id;
                let data3 = await this.db_operation(SQLquery);
                if ( data3.status === 200 ) this.data.detail[param.id].comments = data3;
            }
     
            if ( data1.status === 200 ) {
                SQLquery = "SELECT `active`,`comCount` FROM `sessions` WHERE `auth` = '"+param.auth+"' LIMIT 1; ";
                let data4 = await this.db_operation(SQLquery);
                if ( data4.status === 200 ) this.data.detail[param.id].session = data4[0];
            }

            if ( data1.status === 200 ) {
                this.data.detail[param.id].status = 200;
                return this.data.detail[param.id];
            } else {
                return {status:404};
            }
    }
    async getSearch(param) {
        let SQLquery = "SELECT * FROM ( SELECT `id`,`num`,`displayName`,`websiteUrl` FROM `"+this.table.partners+"` WHERE `displayName` LIKE '%"+param.query+"%' OR `websiteUrl` LIKE '%"+param.query+"%' UNION SELECT `id`,`num`,`name` AS `displayName`,`websiteUrl` FROM `"+this.table.advse+"` WHERE `name` LIKE '%"+param.query+"%' OR `websiteUrl` LIKE '%"+param.query+"%' ) T1 GROUP BY COALESCE(`id`,`displayName`) LIMIT 0,10; ";
        let data =  await this.db_operation(SQLquery);
        return data;
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
            } else if ( typeof id === "number" ) {
                this.mongodb.db("admin").collection(this.table.mongo).findOne( {id:id.toString()}, (err, result) => {
                    if (err) throw err;
                    if ( result == null || typeof result !== "object" ) {
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
    const arr_source = (!param.source) ? 0 : 1;
    if ( ViewerCache.actual
        && typeof ViewerCache.data.content[arr_source] === "object"
        && param.refresh ) {
        console.log('main:cache');
        return ViewerCache.data.content[arr_source];
    } else {
        console.log('main:sql');
        return await ViewerCache.getTable(param);
    }
}

exports.loadingViewerDetail = async function(param) {
    return await ViewerCache.getDetail(param);
}

exports.loadingViewerSearch = async function(param) {
    return await ViewerCache.getSearch(param);
}