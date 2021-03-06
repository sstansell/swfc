
// mongoose setup
//require( './db' );

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



var exphbs = require('express-handlebars');

var routes = require('./routes/index');
var reports = require('./routes/report');
var api = require('./routes/api');
var users = require('./routes/users');

var compress = require('compression');


var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cookieParser());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs(
                            {
                                defaultLayout: 'main',
                                helpers:{
                                    debug: function(optionalValue) {
                                              console.log("Current Context");
                                              console.log("====================");
                                              console.log(this);
                                             
                                              if (optionalValue) {
                                                console.log("Value");
                                                console.log("====================");
                                                console.log(optionalValue);
                                              }
                                            },
                                    formatDate: function(date){
                                            if (typeof(date) == "undefined") {
                                              return "Unknown";
                                            }
                                            if(typeof(date)!="date"){
                                              date = new Date(date);
                                            }
                                            var month = date.getMonth() + 1;
                                            return month + "/" + date.getDate() + "/" + date.getFullYear();
                                    },
                                    calculatePercentage: function(count,totalCount){
                                            if (typeof(count) == "undefined"||typeof(totalCount)=="undefined") {
                                              return "Unknown";
                                            }
                                            var percentage = (count/totalCount) * 100;
                                            return percentage.toFixed(2);
                                    },
                                    formatSkill: function(skillText){
                                            var ret = skillText;
                                            if (typeof(skillText) == "undefined") {
                                              return "Unknown";
                                            }
                                            if(skillText.indexOf("(")> -1){
                                              ret = skillText.substring(0,skillText.indexOf("(")-1);
                                            }
                                            
                                            
                                            return ret;
                                    },
                                    adjustRarity: function(rarity){
                                            var ret = rarity;
                                            if (typeof(rarity) == "undefined") {
                                              return "Unknown";
                                            }
                                            ret = parseInt(rarity,10) + 1;
                                            
                                            
                                            return ret;
                                    }
                                }
                            }
                        )
            );
app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(compress());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/reports', reports);
app.use('/api', api);
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



module.exports = app;


var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})
