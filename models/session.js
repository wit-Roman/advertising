const methods = require('../static-methods.js');

const user_period = 24*60*60*1000;
var wit_sessions = {};

var start = 1;
if(start) {
    start = 0;
    let SQLquery = "CREATE TABLE IF NOT EXISTS `sessions` ( i INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, session VARCHAR(64), auth VARCHAR(64), ip VARCHAR(64), device VARCHAR(256), datetime BIGINT, active BOOLEAN DEFAULT 0, comCount SMALLINT ) ENGINE=InnoDB DEFAULT CHARSET=utf8; ";
    methods.SQLoperation(SQLquery);
    //SQLquery = "INSERT INTO `sessions` (`session`,`auth`,`ip`,`device`,`datetime`,`active`) VALUES ('bbb','aaa','0.0.0.0','string',1232133123,1); ";
}

exports.createSession = function(param) {
    const ip = (methods.validateIP(param.ip))?param.ip:'badIP';
    const device = methods.mysql_real_escape_string(param.device);
    const SQLquery = "INSERT INTO `sessions` (`session`,`auth`,`ip`,`device`,`datetime`,`active`, `comCount`) VALUES ('"+param.session+"','"+param.auth+"','"+ip+"','"+device+"',"+param.datetime+","+param.active+","+param.comCount+"); ";
    methods.SQLoperation(SQLquery);
}
exports.checkSessions = async function(session,auth,ip,device,deepCheck=false) {
    var find = -1;
    if (deepCheck) { wit_sessions = {}; }
    if ( typeof wit_sessions[0] !== "undefined" ) {
        if ( wit_sessions[0].hasOwnProperty('auth') ) {
            find = findCoincide();
        }
    }
    if (find === -1) {
        const SQLquery = "SELECT * FROM `sessions`; ";
        wit_sessions = await methods.SQLoperation(SQLquery);
        if ( typeof wit_sessions[0] !== "undefined" ) {
            find = findCoincide();
        }
    }
    function findCoincide () {
        return wit_sessions.findIndex((elem)=>{
            return ( (elem.auth === auth)
            || (elem.ip === ip && elem.datetime - Date.now() < user_period/24 )
            || (elem.ip === ip && elem.device === device) );
        });
    }
    return (find === -1)? find : wit_sessions[find];
}

const sessionCleaner = setInterval(function(){
    if ( typeof wit_sessions[0] !== "undefined" ) {
        if ( typeof wit_sessions[0].datetime === "number" ) {
            if ( Date.now() - wit_sessions[0].datetime > user_period ) {
                SQLquery = "DELETE FROM `sessions` WHERE datetime < "+(Date.now()-user_period)+"; ";
                methods.SQLoperation(SQLquery);
            }
        }
    }
    console.log('session-cleaner');
 }, user_period/96);