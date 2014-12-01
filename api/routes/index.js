var express = require('express');
var router = express.Router();
var uncompress = require('compress-buffer').uncompress;
var cheerio = require('cheerio');
var fs = require('fs');
var mongo = require('mongodb');
var monk = require('monk');
var moment = require('moment');

var dbServer = '10.0.0.15:27017';
var connectionString = 'mongodb://' + dbServer + '/SWFC';
var phpSessId = "PBR4H7GG7E68R8NNRGJF78LM";
var userName = "Ragamuffin";
var host = "amw.konaminet.jp";
var pathPostFix = "&opensocial_viewer_id=588957978&sub_ln=en_US&a=home%2Fhome&t=5970"
	var headers = {
			'Connection': 'keep-alive',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		    'User-Agent':       'Mozilla/5.0 (Linux; Android 4.4.2; ' + userName + ' Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36',
		    'Accept-Encoding': 'gzip,deflate',
		    'Accept-Language': 'en-US',
		    'X-Requested-With': 'jp.konami.swfc'
	    }

var config = {}
config.startDate = new Date(2014,10,20);

/*-----------------
TODO:
check for duplicates


-------------------*/

/* GET cardPulls page. */
router.get('/cardPulls', function(req, res) {
	var request = require('request');
		phpSessId = req.query.phpId;
		userName = req.query.user;

	// Set the headers

	    
		var pathPrefix ="/amw/naboo/gacha/gacha/list?PHPSESSID="
		
		
		var path = pathPrefix + phpSessId + pathPostFix;
	// Configure the request
		var options = {
			    host: host,
			    method: 'GET',
			    headers: headers,
			    path: path
		   	}

		getGzipped(options, function(err, data) {
			console.log(options.path);
			//console.log(response.headers);
		   //console.log(data);
		   if(err !== null){
		   		console.log(err);
		   }
		   
		   res.send(data);
		   parseCardList(data, function(cards){
		   		//write cards to db...
				var cardLength = cards.length;
				for (var i = 0; i < cardLength; i++) {
				    
				    writeCardToDB(cards[i],"CardPulls",true);
				}
		   });
		})


});

/* GET card binder page. */
router.get('/cardBinder', function(req, res) {
	var request = require('request');

	// Set the headers

	    
		var pathPrefix ="/amw/naboo/card/card/list?PHPSESSID="
		
		
		var path = pathPrefix + phpSessId + pathPostFix;
	// Configure the request
	var options = {
		    host: host,
		    method: 'GET',
		    headers: headers,
		    path: path
	   	}

		getGzipped(options, function(err, data) {
			console.log(options.path);
			//console.log(response.headers);
		   //console.log(data);
		   if(err !== null){
		   		console.log(err);
		   }
		   
		   
		   res.send(data);
		   parseCardList(data, function(cards){
				var cardLength = cards.length;
				for (var i = 0; i < cardLength; i++) {
				    writeCardToDB(cards[i],"cards");
				}		   		
		   });
		})


});

/* GET card totals page. */
router.get('/total/cards', function(req, res) {
	var from = req.query.fromDate;
	var to = req.query.toDate;

	console.log("From: " + from);
	console.log("To: " + to);
	
	var startDate = new Date(2014,10,20);
	var endDate = new Date(2015,0,1);
	var cards = [];

	var db = mongo.connect(connectionString, function(err,db){
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

						results.sort(sort_by('value', false, parseInt));
						var total = getTotal(results);
						results.forEach(function(element,index,array){
							/*getCardInfo(element.card_id, function(){

							});*/
							element.rarity = calculateRarity(element.value, total);
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


/* GET pack totals page. */
router.get('/total/packs', function(req, res) {
	var db = mongo.connect(connectionString, function(err,db){
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
				results.sort(sort_by('value', false, parseInt));
				var total = getTotal(results);
				res.render('cardTotals', {"title":"Pack Totals", "results":results, "error":err, "total": total})
			}
		);
	});
});


/* GET hourly totals page. */
router.get('/total/hours', function(req, res) {
	var db = mongo.connect(connectionString, function(err,db){
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
				results.sort(sort_by('_id', false, parseInt));
				var total = getTotal(results);
				res.render('hours', {"title":"Hourly Totals", "results":results, "error":err, "total": total})
			}
		);
	});
});

/* GET card history page. */
router.get('/history/card/:cardId', function(req, res) {
	var db = mongo.connect(connectionString, function(err,db){
		var data = {};
		data.card = {};
		data.days = [];

		var cardPulls = db.collection("CardPulls");
		//var cardId = req.query.cardId;
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
				var cardInfo = getCardInfo(cardId, function(card,err){
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

router.get('/update/time', function(req, res) {
	var db = mongo.connect(connectionString, function(err,db){
		var cardPulls = db.collection("CardPulls");

		//cardPulls.find({timeStamp:null})

		cardPulls.find({timeStamp:null}).each(
			function(doc) {
		  		//doc.timeStamp = doc._id.getTimestamp();
		  		//cardPulls.save(doc);
		  		console.log(doc.name);
		  		//cardPulls.update({_id:doc._id}, {$set: {timeStamp: doc._id.getTimestamp()}});
			});
		res.send("done");
	});

});


/*---------------------------------------
Helper functions (move somewhere else)
-----------------------------------------*/

var http = require("http"),
    zlib = require("zlib");

function getGzipped(options, callback) {
    // buffer to store the streamed decompression
    var buffer = [];

    http.get(options, function(res) {
        // pipe the response into the gunzip to decompress
        var gunzip = zlib.createGunzip();            
        res.pipe(gunzip);

        gunzip.on('data', function(data) {
            // decompression chunk ready, add it to the buffer
            buffer.push(data.toString())

        }).on("end", function() {
            // response and decompression complete, join the buffer and return
            callback(null, buffer.join("")); 

        }).on("error", function(e) {
            callback(e);
        })
    }).on('error', function(e) {
        callback(e)
    });
};



function getCardInfo(cardId,callback){
	var db = monk(dbServer + '/SWFC');

    // Set our collection
    var collection = db.get("CardPulls");
   	collection.findOne(
    			{card_id:cardId},
    			function(err,doc){
    				console.log("error: " + err);
    				console.log("doc:" + doc.name);
    				db.close();
    				if(doc!==null&&doc!==undefined){
			    			callback(doc,"");
		    		}else{
		    			console.log("Could Not Find Card With ID " + cardId);
		    			callback({},"Could Not Find Card");
					    		    			
		    		}
			    		


    			})

}

function getWordsBetweenCurlies(str) {
  var results = [], re = /{([^}]+)}/g, text;

  while(text = re.exec(str)) {
    results.push(text[1]);
  }
  return results;
}

function parseCardList(data, callback){
	if(data!==null&&data!==undefined){
		$ = cheerio.load(data);
		var cards = [];
		$(".se_sys_window_opn").each(function( index ) {

			//get card info
			var fullString = $(this).attr("onclick");
			if(fullString!==undefined){
				data = fullString.substring(fullString.indexOf("{"), fullString.lastIndexOf("}")+1);
				//console.log(data);
				//var data =getWordsBetweenCurlies(fullString);
				
				if(data.length>0){
					cardData = data;

					var card = JSON && JSON.parse(cardData) || $.parseJSON(cardData);

					//get the corresponding user info
					$('span[id=user_info_name]').each(function(uIndex){
						if (uIndex==index){
							card.user = $(this).text();
						}
					})
					//get the card pack info
					$(".gacha_drawn.colorCaution,.gacha_drawn.colorWarning").each(function(cIndex){
						if(cIndex==index){
							card.pack = $(this).text();
						}
					});
					
					var timeStamp = new Date().getTime().toString();
					card.timeStamp = timeStamp;
					var fileName = "./data/" + card.card_id + "_" + timeStamp + ".json";
					//console.log("Time: " + timeStamp);
					//console.log("Card: " + card.card_id);
					//console.log("File: " + fileName);
					//writeCardToDB(card, collection);
					//writeFile(fileName, JSON.stringify(card));
					cards.push(card);
				}			
			}

		});
		callback(cards);		
	}


}

function writeFile(fileName, data){
	fs.writeFile(fileName, data, function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file was saved!");
	    }
	}); 	
}

function writeCardToDB(card, collectionName, checkForDupes){
    // Set our internal DB variable
    card.insertTime = new Date();
	var db = monk(dbServer + '/SWFC');

    // Set our collection
    var collection = db.get(collectionName);

    if(checkForDupes){
    	collection.find(
    			{card_id:card.card_id,user:card.user,pack:card.pack}, 'card_id',
    			function(err,docs){
    				if(docs!==null&&docs!==undefined){
			    		if(docs.length>0){
			    			console.log("Ignoring Duplicate");
			    			db.close();
			    		}else{
						    collection.insert(card, function (err, doc) {
						        if (err) {
						            // If it failed, return error
						            console.log("There was a problem adding the information to the database. - /r/n" + err);
						        }
						        else {
									console.log("Card written to " + collectionName + " - " + card.name + "(" + card.card_id + ")");
						        }
						        db.close();

						    });		    			
			    		}
			    		
    				}

    			})
    }


    // Submit to the DB
    /*collection.insert(card, function (err, doc) {
        if (err) {
            // If it failed, return error
            console.log("There was a problem adding the information to the database. - /r/n" + err);
        }
        else {
			console.log("Card written to " + collectionName + " - " + card.name + "(" + card.card_id + ")");
        }
    });*/
}

function calculateRarity(count, total){
	var rarity = 0;

	//rarity = Math.floor((count*100/total));
	rarity = (40-round5(Math.floor(count*1000/total)))/5;

	return rarity;
}

function round5(x)
{
    return Math.floor(x/5)*5;
}

var sort_by = function(field, reverse, primer){
   var key = function (x) {return primer ? primer(x[field]) : x[field]};

   return function (a,b) {
	  var A = key(a), B = key(b);
	  return ( (A < B) ? -1 : ((A > B) ? 1 : 0) ) * [-1,1][+!!reverse];                  
   }
}

function getTotal(collection){
	var total = 0;
	collection.forEach(function(element,index,array){
		total = total + element.value;
	});
	return total;
}


module.exports = router;
