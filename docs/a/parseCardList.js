//$(".se_sys_window_opn").attr("onclick")


function getWordsBetweenCurlies(str) {
  var results = [], re = /{([^}]+)}/g, text;

  while(text = re.exec(str)) {
    results.push(text[1]);
  }
  return results;
}
$(".se_sys_window_opn").each(function( index ) {

	//get card info
	var fullString = $(this).attr("onclick");

	var data =getWordsBetweenCurlies(fullString);
	if(data.length>0){
		cardData = "{" + data[0] + "}";

		var card = JSON && JSON.parse(cardData) || $.parseJSON(cardData);

		//get the corresponding user info
		$('span[id=user_info_name]').each(function(uIndex){
			if (uIndex==index){
				card.user = $(this).text();
			}
		})
		//get the card pack info
		$(".gacha_drawn.colorCaution").each(function(cIndex){
			if(cIndex==index){
				card.pack = $(this).text();
			}
		});
		console.log(card);
	}
});


