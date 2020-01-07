const express = require('express');
const app = express();
const expressSession = require('express-session');
const index = require('./src/index');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');

// app.use(express.static(_dirname + '/public'));
// console.log('Listening on 8080');
// app.listen(8080)
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressSession({
    secret: 'secret'
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src'));

app.use('/', index);

module.exports = app;