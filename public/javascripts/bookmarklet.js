if (!($ = window.jQuery)) { // typeof jQuery=='undefined' works too  
	var jquery = document.createElement( 'script' );
	jquery.src = 'http://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.0/jquery.min.js';
	jquery.onload=loadBootstrapJS;
	document.body.appendChild(jquery);
} else {
	loadBootstrapJS();
}

function loadBootstrapJS(){
	var bootstrap = document.createElement( 'script' );
	bootstrap.src = 'http://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.3.1/js/bootstrap.min.js';
	bootstrap.onload=loadBootstrapCSS;
	document.body.appendChild(bootstrap);
}

function loadBootstrapCSS(){
	// <link rel="stylesheet" href="/stylesheets/bootstrap.css">

	var bootstrapcss = document.createElement( 'link' );
	bootstrapcss.rel = 'stylesheet';
	bootstrapcss.href = 'http://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.3.1/css/bootstrap.min.css';
	bootstrapcss.onload=openModal;
	document.body.appendChild(bootstrapcss);
}

function openModal() {

	var html = '<div id="addNewPinModel" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="addNewPinModelLabel" aria-hidden="true">';
		html += '<div class="modal-header"><h3 id="addNewPinModelLabel">Add new Pin</h3></div>';
		html += '<div class="modal-body">';
		html += '<form id="new-post-form" class="post">';
		html += '<div id="link-input-control-group" class="control-group">';
		html += '<div class="controls">';
		html += '<div class="input-prepend">';
		html += '<span class="add-on"><i class="icon-bookmark"></i></span>';
		html += '<input type="text" name="link" id="new-post-link" placeholder="Link">';
		html += '</div></div></div>';
		html += '<div class="input-prepend">';
		html += '<span class="add-on"><i class="icon-info-sign"></i></span>';
		html += '<input type="text" name="title"   placeholder="Title"></div>';
		html += '<div class="input-prepend">';
		html += '<span class="add-on"><i class="icon-tags"></i></span>';
		html += '<input id="new-post-tags" type="text" placeholder="Tags (comma separated)"></div>';
		html += '<div id="new-post-rendered-tags"></div>';
		html += '<input type="hidden" name="tags" id="new-post-hidden-tags" >';
		html += '<input type="hidden" name="img" id="new-post-hidden-img" >';
		html += '</form>';
		html += '<div id="remote-gallery"></div></div>';
		html += '<div class="modal-footer">';
		html += '<button id="cancel-post-btn" class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>';
		html += '<button id="create-post-btn" data-dismiss="modal" class="btn btn-success">Add</button>';
		html += '</div></div>';

	$('body').append(html);
	$('#addNewPinModel').modal();
}