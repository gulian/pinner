var database = require("ejdb").open("pinner", require("ejdb").DEFAULT_OPEN_MODE),
	fs = require('fs'),
	http = require('http');
	url = require('url');
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

	var url = require('url');
	var url_t = req.query.url;
	var isImage = url_t.match(/(http(s?):)|([/|.|\w|\s])*\.(?:jpg|gif|png)/gi)[1];
	var page_info = {};
	var imgs = [];

	if(isImage){
		imgs.push(url_t);
		page_info.imgs = imgs;
		page_info.title = url_t;
		res.json(200, page_info);
		return;
	}

	var parsedUrl = url.parse(url_t) ;
	var options = {
		host: parsedUrl.hostname,
		port: parsedUrl.port,
		path: parsedUrl.path
	};

	http.get(options, function(http_response) {
		var body = "";
		http_response.on('data', function (body_part) {
			body += body_part;
		});
		http_response.on('end', function(){
			var matches = body.match(/<img[^>]+src="([^">]+)"/gi);
			if(!matches){
				res.json(200, []);
				return ;
			}
			for (var i = 0; i < matches.length; i++) {
				var src = matches[i].match(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);

				if(src && src[0].indexOf('http') !== -1){
					imgs.push(src[0]);
				}
				else if(src){
					imgs.push(parsedUrl.protocol+'//'+parsedUrl.host+src[0]);
				}
			}
			page_info.imgs = imgs;
			page_info.title = body.match(/<title>(.*?)<\/title>/i);

			if(page_info.title)
				page_info.title = page_info.title[1];
			else
				page_info.title = '';

			res.json(200, page_info);
		});

	}).on('error', function(e) {
		console.log("HOLY CRAP: " + e.message);
		res.json(404, []);
	});

};

exports.search = function(req, res){
	database.find("posts", function(errors, cursor){

		if(errors)
			return res.send(500);

		var response	= [],
			search_str	= req.query.str.trim().toLowerCase(),
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
