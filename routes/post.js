var database = require("ejdb").open("pinner", require("ejdb").DEFAULT_OPEN_MODE),
	fs = require('fs'),
	http = require('http'),
	path = require('path');


exports.showAll = function(req, res){
	var response = [];
	database.find("posts", function(errors, cursor, count){
		if(errors) return res.send(500);

		while (cursor.next()) {
			response.push(cursor.object());
		}
		res.json(response);
	});
};

exports.showOne = function(req, res){
	// TODO: adapt this function with ejdb
	res.send(404);
};

exports.add = function(req, res){
	var _post = req.body ;

	database.save("posts", _post, function(errors, _id){
		if(errors) {
			return res.send(500);
		}
		res.json(200, _post);
	});
};

exports.update = function(req, res){
	database.save("posts", req.body, function(errors, _id){
		if(errors) return res.send(500);
		res.json(200, req.body);
	});
};

exports.delete = function(req, res){
	database.remove("posts", req.params.id, function(errors){
		res.send(errors ? 404 : 200);
	});
};

// TODO : move this function in a proper file
exports.fetch = function(req, res){

	var request = require('request');
	var parser = require('url');
	var url = req.query.url.indexOf("http://") + req.query.url.indexOf("https://") === -2 ? 'http://' + req.query.url : req.query.url;
	var isImage = url.match(/(http(s?):)|([/|.|\w|\s])*\.(?:jpg|gif|png)/gi);

	if(isImage){
		isImage = isImage[1];
	}

	var page = {	'url'   : url,
					'title' : undefined,
					'imgs'  : [] };

	if(isImage){
		page.imgs.push(url);
		res.json(200, page);
		return;
	}

	request(url, function (error, response, body) {
		if (error) {
			console.log("Error while fetching document: " + error);
			return res.json(404);
		}

		page.title = body.match(/<title>(.*?)<\/title>/i);
		page.title = page.title ? page.title[1] : '';

		var matches = body.match(/<img[^>]+src="([^">]+)"/gi),
			parsed  = parser.parse(url) ;

		if(!matches)
			return res.json(200, page);

		for (var i = 0; i < matches.length; i++) {
			var src = matches[i].match(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);

			if(src && ( src[0].indexOf('http') !== -1 || src[0].indexOf('https') !== -1) ){
				page.imgs.push(src[0]);
			} else if(src){
				page.imgs.push(parsed.protocol + '//' + parsed.host + src[0]);
			}
		}

		var webshot = require('webshot');

		url = req.query.url.indexOf("http://") + req.query.url.indexOf("https://") === -2 ? 'http://' + req.query.url : req.query.url;

		var filename  = url.replace(/[^\w\s-]/g, '').trim().toLowerCase().replace( /[-\s]+/g, '-');
			filename += '.png';

		var public_url = 'img/previews/'+filename ;

		var phantom = require('phantom');

		phantom.create(function(ph) {
			ph.createPage(function(page_) {
				phantom.clipRect = { top: 0 ,left: 0, width: 1024, height: 768 };
				phantom.viewportSize = { width: 1024, height: 768 };
				page_.open(url, function(status) {
					if(status === "success"){
						page_.render('public/'+public_url);
						page.imgs.unshift(public_url);
					}
					res.json(200, page);
				});
			});
		});



	});

};

exports.preview = function(req, res){

	var webshot = require('webshot');
	var url = req.query.url.indexOf("http://") + req.query.url.indexOf("https://") === -2 ? 'http://' + req.query.url : req.query.url;

	var filename  = url.replace(/[^\w\s-]/g, '').trim().toLowerCase().replace( /[-\s]+/g, '-');
		filename += '.png';

	var public_url = 'img/previews/'+filename ;

	webshot(url , 'public/'+public_url, function(error) {
		if(error)
			return res.json(500);
		else
			return res.json(200, filename);
	});
};

exports.search = function(req, res){

	database.find("posts", function(errors, cursor){

		if(errors)
			return res.send(500);

		var response	= [],
			search_str	= req.query.search.trim().toLowerCase(),
			pin, tags;

		while (cursor.next()) {
			pin = cursor.object() ;

			if( pin.title.trim().toLowerCase().indexOf(search_str) !== -1 ||
				pin.link.trim().toLowerCase().indexOf(search_str) !== -1  ){
				response.push(pin);
			} else {
				tags = pin.tags.split(',');
				for (var i = 0; i < tags.length; i++) {
					if(tags[i].trim().toLowerCase().indexOf(search_str) !== -1){
						response.push(pin);
						break;
					}
				}
			}
		}
		res.json(200, response);
	});
};
