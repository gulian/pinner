$(function(){

	"use strict";

	window.Post = Post;
	window.posts = new Posts();
	var Pinner = new PinnerView({posts: posts});
	posts.fetch();

	var bookmarkletJS  = "javascript:(function(){";
		bookmarkletJS += "var js=document.createElement('script');js.setAttribute('src', '"+document.location.origin+"/javascripts/bookmarklet.js');document.body.appendChild(js);";
		bookmarkletJS += "var app=document.createElement('link');app.setAttribute('rel', 'stylesheet');app.setAttribute('href', '"+document.location.origin+"/stylesheets/style.css');document.body.appendChild(app);";
		// bookmarkletJS += "var app=document.createElement('script');app.setAttribute('src', '"+document.location.origin+"/javascripts/app.js');document.body.appendChild(app);";
		bookmarkletJS += "}());";

	// $("#bookmarklet").attr('href',bookmarkletJS );
});
