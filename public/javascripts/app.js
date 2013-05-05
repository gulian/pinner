var columnWidth = 290;

$(function(){

	"use strict";

	var Post = Backbone.Model.extend({

		defaults: function() {
			return {
				_id     : undefined,
				title   : 'Untitled pin',
				link    : 'http://',
				img		: 'http://placekitten.com/g/'+columnWidth+'/'+Math.floor(100*Math.random()%150+150),
				tags    : ''
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
			"click .delete-btn" : "confirmDelete",
			"click .confirm-delete-btn" : "_delete",
			"click .toggle-edit-btn" : "toggleUpdate",
			"click .edit-btn" : "_update",
			"keypress .editable" : "enterHandler"
		},

		initialize: function(){
			_.bindAll(this, "render");
			this.model.bind('change', this.render);
		},

		render: function(){
			this.$el.addClass("post thumbnail");
			// TODO: use mustache.js template engine
			var	html  = '<img class="img-polaroid" src="'+this.model.get("img")+'"></img>';
				html += '<div class="btn-group pinner-control">';
				html += '<button class="btn btn-mini toggle-edit-btn"><i class="icon-pencil"></i></button>';
				html += '<button class="btn btn-mini delete-btn"><i class="icon-remove"></i></button>';
				html += '</div>';
				html += '<p>';

				if(this.model.get("tags") !== '') _.each(this.model.get("tags").split(','), function(tag){
					html += '<span class="label pinner-tag"><i class="icon-tag icon-white"></i> '+tag+'</span>';
				});

				html += '</p>';
				html += '<h3 for=title class=editable>'+this.model.get("title")+'</h3>';
				html +=	'<p class="link"><a class="editable" for="link" target="_blank" href="'+this.model.get("link")+'">'+this.model.get("link")+'</a></p>';

			this.$el.html(html);
			return this;
		},

		confirmDelete: function(event){
			var $btn = $(event.currentTarget);
			$btn.html("really ?");
			$btn.removeClass("delete-btn").addClass("confirm-delete-btn btn-danger");
		},

		_delete: function(){
			this.model.destroy();
			this.remove();
			this.layout();
		},

		toggleUpdate: function(){
			this.$el.find('.editable')
						.attr('contenteditable', true).end()
					.find('.toggle-edit-btn')
						.toggleClass('toggle-edit-btn edit-btn btn-warning')
						.html('save !').end()
					.find('.editable')
						.first().focus().end().end();
		},

		_update: function(){
			var self = this ;
			this.$el.find('.editable')
						.each(function(key, attribute){
							self.model.set($(attribute).attr('for'), $(attribute).html());
						})
						.attr('contenteditable', false).end()
					.find('.edit-btn')
						.toggleClass('toggle-edit-btn edit-btn')
						.html('edit').end();

			this.model.save(null ,{
				success: function(model){
					self.render();
					self.layout();
			}});
		},

		layout: function(){
			new Masonry( document.getElementById('post-list'), {
				columnWidth: columnWidth
			});
		},

		enterHandler: function(event){
			if(event.keyCode === 13){
				this._update();
				return false;
			}
			return true ;
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
			"click #create-post-btn" : 'create_post',
			"keypress #new-post-tags" : 'tagsHandler',
			"blur #new-post-link" : 'linkHandler',
			"click #new-post-rendered-tags span" : "tagClickHandler",
			"click #remote-gallery img": "imageClickHandler",
			"click #cancel-post-btn" : 'resetPostFields',
			"click #close-post-btn" : 'resetPostFields'
		},

		initialize: function(){
			var self = this ;
			this.posts = new PostList();
			this.posts.fetch({success:function(){
				self.render();
			}});
		},

		render: function(){
			var posts = $("#post-list").empty();
			var self = this;
			_.each(this.posts.models, function(post){
				self.add_post(post);
			});
			// called each time, dirty but works
			self.layout();
		},

		create_post: function(event){
			event.preventDefault();

			var hiddenTagsInput = $('#new-post-hidden-tags').val('') ;

			$("#new-post-rendered-tags span").each(function(key, elt){
				if(key !== $("#new-post-rendered-tags span").length && hiddenTagsInput.val().indexOf($(elt).data('tag')) === -1 ){
					hiddenTagsInput.val(hiddenTagsInput.val() + ',' + $(elt).data('tag'));
				}
			});

			if($("#new-post-tags").val().trim() !== ''){
				hiddenTagsInput.val(hiddenTagsInput.val() + ',' + $("#new-post-tags").val());
			}

			hiddenTagsInput.val(hiddenTagsInput.val().substr(1,hiddenTagsInput.val().length));

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
			}});
		},

		add_post : function(post){
			// called each time, dirty but works
			var postView = new PostView({model:post}),
				self = this,
				$el = postView.render().$el.find('img').load(function(){
					self.layout();
				}).end();

			this.$el.find("#post-list").prepend($el);
			this.posts.add(post);
			this.resetPostFields();
		},

		tagsHandler:function(event){
			if(event.keyCode === 58 || event.keyCode === 59 || event.keyCode === 13 || event.keyCode === 44){ // ',', ';', '\n' or ':'
				var $input = $("#new-post-tags");
				var tag = $input.val();
				if(tag === '') return false;
				$('<span>').addClass("label pinner-tag")
							.data('tag', tag)
							.html('<i class="icon-tag icon-white"></i> '+tag)
							.appendTo("#new-post-rendered-tags");
				$input.val('');
				return false;
			}
		},

		linkHandler:function(event){
			var $input = $("#new-post-link"),
				tag = $input.val(),
				isUrl = tag.match(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);

			if(isUrl){
				$("#link-input-control-group").removeClass("error");
				$.ajax({
					url : '/fetch',
					data: {
						url : $input.val()
					},
					success : function(urls){
						var $gallery = $("#remote-gallery").empty();
						_.each(urls, function(url){
							var $img = $("<img>").attr({'src': url});
							// TODO: use masonry to layout remote galery ??
							$('<span>').html($img).addClass('thumbnail').appendTo($gallery);
						});

						if(urls.length === 0){
							var $alert = $("<div>").addClass('alert no-image-alert')
													.html("<strong>CRAP</strong> No picture was found on this url")
													.appendTo($gallery);
						} else {
							var $firstImg = $("#remote-gallery span").first();
							$firstImg.addClass('selected');
							$('#new-post-hidden-img').val($firstImg.find('img').attr('src'));
						}
					},
					error : function(){
						$("#link-input-control-group").addClass("error");
						var $alert = $("<div>").addClass('alert alert-error no-image-alert')
													.html("<strong>OOPS</strong> something very bad just happened")
													.appendTo($("#remote-gallery").empty());
					}
				});
			} else {
				$("#link-input-control-group").addClass("error");
				var $alert = $("<div>").addClass('alert alert-error no-image-alert')
											.html("<strong>Error</strong> url is not valid")
											.appendTo($("#remote-gallery").empty());

			}
		},

		tagClickHandler: function(event){
			$(event.currentTarget).remove();
		},

		imageClickHandler: function(event){
			$("#remote-gallery span").removeClass('selected');
			var $img = $(event.currentTarget);
			$img.parent().addClass('selected');
			$('#new-post-hidden-img').val($img.attr('src'));
		},

		layout: function(){
			new Masonry( document.getElementById('post-list'), {
				columnWidth: columnWidth
			});
		},
		resetPostFields: function(){
			$("#new-post-form input").val('');
			$("#remote-gallery, #new-post-rendered-tags").empty();
		}
	});

	var Pinner = new PinnerView();
});
