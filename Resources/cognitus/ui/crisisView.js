C.ui.createCrisisView = function(o){
	function render(){
		
	};
	var view = C.ui.createPage({
		ViewId: "crisisView",
		ViewTitle: "Crisis!",
		backgroundColor: "blue",
		render: render
	});
	view.add( K.create({k_type:"Label",text:"Ack, help me!"}) );
	return view;
};