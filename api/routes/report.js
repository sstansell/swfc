var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var monk = require('monk');
var moment = require('moment');
var c = require('../config');
var config = c.config;
var f = require('../functions');


/* GET card totals page. */
router.get('/cards', function(req, res) {
	var from = req.query.fromDate;
	var to = req.query.toDate;

	console.log("From: " + from);
	console.log("To: " + to);
	
	var startDate = new Date(2015,03,01);
	var endDate = new Date(2015,11,31);
	var cards = [];

	var db = mongo.connect(config.db.connectionString, function(err,db){
		if(err!==null&&err!=undefined){
			console.log(err.toString());
			res.send(err.toString());
		}else{
			var cardPulls = db.collection("CardPulls");



			var map = function(){
				emit({name: this.name, cardId: this.card_id, thumb: this.thumb}, 1);
			}
			var reduce = function(name, count){
				return Array.sum(count);
			}

			cardPulls.mapReduce(
				map,
				reduce,
				{
					query: {insertTime:{$gte: config.startDate}},
					//query: {},
					out: {inline:1}
				},
				function(err,results){
					db.close();
					if(err!==null&&err!=undefined){
						console.log(err.toString());
						res.send(err.toString());
					}else{
					//console.log(results);

						results.sort(f.functions.sort_by('value', false, parseInt));
						var total = f.functions.getTotal(results);
						results.forEach(function(element,index,array){
							/*getCardInfo(element.card_id, function(){

							});*/
							element.rarity = f.functions.calculateRarity(element.value, total);
							cards.push({
								cardId: element._id['cardId'],
								name: element._id['name'],
								thumb: element._id['thumb'],
								count: element.value,
								rarity: element.rarity
							});

						});						
						res.render('cardTotals', {"title":"Card Totals", "results":results, "error":err, "total": total, "cards":cards})
					}
				}
			);			
		}

	});
});

/* GET card history page. */
router.get('/cardHistory/:cardId', function(req, res) {
	var db = mongo.connect(config.db.connectionString, function(err,db){
		var data = {};
		data.card = {};
		data.days = [];

		var cardPulls = db.collection("CardPulls");
		var cardId = req.params.cardId;

		map = function() {
		  id = this._id;
		  ts = id.getTimestamp();  
		    
		  day = Date.UTC(ts.getFullYear(), ts.getMonth(), ts.getDate());

		  emit({day: day, card_id: this.card_id}, {count: 1});
		}
		reduce = function(key, values) {
		  var count = 0;

		  values.forEach(function(v) {
		    count += v['count'];
		  });

		  return {count: count};
		}

		cardPulls.mapReduce(
			map,
			reduce,
			{
				query: {card_id:cardId, insertTime:{$gte: config.startDate}},
				out: {inline:1}
			},
			function(err,results){
				//get the totals per day
				//var totals = getTotalCardPulls();


				db.close();
				//add info to the results
				//var total = getTotal(results);
				data.card.id = cardId;
				var monkDb = monk(config.db.server + '/SWFC');
				var cardInfo = f.functions.getCardInfo(cardId, monkDb, function(card,err){
					if(err.length ==0){ 
					
						data.card = card;
						data.card.id = cardId;
					}

					var total = 0;
					results.forEach(function(element,index,array){
						if(element._id['card_id']==data.card.id){
							total = total + element.value['count'];
							var prettyDate = moment(element._id['day']);
							data.days.push({
												date: prettyDate.format("MM/DD/YYYY"),
												rawDate: element._id['day'],
												count: element.value['count']
											}
							);						
						}
					data.total = total;		

					});

					res.render('cardHistory', {"title":"Card History", "data":data, "error":err})					
				})

			}
		);
	});
});

/* GET Cards page. */
router.get('/cardList', function(req, res) {
	var db = mongo.connect(config.db.connectionString, function(err,db){
		var cards = db.collection("cards");

		cards.find({}).sort({rarity:-1, name:1}).toArray(
				function(err,results){
					db.close();
					res.render('cards', {"title":"Cards", "cards":results, "error":err});
				});
	});
});

/* GET hourly totals page. */
router.get('/hours', function(req, res) {
	var db = mongo.connect(config.db.connectionString, function(err,db){
		var cardPulls = db.collection("CardPulls");

		var map = function(){
			var stamp = this._id.getTimestamp();
			var hours = stamp.getHours();
			if(hours < "10"){
				hours = "0" + hours;
			}
			hours = hours + ":00";
			var dateString = stamp.getMonth() + '/' + stamp.getDate() + " " + hours;

			emit(dateString, 1);
		}
		var reduce = function(name, count){
			return Array.sum(count);
		}

		cardPulls.mapReduce(
			map,
			reduce,
			{
				query: {insertTime:{$gte: config.startDate}},
				out: {inline:1}
			},
			function(err,results){
				db.close();
				results.sort(f.functions.sort_by('_id', false, parseInt));
				var total = f.functions.getTotal(results);
				res.render('hours', {"title":"Hourly Totals", "results":results, "error":err, "total": total})
			}
		);
	});
});


/* GET pack totals page. */
router.get('/packs', function(req, res) {
	var db = mongo.connect(config.db.connectionString, function(err,db){
		var cardPulls = db.collection("CardPulls");

		var map = function(){
			emit(this.pack, 1);
		}
		var reduce = function(name, count){
			return Array.sum(count);
		}

		cardPulls.mapReduce(
			map,
			reduce,
			{
				//query: {insertTime:{$gte: new Date(2014,10,20)}},
				query: {insertTime:{$gte: config.startDate}},
				out: {inline:1}
			},
			function(err,results){
				db.close();
				results.sort(f.functions.sort_by('value', false, parseInt));
				var total = f.functions.getTotal(results);
				res.render('packTotals', {"title":"Pack Totals", "results":results, "error":err, "total": total})
			}
		);
	});
});

/* GET Skills page. */
router.get('/skills', function(req, res) {
	var db = mongo.connect(config.db.connectionString, function(err,db){
		var skills = db.collection("skills");

		var map = function(){
			emit(this.pack, 1);
		}
		var reduce = function(name, count){
			return Array.sum(count);
		}
		skills.find({}).sort({type:1, effect_type:1, name:1, priority:1}).toArray(
				function(err,results){
					db.close();
					res.render('skills', {"title":"Skills", "skills":results, "error":err});
				});
	});
});


module.exports = router;