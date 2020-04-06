var express = require('express');
var engine = require('ejs-locals');
var path = require('path');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

//for later use.
var config = require('./config');
const objStore = require('./util/objstore');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);

app.use('/list', function(req, res) {
    var offset = req.query.offset || 0;
    var limit = req.query.limit || 50;
    res.render('lists', {title: 'List', val: objStore, offset: offset, limit: limit});
});
  
/* set key */
app.post('/store', function(req, res) {

    if (req.body && req.body.key && req.body.value) {
        var key = req.body.key;
        var value = req.body.value;
        objStore.set(key, value);
        return res.status(201).send("Created");
    }

    else {
        return res.status(400).send("Invalid key value pair");
    }

});

/* GET key-values listing. */
app.get('/store', function(req, res) {
    
    var offset = req.query.offset || 0;
    var limit = req.query.limit || 50;
    let result = {};
    let count = 0;
    for (const [key, value] of objStore.entries()) {
        if (count >= limit) {
            return res.json(result);
        }
        result[key] = value;
        count++;
    }
    return res.json(result);
});

/* search by ID */
app.get('/search', function(req, res) {
    let id = req.query.searchtext;
    let results = {};
    for (const [key, value] of objStore.entries()) {
        if (key === id)
            results[key] = value;
    }
    if (results.hasOwnProperty(id)) {
        res.status(200).render('results', {title: 'Results', data: results});
    }
    else {
        res.status(404).render('results', {title: 'Results', data: results})
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


app.listen(3000, () => console.log(`Server listening on port 3000`));

module.exports = app;
