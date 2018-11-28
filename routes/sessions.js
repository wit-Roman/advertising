const express = require('express');
const sessionsRouter = express.Router();

sessionsRouter.use('/', (req,res,next) => {
        function initSession (active) {
            const randomNumber1 = Math.random().toString(36).substring(2, 15);
            const randomNumber2 = Math.random().toString(36).substring(2, 15);
            const user_period = 24*60*60*1000;
            res.cookie('session', randomNumber1, { expire: user_period, path:'/', secure: true, httpOnly: true });
            res.cookie('auth', randomNumber2, { signed: true, expire: user_period, path:'/', secure: true, httpOnly: true });
    
            if (active) {
                require('./../models/session.js').checkSessions(req.cookies.session,req.signedCookies.auth,req.headers['x-real-ip'],req.headers['user-agent']).then( result => {
                    if ( result !== -1 ) {
                        active = false;
                        comCount = 0;
                    } else { comCount = 5; }
                    createSession(req.cookies.session,randomNumber1,randomNumber2,active,comCount);
                })
            } else {
                createSession(session,randomNumber1,randomNumber2,active,comCount);
            }
        }      
        function createSession (session,randomNumber1,randomNumber2,active,comCount) {
            require('./../models/session.js').createSession({
                session:randomNumber1,
                auth:randomNumber2,
                ip: req.headers['x-real-ip'],
                device: req.headers['user-agent'],
                datetime: Date.now(),
                active: active,
                comCount: comCount
            });
        }
        
        if ( typeof req.signedCookies.auth === "undefined" || req.cookies.session === "undefined" ) {
            initSession(true);
        } else if(req.signedCookies.auth == false) {
            initSession(false);
        }

    next();
});


function controlSession(ip,response) {
  console.log(ip,response);                                     
  return new Promise( (resolve) => {
    const secretKey = "";
    request.get("https://www.google.com/recaptcha/api/siteverify?secret="+secretKey+"&response="+response+"&remoteip="+ip, (error, response, body)=>{
      console.log(body);
      const ans = JSON.parse(body);
      if (ans.success === true) {
        resolve(true);
      }  else {
        resolve(false);
      }
    });
  });
}

module.exports = sessionsRouter;