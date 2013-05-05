var express     = require('express'),
		routes      = require('./routes'),
		post = require('./routes/post'),
		http        = require('http'),
		path        = require('path');

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'hjs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(require('less-middleware')({ src: __dirname + '/public' }));
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.get('/', routes.index);

app.get( '/post', post.showAll);
app.get( '/post/:id', post.showOne);
app.put('/post/:id', post.update);
app.post('/post', post.add);
app.delete('/post/:id', post.delete);

app.get('/fetch', post.fetch);

http.createServer(app).listen(app.get('port'), function(){
	console.log("pinner running on " + app.get('port'));
});
