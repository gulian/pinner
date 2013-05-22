var PinnerView = Backbone.View.extend({

	el: "#Pinner",

	events : {
		"click #create-post-btn" : 'create_post',
		"keypress #new-post-tags" : 'tagsHandler',
		"blur #new-post-link" : 'linkHandler',
		"click #new-post-rendered-tags span" : "tagClickHandler",
		"click #remote-gallery img": "imageClickHandler",
		"click #cancel-post-btn" : 'resetPostFields',
		"click #close-post-btn" : 'resetPostFields',
		"submit #search-form" : 'search',
		"click #scroll-top" : 'scrollTopHandler',

	},

	initialize: function(){
		console.log("initialize");
		var self = this ;
		this.posts = new Posts();
		this.posts.fetch({success:function(){
			self.render();
		}});
		this.templateSearch = $("#nav-search").html();
		$(window).scroll(this.initScrollTop);

	},

	render: function(){
		console.log("render");

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
		var self = this , search_str = $("#search-form input").val();

		if(search_str.trim() === ""){
			$("#nav-search").hide();
			Pinner.initialize(); // UGLY
			return false;
		}

		// Design problem
		var PostListSearch = Backbone.Collection.extend({
			model: Post,
			url: "search?str="+search_str
		});
		this.posts = new PostListSearch();
		this.posts.fetch({success:function(){
			self.render();
		}});
		var html = Mustache.to_html( this.templateSearch, {str: $("#search-form input").val()});
		$("#nav-search").html(html).show();
		return false;
	},
	initScrollTop : function(){
		var pos = $("#post-list").position();
		var width = $("#post-list").outerWidth();
		var widthElem = $("#scroll-top").outerWidth();
		var wTop = $(document).scrollTop();
		if (wTop == 0){
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
