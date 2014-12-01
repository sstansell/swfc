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


var express = require('express');
var router = express.Router();
var uncompress = require('compress-buffer').uncompress;
var cheerio = require('cheerio');
var fs = require('fs');
var mongo = require('mongodb');
var monk = require('monk');