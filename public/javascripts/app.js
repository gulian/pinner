$(function(){

	"use strict";

	var Post = Backbone.Model.extend({

		defaults: function() {
			return {
				_id     : undefined,
				title   : "new Pinner",
				link    : "http://"
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

	var PostView = Backbone.View.extend({

		tagName: "div",

		events: {
			"click .delete-btn" : "_delete",
			"click .toggle-edit-btn" : "toggleUpdate",
			"click .edit-btn" : "_update"
		},

		initialize: function(){
			_.bindAll(this, "render");
			this.model.bind('change', this.render);
		},

		render: function(){
			this.$el.addClass("post thumbnail");
			// TODO: use mustache.js template engine
			var	html  = '<img src="'+'http://placekitten.com/g/250/'+Math.floor(100*Math.random()%150+150)+'"></img>';
				html += '<p for=title class=editable>'+this.model.get("title")+'</p>';
				html += '<p>';
				html += 'tags:<span class="label pinner-tag">javascript</span><span class="label pinner-tag">css</span><span class="label pinner-tag">lolcatz</span>';
				html += '</p>';
				html += '<p>';
				html +=		'<button class="btn toggle-edit-btn">edit</button>';
				html +=		'<button class="btn btn-danger delete-btn">delete</button>';
				html +=		'<span for=link class=editable>'+this.model.get("link")+'</span>';
				html += '</p>';
			this.$el.html(html);
			return this;
		},

		_delete: function(){
			this.model.destroy();
			this.remove();
		},

		toggleUpdate: function(){
			this.$el.find('.editable').attr('contenteditable', true);
			this.$el.find('.toggle-edit-btn').toggleClass('toggle-edit-btn')
												.toggleClass('edit-btn')
												.html('save');
		},

		_update: function(){
			var self = this ;
			this.$el.find('.editable').each(function(key, attribute){
				self.model.set($(attribute).attr('for'), $(attribute).html());
			});
			this.$el.find('.editable').attr('contenteditable', false);
			this.$el.find('.edit-btn').toggleClass('toggle-edit-btn')
										.toggleClass('edit-btn')
										.html('edit');

			this.model.save(null ,{
				success: function(model){
					self.render();
			}});
		}
	});

	var PostList = Backbone.Collection.extend({
		model: Post,
		url: "post/"
	});

	var PostCollection = new PostList();

	var PinnerView = Backbone.View.extend({

		el: $("#Pinner"),

		events : {
			"click #new-post-btn"    : 'show_create_form',
			"click #create-post-btn" : 'create_post'
		},

		initialize: function(){
			var self = this ;
			this.posts = new PostList();
			this.posts.fetch({success:function(){
				self.render();
			}});
			$("#new-post-form").hide();
		},

		render: function(){
			var posts = $("#post-list").empty();
			var self = this;
			_.each(this.posts.models, function(post){
				self.add_post(post);
			});
			// called each time, dirty but works
			new Masonry( document.getElementById('post-list'), {
				columnWidth: 250
			});
		},

		show_create_form: function(){
			console.log("createpost");
			// $("#new-post-btn").hide();
			$("#new-post-form").show();
		},

		hide_create_form: function(){
			// $("#new-post-btn").show();
			$("#new-post-form").hide();
		},

		create_post: function(event){
			event.preventDefault();

			var post_fields = $("#new-post-form").serializeArray(),
				post = new Post(),
				self = this ;

			_.each(post_fields, function(field){
				if(field.value !== "") {
					post.set(field.name, field.value);
				}
			});

			post.save(null,{ success: function(){
				self.add_post(post);
				self.hide_create_form();
			}});
		},

		add_post : function(post){
			// called each time, dirty but works
			var postView = new PostView({model:post}),
				$el = postView.render().$el.find('img').load(function(){
					new Masonry( document.getElementById('post-list'), {
						columnWidth: 250
					});
				}).end();

			this.$el.find("#post-list").prepend($el);
			this.posts.add(post);
		}
	});

	var Pinner = new PinnerView();
});
