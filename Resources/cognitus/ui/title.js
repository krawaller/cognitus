(function(){

	C.ui.createTitleView = function(){
		var titleview = K.create({
	        k_type: "View",
	        height: 35,
	        top: 5,
	        width: 200,
	        left: 50,
	        borderWidth: 1,
			zIndex: 5,
	        borderColor: "#000",
	        backgroundColor: "#CCC",
	        k_children: [,{
				k_id: "supertitle",
				k_type: "Label",
				font: {fontSize:10},
				top: 0
			},{
				top: 12,
				k_type: "Label",
				k_id: "maintitle",
	            font: {fontSize:14,fontWeight:"bold"}
	        }]
	    });
		function setTitle(main,sup){
			titleview.k_children.maintitle.text = main;
			titleview.k_children.supertitle.text = sup;
			titleview.k_children.maintitle.top = (sup ? 12 : 7);
		};
		function generateNewTitle(){
			var newtitle = C.utils.getPageTitle();
			setTitle(newtitle.main,newtitle.sup);
		}
	    pb.sub("/updatetext", generateNewTitle);
		pb.sub("/updatetitle", generateNewTitle);
	    pb.sub("/setnewtitle", setTitle);
		pb.sub("/showtitle",function(){titleview.visible = true;});
		pb.sub("/hidetitle",function(){titleview.visible = false;});
		return titleview;
	};
	
})();