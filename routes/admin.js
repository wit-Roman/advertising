const express = require('express');
const adminRouter = express.Router();

adminRouter.post('/', (req,res,next) => {
    let bodyData = '';
    req.on('data', (data) => {
      bodyData += data;
    });
    req.on('end', () => {
      const body = JSON.parse(bodyData);
  
      const parseConstructor = (valid,funcName,funcParam) => {
        if (valid) {
          return res.status(400).send('Undefeated comand');
        } else {
          require('./../models/parseFunc')[funcName](funcParam).then(ready => {
            if (ready) {
              console.dir(ready);
              res.status(201).send(funcName+' completed');
            } else {
              return res.status(400).send('Unsuccess');
            }
          }).catch(error => {
            console.dir(error);
            return res.status(400).send('Unsuccess');
          });
        }
      }
      let valid = false;
      let funcParam = [];
      switch (body.cmd) {
        case "LoadPartners":
          valid =  ( !("options" in body) || !(typeof body.options.stance === "object") || !(typeof body.options.address === "string") );
          funcParam = [body.options.stance[0],body.options.stance[1],body.options.address];
          parseConstructor( valid,"LoadPartners",funcParam );
          break;
        case "LoadAdvse":
          console.log("LoadAdvse");
          valid =  ( !("options" in body) || !(typeof body.options.stance === "object") );
          funcParam = [body.options.stance[0],body.options.stance[1]];
          parseConstructor( valid,"loadingAdvse",funcParam );
          break;
        case "LoadFileToBase":
          valid =  ( !("options" in body) || !(typeof body.options.fileName === "string") );
          funcParam = [body.options.fileName];
          parseConstructor( valid,"loadingAdvseTable",funcParam );
          break;
        case "LoadPageToBase":
          valid =  ( !("options" in body) );
          funcParam = [];
          parseConstructor( valid,"loadingAdvsePage",funcParam );
          break;
        case "Combine":
          valid =  ( !("options" in body) );
          funcParam = [body.options.partners,body.options.advse,body.options.clients,body.options.mongo];
          parseConstructor( valid,"loadingCombine",funcParam );
          break;
        default:
          return res.status(400).send('Undefeated comand');
      }
    });
 
});

module.exports = adminRouter;