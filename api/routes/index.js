var express = require('express');
var router = express.Router();
var uncompress = require('compress-buffer').uncompress;
var cheerio = require('cheerio');
var fs = require('fs');
var mongo = require('mongodb');
var monk = require('monk');
var moment = require('moment');
var http = require('http');
var url = require('url');
var c = require('../config');
var config = c.config;

var fileRoot = config.filePath;
var dbServer = config.db.server;
var connectionString = config.db.connectionString;

var host = config.url.host;
var pathPostFix = config.url.postFix;
var headers = config.url.headers;

config.startDate = new Date(2015,03,01);

/*-----------------
TODO:
check for duplicates


-------------------*/
/* GET home page */
router.get('/', function(req,res){
	res.render('index');
});



/* GET cardPulls page. */
router.get('/cardPulls', function(req, res) {
	res.render('cardPulls');

});

/* GET cardArchive page. */
router.get('/cardArchive', function(req, res) {
	res.render('cardArchive');

});

/* GET cardBinder page. */
router.get('/cardBinder', function(req, res) {
	res.render('cardBinder');

});

/* GET cardPulls stream page. */
router.get('/stream/cardPulls', function(req, res) {
	var request = require('request');

		getConfigFromDB(function(config){
			phpSessId = config.user.sessionId;
			userName = config.user.name;

		// Set the headers

		    
			var pathPrefix ="/amw/naboo/gacha/gacha/list?PHPSESSID="
			
			
			var path = pathPrefix + phpSessId + pathPostFix;
			buildHeaders(req,function(headers){
			// Configure the request
				var options = {
					    host: host,
					    method: 'GET',
					    headers: headers,
					    path: path
				   	}

				getGzipped(options, function(err, data) {
					console.log("Path: " + options.path);
					//console.log(options.headers);
					//console.log(response.headers);
				   //console.log("Data: " + data);
				   if(err !== null){
				   		console.log(err);
				   }
				   res.send(data);
				   //res.render('cardPulls', {data: data});
				   parseCardList(data, function(cards){
				   		//write cards to db...
						var cardLength = cards.length;
						for (var i = 0; i < cardLength; i++) {
						    
						    writeCardToDB(cards[i],"CardPulls",true);
						}
				   });
				})

			});
		});	
});

/* GET card binder page. */
router.get('/stream/cardBinder', function(req, res) {
	var request = require('request');
	var attribute = req.query.attribute;
	var page = req.query.page;
	var type = req.query.type;
	var sort = req.query.sort;
	var collection = "";	
	switch (type) {
	  case "1":
	    collection = "cardBinder";
	    break;
	  case "2":
	    collection = "vehicles";
	    break;
	  case "3":
	    collection = "stacks"
	    break;
	  default:
	    collection = "cardBinder";
	}
console.log("Type: " + type);
console.log("Collection: " + collection);
		getConfigFromDB(function(config){
			phpSessId = config.user.sessionId;
			// Set the headers

	    
			var pathPrefix ="/amw/naboo/card/card/list?PHPSESSID="
		
		
			var path = pathPrefix + phpSessId + "&type=" + type + "&attribute=" + attribute + "&sort=" + sort + "&page=" + page +pathPostFix;
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
					    writeCardToDB(cards[i],collection,true);
					}		   		
			   });
			})
		});
});


/* GET eventQuest page. */
router.get('/stream/eventQuest', function(req, res) {
	var request = require('request');
		phpSessId = req.query.phpId;
		userName = req.query.user;

	// Set the headers

	    ///amw/naboo/event/normal/024_grandarmy/quest/main?&flid=11&PHPSESSID=43ARMGF892G63FE4H383KL56&opensocial_viewer_id=521175497&u=1427725539
		var pathPrefix ="/amw/naboo/event/normal/024_grandarmy/quest/main?&flid=2&PHPSESSID="
		
		
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
		   
		   //res.send(data);
		   analyzeQuestBattle(data,function(action){
		   		//console.log("Action: "  + action);
		   		res.send(action);
		   });
		   /*parseCardList(data, function(cards){
		   		//write cards to db...
				var cardLength = cards.length;
				for (var i = 0; i < cardLength; i++) {
				    
				    writeCardToDB(cards[i],"CardPulls",true);
				}
		   });*/
		})
});

/* GET cardArchive stream page. */
router.get('/stream/cardArchive', function(req, res) {
	var request = require('request');
	getConfigFromDB(function(config){
		phpSessId = config.user.sessionId;
		userName = req.query.user;
		page = req.query.page;
		rarity = req.query.rarity;
		userId = config.user.userId;
		attribute = 0;
console.log("*****************************");	
console.log("CARD ARCHIVE");
console.log("*****************************");			
console.log("SessionId: " + phpSessId);
console.log("userId: " + userId);
console.log("userAgent: " + config.user.userAgent);
console.log("*****************************");	
		// Set the headers

		    //http://amw.konaminet.jp/amw/naboo/book/book/list?page=1&attribute=0&type=1&rarity=4&user_id=3273637&PHPSESSID=HP3KP65C53NE89HQ6J5H6GED&opensocial_viewer_id=521175497&u=1429717153
			var pathPrefix ="/amw/naboo/book/book/list?page=" + page + "&rarity=" + rarity + "&attribute=" + attribute + "&type=1&PHPSESSID="
			var path = pathPrefix + phpSessId + pathPostFix;
		buildHeaders(req,function(headers){
		// Configure the request
			var options = {
				    host: host,
				    method: 'GET',
				    headers: headers,
				    path: path
			   	}

			getGzipped(options, function(err, data) {
				console.log("Path: " + options.path);
				//console.log(options.headers);
				//console.log(response.headers);
			   //console.log("Data: " + data);
			   if(err !== null){
			   		console.log("Card Archive Error: " + err);
			   }
			   res.send(data);
			   //res.send("got it");
			   parseCardArchivePage(data,function(cardList){
			   	console.log(cardList);
			   	if(cardList.length > 0){
			   		cardList.forEach(function(element,index,array){
			   			//get /stream/cardDetails/:cardId
			   			var detailsUrl = "http://localhost:3000/stream/cardDetails/" + element + "?sessionId=" + phpSessId + "&userId=" + userId;
			   			console.log("Card Archive Details URL: " + detailsUrl);
			   			request(detailsUrl, function(error, response, body){
						  if(error){
						  	console.log("Card Archive Error: " + error);
						  }
						  if (!error) {
						    console.log("Card Archive Success");  
						  }			   				
			   			})
			   		})
			   	}
			   })

			})

		});					
	})	
});

/* GET cardDetail page. */
router.get('/stream/cardDetails/:cardId', function(req,res){
	var request = require('request');
	getConfigFromDB(function(config){
		phpSessId = config.user.sessionId;
		userId = config.user.userId;
		cardId = req.params.cardId;
console.log("*****************************");			
console.log("GET CARD DETAILS");
console.log("*****************************");	
console.log("cardId: " + cardId);
console.log("*****************************");	
	    //http://amw.konaminet.jp/amw/naboo/book/book/detail?card_id=1014010140&user_id=4951069&series=1014010140&PHPSESSID=4HF9QG74MQQ5CGJ4GE7R3H3G&opensocial_viewer_id=397916324&u=1428762081
		var pathPrefix ="/amw/naboo/book/book/detail?card_id=" + cardId + "&user_id=" + userId + "&series=" + cardId + "&PHPSESSID=";
		var path = pathPrefix + phpSessId + pathPostFix;		
		buildHeaders(req,function(headers){
		// Configure the request
			var options = {
				    host: host,
				    method: 'GET',
				    headers: headers,
				    path: path
			   	}

			getGzipped(options, function(err, data) {
			   //console.log("Path: " + options.path);
			   if(err !== null){
			   		console.log("Card Details Error" + err);
			   		res.send(err);
			   }else{
			   	//console.log("Data: " + data);
			   	if(data.length > -1){
				   var ret = JSON.parse(data);
				   //console.log(ret);
				   res.send(ret.card);

				   //write the base card info to the database
				   writeCardToDB(ret.card, "cards", true);

				   //write the skill info to the database (if applicable)
				   if("skill" in ret.card){
				   	//console.log("Found skill");
				   	writeSkillToDB(ret.card.skill, "skills", true);
				   }				   
				   //download the image
				   //http://amw.konaminet.jp/amw/naboo/img/card/chara/101401014/1014010140_l.png
				   var url = ret.card.img;
				   var localFilePath = fileRoot + 'card/' + ret.card.card_id + "_l.png";
				   //console.log(localFilePath);
				   request(url).pipe(fs.createWriteStream(localFilePath));
				   /*downloadFile(url, localFilePath, function(){

				   }*/
				}
			   }
			})

		});
	})



		

	

});

/* GET the loader page. */
router.get('/loader', function(req, res) {
	var db = mongo.connect(connectionString, function(err,db){
		var accounts = db.collection("accounts");

		accounts.find({}).sort().toArray(
				function(err,results){
					db.close();
					res.render('loader', {"title":"Login", "accounts":results, "error":err});
				});
	});	

});

/* POST the custom loader page. */
router.post('/loader', function(req, res) {
	var sessionId = req.body.sessionId;
	var userId = parseInt(req.body.selAccount,10);

	//fetch the userinfo based on the id
	var db = mongo.connect(connectionString, function(err,db){
		var accounts = db.collection("accounts");

		accounts.find({userId: userId}).sort().toArray(
				function(err,results){
					db.close();
					console.log(results)
					var userAgent = results[0].userAgent;
					config.user.userId = userId;
					config.user.userAgent = userAgent;
					config.user.sessionId = sessionId;
					writeConfigToDB(config,"config")
				});
	});		

	res.redirect('/');
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

function buildHeaders(req, callback){
	var userAgent = config.user.userAgent;
	    /*if(req.cookies.userAgent != ""){
	    	userAgent = req.cookies.userAgent;
	    }else{
	    	userAgent = 'Mozilla/5.0 (Linux; Android 4.4.2; Dummy 1 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36'
	    }	*/
	var headers = {
		'Connection': 'keep-alive',
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	    'Accept-Encoding': 'gzip,deflate',
	    'Accept-Language': 'en-US',
	    'X-Requested-With': 'jp.konami.swfc',
	    'User-Agent': userAgent
    }

    callback(headers);

}




function getWordsBetweenCurlies(str) {
  var results = [], re = /{([^}]+)}/g, text;

  while(text = re.exec(str)) {
    results.push(text[1]);
  }
  return results;
}

function analyzeQuestBattle(data, callback){
	//get the config
	var action = {};
	var suggestion = "skip";
	if(data!==null&&data!==undefined){
		$ = cheerio.load(data);	
		var configScript = $("script:contains('config=')").text();
		configScript = configScript.substring(configScript.indexOf("{")+1, configScript.lastIndexOf("}"));
		configScript = configScript.substring(configScript.indexOf("{"), configScript.indexOf("}")-3);
		configScript = configScript+ "}";

		//configScript = configScript.replace('variable', '"variable"');
		configScript = configScript.replace('maxFrameSkip', '"maxFrameSkip"');
		var battle = JSON && JSON.parse(configScript) || $.parseJSON(configScript);
		
		console.log(battle.encount_turn);
		var turn = battle.encount_turn;

		//always battle NPCs
		if(turn > 0 && battle.is_npc > 0){
			suggestion = "battle";
		}
		//if it's not an NPC, only battle if we don't wast too much EP getting there
		if(turn > 0 && turn < 3){
			suggestion = "battle";
		}
		action.data={
			"suggestion":suggestion
		}
		action.links={
			"link1":battle.callback1,
			"link2":battle.callback2,
			"link3":battle.callback3,
			"link4":battle.callback4,
			"link5":battle.callback5,
			"link6":battle.callback6
		}		
		action.enemyData = {
			"turn": battle.encount_turn,
			"is_npc": battle.is_npc,
			"enemy":{
				"lvl": battle.ene_lvl,
				"cost": battle.ene_cost,
				"name": battle.ene_name,
				"side": battle.ene_side,
				"comment" : battle.player_comment
			}
		}
		action.battle = battle;
		//action = battle;
		//console.log("Config Script: " + configScript);
	}
	//get the enemy info

	//calculate recommended action

	callback(action);
}



function downloadFile(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  });
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
					//(card, collection);
					//writeFile(fileName, JSON.stringify(card));
					cards.push(card);
				}			
			}

		});
		callback(cards);		
	}


}

function parseCardArchivePage(data, callback){
	if(data!==null&&data!==undefined){
		$ = cheerio.load(data);	
			var cards = [];
			$(".detail").each(function(index){
				var href = $(this).attr("href");
				var urlParts = url.parse(href,true);
				var cardId = urlParts.query.card_id;
				cards.push(cardId);
			})
				
	}	
	callback(cards);	
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
}
function writeSkillToDB(skill, collectionName, checkForDupes){
    // Set our internal DB variable
    skill.insertTime = new Date();
	var db = monk(dbServer + '/SWFC');

    // Set our collection
    var collection = db.get(collectionName);

    if(checkForDupes){
    	collection.find(
    			{skill_id:skill.skill_id}, 'skill_id',
    			function(err,docs){
    				if(docs!==null&&docs!==undefined){
			    		if(docs.length>0){
			    			console.log("Ignoring Duplicate");
			    			db.close();
			    		}else{
						    collection.insert(skill, function (err, doc) {
						        if (err) {
						            // If it failed, return error
						            console.log("There was a problem adding the information to the database. - /r/n" + err);
						        }
						        else {
									console.log("Skill written to " + collectionName + " - " + skill.name + "(" + skill.skill_id + ")");
						        }
						        db.close();

						    });		    			
			    		}
			    		
    				}

    			})
    }
}

function writeConfigToDB(config, collectionName){
    // Set our internal DB variable
    config.insertTime = new Date();
	var db = monk(dbServer + '/SWFC');

    // Set our collection
    var collection = db.get(collectionName);
    //remove the current config
    collection.remove();
    collection.insert(config, function (err, doc) {
        if (err) {
            // If it failed, return error
            console.log("There was a problem adding the information to the database. - /r/n" + err);
        }
        else {
			console.log("Config written to " + collectionName);
        }
        db.close();

    });
}

function getConfigFromDB(callback){
	var db = mongo.connect(connectionString, function(err,db){
		var config = db.collection("config");
			config.find({}).toArray(
					function(err,results){
						db.close();
						callback(results[0]);
					});	
	});	
}



module.exports = router;
