var columnWidth = 290;

var Post = Backbone.Model.extend({

	defaults: function() {
		return {
			_id     : undefined,
			title   : 'Untitled pin',
			link    : 'http://',
			img		: 'http://placekitten.com/g/'+columnWidth+'/'+Math.floor(100*Math.random()%150+150),
			tags    : '',
			count   : 0,
			created : 0
		};
	},

	urlRoot: 'post/',

	idAttribute: "_id",

	debug: function(){
		console.log('_id:'      , this.get('_id')      );
		console.log('title:'    , this.get('title')    );
		console.log('link:'		, this.get('link')     );
	}
});