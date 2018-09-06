const express = require('express');
const methods = require('../static-methods.js');
//const url = require('url');
//const querystring = require('querystring');
const viewer = require('./../models/viewer.js');
const ReactDOMServer = require('react-dom/server');
const viewerRouter = express.Router();

//viewerRouter.get('/favicon.ico', (req, res) => res.status(204));

viewerRouter.get('/', (req,res) => {
    console.dir(req.params);
    const param = {
        refresh : (req.query.hasOwnProperty('refresh')) ? false : true,
        pagination: ( req.query.hasOwnProperty('p') && (typeof req.query.p == "string") && !isNaN(req.query.p) ) ? parseInt(req.query.p) : 0,
    }
    viewer.loadingViewer(param).then( result => {
        res.status(result.status).render('HTML', {data:result,component:"List"} );
    }).catch(error => {
        console.dir(error);
        res.status(404).send("Not Found");
    })
    //const html = ReactDOMServer.renderToString("<div>Hello World</div>");    res.send(html);
});

viewerRouter.get('/:id/', (req,res) => {
    console.dir(req.params);
        const param = {
            id: ( req.params.hasOwnProperty('id') && !isNaN(req.params.id) ) ? parseInt(req.params.id) : 0,
            auth: req.signedCookies.auth
        }
        viewer.loadingViewerDetail(param).then( result => {
            console.log(result.session);
            res.status(result.status).render('HTML', {data:result,component:(result.status==200)?"Detail":"NotFound",id:req.params.id} );
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
            const param = {
                query: body.query
            }
            const validate = ( param.query.length < 64 );
        }
    });
});    

module.exports = viewerRouter;

/*
viewerRouter.get('/:id', (req,res,next) => {
    console.dir(req.params.id);
    const param = {
        refresh : (req.query.hasOwnProperty('refresh')) ? false : true,
        pagination: ( req.query.hasOwnProperty('p') && !isNaN(req.query.p) ) ? parseInt(req.query.p) : 0,
        id: ( req.params.hasOwnProperty('id') && !isNaN(req.params.id) ) ? parseInt(req.params.id) : 0,
        viewerFunc: ( req.params.id ) ? "loadingViewerDetail" : "loadingViewer",
    };

    viewer[param.viewerFunc](param).then( result => {
        res.status(result.status).send(result);
    }).catch(error => {
        console.dir(error);
        res.status(404).send("Not Found");
    });

});*/