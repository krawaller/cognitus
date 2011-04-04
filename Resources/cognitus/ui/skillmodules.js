C.ui.createModulesView = function(o){
	function render(){
		
	};
	var view = C.ui.createPage({
		ViewId: "modulesView",
		ViewTitle: "Modules",
		backgroundColor: "gold",
		render: render
	});
	view.add( K.create({k_type:"Label",text:"All modules"}) );
	return view;
};