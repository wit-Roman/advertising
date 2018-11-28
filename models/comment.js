const mysql = require('mysql');
const session = require('./../models/session.js');
const methods = require('../static-methods.js');

class Comment {
    constructor() {
        this.SQLopen();
    }
    SQLoperation (SQLquery) {
        this.mysqlConn = mysql.createConnection({
            host: "",
            user: "",
            password: "",
            database : "",
            multipleStatements: true
        });
        this.mysqlConn.connect();
        this.mysqlConn.query(SQLquery, (error) => {
            if (error) throw error;
        });
        this.mysqlConn.end();
    }
    SQLopen() {
        let SQLquery="";
        SQLquery += "CREATE TABLE IF NOT EXISTS `comments` ( i INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, id BIGINT(11) NULL, star TINYINT UNSIGNED, name VARCHAR(64), text TEXT, ip VARCHAR(64), cookie_auth VARCHAR(64), datetime BIGINT ) ENGINE=InnoDB DEFAULT CHARSET=utf8; ";
        this.SQLoperation(SQLquery);
    }
    sendComment(param) {
        return new Promise( (resolve,reject) => {
            session.checkSessions(param.session,param.auth,param.ip,param.device,true).then(result => {
                if (result !== -1) {
                    if (result.active && result.comCount > 0) {
                        let SQLquery = "UPDATE `sessions` SET active=0,comCount="+(result.comCount - 1)+"  WHERE i="+result.i+"; ";
                        this.SQLoperation(SQLquery);
                        this.saveComment(param);
                        resolve(1);
                    } else if ( !result.active && result.comCount > 0 ) {
                        param.star = null;
                        let SQLquery = "UPDATE `sessions` SET active=0,comCount="+(result.comCount - 1)+"  WHERE i="+result.i+"; ";
                        this.SQLoperation(SQLquery);
                        this.saveComment(param);
                        resolve(2);
                    } else {
                        resolve(3);
                    }
                } else {
                    resolve('Сессия не определена');
                }
            }).catch(error => {
                console.dir(error);
                reject('Error');
            })
        })
    }
    saveComment(comment) {
        let SQLquery = "INSERT INTO `comments` (`id`,`star`,`name`,`text`,`ip`,`cookie_auth`,`datetime`) VALUES ( "+comment.id+", "+comment.star+", "+comment.name+", "+comment.text+", '"+comment.ip+"', '"+comment.auth+"', "+Date.now()+" ); ";
        this.SQLoperation(SQLquery);
    }
    getComment(id) {
        let SQLquery = "SELECT * FROM `comments` WHERE id="+id+"; ";
        methods.SQLoperation(SQLquery).then(result => {
            return result;
        }).catch(error => {
            console.dir(error);
        })
    }
}

const comment = new Comment();

exports.loadingSendComment = async function(param) {
    const filter = (param) => {
        //param.id = mysql.escapeId(param.id);
        param.name = mysql.escape( methods.mysql_real_escape_string(param.name) );
        param.text = mysql.escape( methods.mysql_real_escape_string(param.text) );
        param.device = mysql.escape( methods.mysql_real_escape_string(param.device) );
        return param;
    }

    param = filter(param);
    return await comment.sendComment(param);
}