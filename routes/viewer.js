const express = require('express');
const methods = require('../static-methods.js');
const viewer = require('./../models/viewer.js');
const viewerRouter = express.Router();

viewerRouter.get('/', (req,res) => {
    if ( req.query.hasOwnProperty('p') && ( parseInt(req.query.p) < 0 || req.query.p.length > 2 ) ) 
        return res.status(404).send("Not Found");

    const param = {
        refresh: (req.query.hasOwnProperty('refresh')) ? false : true,
        source: (req.query.hasOwnProperty('yand')) ? true : false
    }
    viewer.loadingViewer(param).then( result => {
        console.log(result.status,result.date);
        res.status(result.status).render('HTML', {
            data: result,
            component: (result.status==200)?"List":"NotFound",
            date: result.date,
            param: (param.source)?'yand':''
        })
    }).catch(error => {
        console.dir(error);
        res.status(404).send("Not Found");
    })
});

viewerRouter.get('/:id/', (req,res) => {
    const isAjax = (req.headers['x-requested-with'] === 'xmlhttprequest');
    if (isAjax) req.accepts('application/json');
    
    if ( req.params.hasOwnProperty('id') && (req.params.id.length > 16 || isNaN(req.params.id)) ) 
        return res.status(404).send("Not Found");

    const param = {
        id: parseInt(req.params.id),
        auth: req.signedCookies.auth
    }
    viewer.loadingViewerDetail(param).then( result => {
        if ( isAjax ) {
            res.status(result.status).send({
                data: result,
                component: (result.status==200)?"Detail":"NotFound",
                id:param.id
            });
        } else {
            res.status(result.status).render('HTML', {
                data: result,
                component: (result.status==200)?"Detail":"NotFound",
                id:param.id
            })
        }
    }).catch(error => {
        console.dir(error);
        res.status(404).send("Not Found");
    })
});

viewerRouter.post('/search/', (req,res,next) => {
    req.accepts('application/json');

    let bodyData = '';
    req.on('data', (data) => {
        bodyData += data;
    });
    req.on('end', () => {
        const body = JSON.parse(bodyData);
        if (body.type === "search" && req.signedCookies.auth !== false) {
            const validate = ( body.options.query.length > 1 && body.options.query.length < 16 && typeof body.options.query === "string" );
            if (!validate) return res.status(400).send("Ошибка ввода");
            
            const param = {
                query: methods.mysql_real_escape_string(body.options.query)
            }
            
            viewer.loadingViewerSearch(param).then( result => {
                res.status(result.status).send({ data: result })
            }).catch(error => {
                console.dir(error);
                res.status(404).send("Not Found");
            })
        }
    });
});    

module.exports = viewerRouter;