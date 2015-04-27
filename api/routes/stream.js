var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var monk = require('monk');
var c = require('../config');
var config = c.config;
var f = require('../functions');


/* get the generic page to stream data */
router.get('/', function(req,res){

})


module.exports = router;