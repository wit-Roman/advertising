exports.mysql_real_escape_string = function (str) {
    if (typeof str === "string" ) {
      return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
          switch (char) {
              case "\0":
                  return "\\0";
              case "\x08":
                  return "\\b";
              case "\x09":
                  return "\\t";
              case "\x1a":
                  return "\\z";
              case "\n":
                  return "\\n";
              case "\r":
                  return "\\r";
              case "\"":
              case "'":
              case "\\":
              case "%":
                  return "\\"+char;
          }
      });
    } else {
      return 0;
    }
}
exports.validateEmail = function (email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
exports.validateIP = function (ipaddress) {
    const re = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return re.test(String(ipaddress).toLowerCase());
}
exports.validateCookie = function (string) {
    const re = /^[a-z0-9]+$/;
    return re.test(String(string).toLowerCase());
}
exports.SQLoperation = function (SQLquery) {
    return new Promise((resolve, reject) => {
        const mysql = require('mysql');
        const mysqlConn = mysql.createConnection({
            host: "localhost",
            user: "wit",
            password: "rerevfhbzdb",
            database : "adv"
        });
        mysqlConn.connect();
        mysqlConn.query(SQLquery, (error,rows) => {
            if (error) {
                reject(error);
                throw error;
            } 
            resolve(rows);
        });
    
        mysqlConn.end();
    })
}
exports.isEmptyObject = function (objectInput) {
    for ( name in objectInput) {
      return false;
    }
    return true;
 }
exports.validateRecaptcha = function (ip,key) {
    return new Promise( (resolve) => {
        const request = require('request');
        const secretKey = "6LfSsm0UAAAAAHxOjILZFi9IFMzHJCPy9D32e2Mu";
        request.get("https://www.google.com/recaptcha/api/siteverify?secret="+secretKey+"&response="+key+"&remoteip="+ip, (error,response,body)=>{
            const ans = JSON.parse(body);
            if (ans.success === true) {
                resolve(true);
            } else {
                resolve(ans);
            }
        })
    })
}