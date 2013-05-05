var database = require("ejdb").open("pinner", require("ejdb").DEFAULT_OPEN_MODE),
	fs = require('fs'),
	http = require('http');



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

	// TODO : split req.params.url in 2 parts : host and path
	// TODO : handle https urls

	var options = {
		host: 'www.google.fr',
		port: 80,
		path: '/search?safe=off&hl=fr&site=imghp&tbm=isch&source=hp&biw=1163&bih=595&q=kitten&oq=kitten&gs_l=img.3...1830.2236.0.2427.5.5.0.0.0.0.109.425.4j1.5.0...0.0...1ac.1.12.img.gF3RBnesnTI'
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
				imgs.push(matches[i].match(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi)[0]);
			}
			res.json(200, imgs);
		});
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
	});

};

