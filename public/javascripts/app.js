var columnWidth = 290;

$(function(){

	"use strict";

	var Post = Backbone.Model.extend({

		defaults: function() {
			return {
				_id     : undefined,
				title   : 'Untitled pin',
				link    : 'http://',
				img		: undefined,
				tags    : '',
				count   : 0,
				created : 0
			};
		},

		urlRoot: 'post/',

		idAttribute: "_id"

	});

	var PostView = Backbone.View.extend({

		tagName: "div",

		events: {
			"click .delete-btn" : "confirmDelete",
			"click .confirm-delete-btn" : "_delete",
			"click .toggle-edit-btn" : "toggleUpdate",
			"click .edit-btn" : "_update",
			"keypress .editable" : "enterHandler",
			"click .post-link" : "linkClickHandler"
		},

		template: _.template($("script#pin-template").html()),

		initialize: function(){
			_.bindAll(this, "render");
			this.model.bind('change', this.render);
		},

		render: function(){
			this.$el.addClass("post thumbnail");

			var parser	= document.createElement('a');
			parser.href = this.model.get("link");

            var html = this.template(this.model.attributes);

			this.$el.html(html)
					.find(".count-tooltip")
						.tooltip({'placement': 'left'});

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
						.first().focus().end().end()
					.find('.post-link')
						.html(this.model.get('link')).end();
		},

		_update: function(){
			var self = this ;

			var parser = document.createElement('a');
			parser.href = this.model.get("link");
			var link = parser.hostname || "/!\\ Invalid link !" ;

			this.$el.find('.editable')
						.each(function(key, attribute){
							self.model.set($(attribute).attr('for'), $(attribute).html());
						})
						.attr('contenteditable', false).end()
					.find('.edit-btn')
						.toggleClass('toggle-edit-btn edit-btn')
						.html('edit').end()
					.find('.post-link')
						.html(link).end();

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

		linkClickHandler: function(){
			this.model.set('count', 1*this.model.get('count') + 1 );
			this.model.save();
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

	var PostSearchList = Backbone.Collection.extend({
		model: Post,
		url: function(){
			return new PostList().url+'search/';
		}
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
			"click #close-post-btn" : 'resetPostFields',
			"submit #search-form" : 'search',
			"click #scroll-top" : 'scrollTopHandler'
		},

		initialize: function(){
			var self = this ;

			this.posts = new PostList();
			this.posts.fetch({success:function(){
				self.render();
			}});
			$(window).scroll(this.initScrollTop);

		},

		render: function(){
			var posts = $("#post-list").empty();
			var self = this;
			_.each(this.posts.models, function(post){
				self.add_post(post);
			});
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

			post.set('created', new Date().getTime()/1000);

			post.save(null,{ success: function(){
				self.add_post(post);
			}});
		},

		add_post : function(post){
			var postView = new PostView({model:post}),
				self = this,
				$el = postView.render().$el;

			this.$el.find("#post-list").prepend($el);
			this.posts.add(post);

			if(post.get('img'))
				$el.find('img').load(function(){
					self.layout();
				});
			else
				self.layout();

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
			// TODO : refactor, this function is very ugly
			if($("#new-post-link").val().trim() === ""){
				return;
			}

			var $input = $("#new-post-link"),
				link = $input.val(),
				isUrl = link.match(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi),
				$title_input = $('input[name=title]').attr('disabled',true),
				$gallery = $("#remote-gallery").empty();

			if(isUrl){
				$("#link-input-control-group").removeClass("error");

				var $alert = $("<div>")
									.addClass('alert alert-info no-image-alert ')
									.html("We are looking for images in your link ...")
									.appendTo($("#remote-gallery")
									.empty());

				$.ajax({
					url : '/fetch',
					data: {
						url : $input.val()
					},
					success : function(page_info){
						var urls = page_info.imgs || [];
						if($title_input.val().trim() === "") {
							$title_input.val(page_info.title);
							$("#new-post-tags").focus();
						} else {
							$title_input.focus();
						}
						$title_input.attr('disabled',false);
						$gallery = $gallery.empty();
						_.each(urls, function(url){
							var $img = $("<img>").attr({'src': url});
							// TODO: use masonry to layout remote galery ??
							$('<span>').html($img).addClass('thumbnail').appendTo($gallery);
						});

						if(urls.length === 0){
							$("<div>")
									.addClass('alert no-image-alert')
									.html("<strong>CRAP</strong> No picture was found on this url")
									.appendTo($gallery);
						} else {
							var $firstImg = $("#remote-gallery span").first();
							$firstImg.addClass('selected');
							$('#new-post-hidden-img').val($firstImg.find('img').attr('src'));
						}
					},
					error : function(xhr){
						var message;
						if(xhr.status === 404){
							message = "this URL seems to be unreachable";
						} else {
							message = "something very bad just happened";
						}
						$title_input.attr('disabled',false);
						$("#link-input-control-group").addClass("error");
						var $alert = $("<div>").addClass('alert alert-error no-image-alert')
													.html("<strong>OOPS</strong> "+message)
													.appendTo($gallery.empty());
					}
				});
			} else {
				$("#link-input-control-group")
						.addClass("error");
				$("<div>")
						.addClass('alert alert-error no-image-alert')
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
		},

		search: function(){
			var self   = this ,
				search = $("#search-form input").val();

			if(search.trim() === ""){
				Pinner.initialize(); // UGLY
				return false;
			}

			var posts = new PostSearchList({search:search});

			posts.fetch({data : {
				search : search
			}, success:function(){
				console.log(posts);
			}});

			return false;
		},

		initScrollTop : function(){
			var pos = $("#post-list").position();
			var width = $("#post-list").outerWidth();
			var widthElem = $("#scroll-top").outerWidth();
			var wTop = $(document).scrollTop();
			if (wTop === 0){
				$("#scroll-top").slideUp();
			} else {
				$("#scroll-top").css("left", (pos.left + width - widthElem)).slideDown();
			}

		},

		scrollTopHandler: function(){
			$("html, body").animate({ scrollTop: 0 });
			return false;
		}
	});

	var Pinner = new PinnerView();

	// var bookmarkletJS  = "javascript:(function(){";
	//	bookmarkletJS += "var js=document.createElement('script');js.setAttribute('src', '"+document.location.origin+"/javascripts/bookmarklet.js');document.body.appendChild(js);";
	//	bookmarkletJS += "var app=document.createElement('link');app.setAttribute('rel', 'stylesheet');app.setAttribute('href', '"+document.location.origin+"/stylesheets/style.css');document.body.appendChild(app);";
	//	// bookmarkletJS += "var app=document.createElement('script');app.setAttribute('src', '"+document.location.origin+"/javascripts/app.js');document.body.appendChild(app);";
	//	bookmarkletJS += "}());";
	// $("#bookmarklet").attr('href',bookmarkletJS );

});
