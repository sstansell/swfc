exports.config = {
	user:{
		userId: "",
		userAgent: "",
		sessionId: ""
	},
	db:{
		server:"10.0.0.15:27017",
		connectionString: "mongodb://10.0.0.15:27017/SWFC"
	},
	url:{
		host: "amw.konaminet.jp",
		postFix: "&opensocial_viewer_id=397916324&sub_ln=en_US&a=home%2Fhome&t=2602",
		headers: {
			'Connection': 'keep-alive',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		    'User-Agent':       'Mozilla/5.0 (Linux; Android 4.4.2; Dummy 1 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36',
		    'Accept-Encoding': 'gzip,deflate',
		    'Accept-Language': 'en-US',
		    'X-Requested-With': 'jp.konami.swfc'
    	}		
	},
	filePath: "/Users/seanstansell/Documents/projects/swfc/api/public/images/",	

};


