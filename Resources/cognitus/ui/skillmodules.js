C.ui.createModulesView = function(o){
	function render(){
		
	};
	var modules = ["Mindfulness","Distress Tolerance"];
	var view = C.ui.createPage({
		ViewId: "modulesView",
		ViewTitle: "Modules",
		backgroundColor: "gold",
		render: render,
		k_children: [{
			k_type: "TableView",
			data: [0,1].map(function(e){
				return {
					label: modules[e],
					listitemnumber: e
				};
			}),
			k_click: function(e){
				pb.pub("/navto",(["mindfulnessview","distresstoleranceview"])[e.row.listitemnumber]);
			}
		}]
	});
	view.add( K.create({k_type:"Label",text:"All modules"}) );
	return view;
};