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

	var parsedUrl = url.parse(req.query.url) ;
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
			var imgs = [];
			for (var i = 0; i < matches.length; i++) {
				var src = matches[i].match(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);

				console.log(src[0], parsedUrl.protocol, src[0].indexOf(parsedUrl.protocol));

				if(src && src[0].indexOf('http') !== -1){
					imgs.push(src[0]);
				}
				else if(src){
					imgs.push(parsedUrl.protocol+'//'+parsedUrl.host+src[0]);
				}
			}
			// console.log(imgs);
			res.json(200, imgs);
		});
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
	});

};

