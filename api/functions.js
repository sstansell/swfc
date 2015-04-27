var c = require('./config');
var config = c.config;

exports.functions = {


	sort_by : function(field, reverse, primer){
	   var key = function (x) {return primer ? primer(x[field]) : x[field]};

	   return function (a,b) {
		  var A = key(a), B = key(b);
		  return ( (A < B) ? -1 : ((A > B) ? 1 : 0) ) * [-1,1][+!!reverse];                  
	   }
	},
	getTotal : function(collection){
		var total = 0;
		collection.forEach(function(element,index,array){
			total = total + element.value;
		});
		return total;
	},
	calculateRarity : function (count, total){
		var rarity = 0;
		rarity = (40-this.round5(Math.floor(count*1000/total)))/5;
		return rarity;
	},
	round5 : function (x)
	{
	    return Math.floor(x/5)*5;
	},
	getCardInfo : function(cardId, db ,callback){
		//var db = monk(config.db.server + '/SWFC');

	    // Set our collection
	    var collection = db.get("CardPulls");
	   	collection.findOne(
	    			{card_id:cardId},
	    			function(err,doc){
	    				//console.log("error: " + err);
	    				//console.log("doc:" + doc.name);
	    				db.close();
	    				if(doc!==null&&doc!==undefined){
				    			callback(doc,"");
			    		}else{
			    			console.log("Could Not Find Card With ID " + cardId);
			    			callback({},"Could Not Find Card");
						    		    			
			    		}
	    			})
	},
	getConfigFromDB : function(callback){
		var db = mongo.connect(config.db.connectionString, function(err,db){
			var config = db.collection("config");
				config.find({}).toArray(
						function(err,results){
							db.close();
							callback(results[0]);
						});	
		});	
	},
	buildHeaders : function(req, callback){
		var userAgent = config.user.userAgent;
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
}