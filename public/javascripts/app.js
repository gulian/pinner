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

			this.$el.addClass("well well-small span4 application");
			// TODO: use mustache.js template engine
			var html  = '<p for=title   class=editable>'+this.model.get("title")+'</p>';
				html += '<p>';
				html += '<span for=link  class=editable>'+this.model.get("link")+'</span>';
				html += '</p>';
				html += '<div class="btn-group">';
				html += '<button class="btn toggle-edit-btn">edit</button>';
				html += '<button class="btn btn-danger delete-btn">delete</button>';
				html += '</div>';

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
		},

		show_create_form: function(){
			$("#new-post-btn").hide();
			$("#new-post-form").show();
		},

		hide_create_form: function(){
			$("#new-post-btn").show();
			$("#new-post-form").hide();
		},

		create_post: function(){
			arguments[0].preventDefault();

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
			var postView = new PostView({model:post});
			this.$el.find("#post-list").append(postView.render().el);
			this.posts.add(post);
		}

	});

	var Pinner = new PinnerView();

});