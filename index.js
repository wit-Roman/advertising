const express = require('express');
const morgan = require('morgan');
//const bodyParser = require('body-parser');
//app.use(bodyParser.json());
const errorhandler = require('errorhandler');
//const session = require('express-session');
const cookieParser = require('cookie-parser');
//const MongoClient = require('mongodb').MongoClient;

const app = express();
app.disable('x-powered-by');

app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

app.use(express.static(__dirname + '/public'));

app.use( function(req, res, next) {
  if (req.originalUrl && req.originalUrl.split("/").pop() === 'favicon.ico') return res.sendStatus(204);
  next();
});

app.use(morgan('dev'));
app.use(errorhandler());
app.use(cookieParser("parsersecret"));
//app.use(session({secret: "sessionsecret"}));
app.use('/', require('./routes/sessions.js') );
app.use('/', require('./routes/viewer.js') );
app.use('/admin', require('./routes/admin.js') );
app.use('/comment', require('./routes/comments.js') );

/*app.use((err, req, res, next) => {
  res.status(err.status).send(err.message);
  next();
});*/

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`App started on port ${PORT}`);
});