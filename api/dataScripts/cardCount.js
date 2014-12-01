		var map = function(){
			emit(this.name, 1);
		}
		var reduce = function(name, count){
			return Array.sum(count);
		}

		db.cardPulls.mapReduce(
			map,
			reduce,
			{
				query: {timeStamp: {$gte:"1416402516"}},
				out: {inline:1}
			},
			function(err,results){
				results.sort(sort_by('value', false, parseInt));
				var total = getTotal(results);
				res.render('cardTotals', {"title":"Card Totals", "results":results, "error":err, "total": total})
			}
		);