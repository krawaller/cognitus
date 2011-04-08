C.ui.createModulesView = function(o){
	function render(){
		
	};
	var view = C.ui.createPage({
		ViewId: "modules",
		ViewTitle: "Modules",
		backgroundColor: "gold",
		render: render
	});
	view.add( C.ui.createLabel("modules_description",{height:100,top:70}) );
	return view;
};