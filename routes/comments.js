const express = require('express');
const methods = require('../static-methods.js');
//const cookieParser = require('cookie-parser');
//const url = require('url');
//const querystring = require('querystring');
const comment = require('./../models/comment.js');
const commentsRouter = express.Router();

commentsRouter.post('/post/', (req,res,next) => {
  req.accepts('application/json');

    let bodyData = '';
    req.on('data', (data) => {
      bodyData += data;
    });
    req.on('end', () => {
      //const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      //req.headers.Url = url.parse(fullUrl);
      //req.headers.query = querystring.parse(parsedUrl.query);
      //for(let i = 0,j=0; i < wit_sessions.length; i++){  }

      const body = JSON.parse(bodyData);
            
      if (body.type === "comment" && req.signedCookies.auth !== false) {
        const param = {
          id: body.id,
          star: body.star,
          name: body.name,
          text: body.text,
          ip: req.headers['x-real-ip'],
          device: req.headers['user-agent'],
          session: req.cookies.session,
          auth: req.signedCookies.auth
        }
        const validate = (
          param.id.length < 16 && !isNaN(param.id) &&
          !isNaN(param.star) &&
          param.name.length < 64 && isNaN(param.name) &&
          methods.validateIP(param.ip) &&
          methods.validateCookie(param.session) &&
          methods.validateCookie(param.auth)
        );
        if (validate) {
          methods.validateRecaptcha(req.headers.host,body.grecaptcha).then( (result) => {
            console.log(result);
            if ( result !== true ) return res.status(400).send( {recaptcha:result} );
          });
          comment.loadingSendComment(param).then( result => {
            res.status(200).send( {recaptcha:true,status:result} );
          });
        } else {
          console.log('Ошибка ввода');
          res.status(400).send('Ошибка ввода');
        }
      } else {
        console.log('Error');
        res.status(400).send('Error');
      }
    });

  });

  module.exports = commentsRouter;