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

		initialize: function(){
			_.bindAll(this, "render");
			this.model.bind('change', this.render);
            this.pinTemplate = _.template($("script#pin-template").html());
		},

		render: function(){
					console.log("render-post");

			this.$el.addClass("post thumbnail");
			// TODO: use mustache.js template engine

			var parser	= document.createElement('a');
			parser.href = this.model.get("link");

            // Templating magic TODO the template shouldn't be retemplated every render.
            var context = this.buildPinContext(this.model);
            var html = this.pinTemplate(context);
            //console.log(this.el);
			this.$el.html(html)
					.find(".count-tooltip")
						.tooltip({'placement': 'left'});

			return this;
		},

        /**
         * Builds the mustache context for the provided model entity.
         * @param model the pin entity
         * @return JSON the context for mustache to render the pin.
         */
        buildPinContext: function(model) {
            var context = {
                pin_img_src: this.model.get("img"),
                pin_title: this.model.get("title"),
                pin_count: this.model.get("count"),
                pin_link: this.model.get("link"),
                pin_created: this.model.get("created") 
            };
            context['tags'] = [];
            if (this.model.get("tags") != "") {
                _.each(this.model.get("tags").split(','), function (tag) {
                    context['tags'].push(tag);
                });
            }
            return context;
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