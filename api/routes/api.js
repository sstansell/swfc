var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var monk = require('monk');
var c = require('../config');
var config = c.config;
var f = require('../functions');


/* GET config info . */
router.get('/config', function(req, res) {
	var db = mongo.connect(config.db.connectionString, function(err,db){
		var conf = db.collection("config");

		conf.find({}).toArray(
				function(err,results){
					db.close();
					//update the global config variable
					config = results[0];
					res.json(config);
				});
	});
});


module.exports = router;