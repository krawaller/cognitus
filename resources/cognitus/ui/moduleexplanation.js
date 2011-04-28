C.ui.createModuleExplanationView = function(o){
	var view = C.ui.createPage({});
	var titlelabel = K.create({
		k_type: "Label",
		height: 20,
		top: 50
	});
	var webview = C.ui.createWebView({top:30});
	view.add(titlelabel);
	view.add(webview);
	view.render = function(args){
		titlelabel.text = C.content.getText("module_"+args.ModuleId+"_title");
		C.ui.updateWebView(webview,C.content.getText("module_"+args.ModuleId+"_description"));
	};
	view.using = "ModuleId";
	return view;
};