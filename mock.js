var express = require('express');
var engine = require('ejs-locals');
var path = require('path');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var objStore = new Map();

function run(callback) {

    var mock = express();

    // view engine setup
    mock.set('views', path.join(__dirname, 'views'));
    mock.engine('ejs', engine);
    mock.set('view engine', 'ejs');

    // uncomment after placing your favicon in /public
    //mock.use(favicon(__dirname + '/public/favicon.ico'));
    mock.use(logger('dev'));
    mock.use(bodyParser.json());
    mock.use(bodyParser.urlencoded({ extended: false }));
    mock.use(cookieParser());
    mock.use(express.static(path.join(__dirname, 'public')));


    mock.use('/', routes);

    mock.use('/list', function(req, res) {
        var offset = req.query.offset || 0;
        var limit = req.query.limit || 50;
        res.render('lists', {title: 'List', val: objStore, offset: offset, limit: limit});
    });
    
    /* set key */
    mock.post('/store', function(req, res) {

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
    mock.get('/store', function(req, res) {
        
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
    mock.get('/search', function(req, res) {
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
    mock.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (mock.get('env') === 'development') {
        mock.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    mock.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });



    var server = mock.listen(6000, () => console.log(`Test server listening on port 6000`));
    
    if (callback) {
        callback();
    }   

    server.on('close', function () {
        console.log('closed');
    });

    return server;

} 


if (require.main === module) {
    run();
}

exports.run = run;