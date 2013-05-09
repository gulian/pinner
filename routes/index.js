exports.index = function(req, res){
  res.render('index', { title: 'Pinner' , str:'{{str}}'});
};