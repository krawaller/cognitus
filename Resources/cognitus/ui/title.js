(function(){

	C.ui.createTitleView = function(){
		var titleview = K.create({
	        k_type: "View",
	        height: 60,
	        top: 1,
			backgroundColor: "yellow",
			zIndex: 5,
	        k_children: [{
				k_type: "ImageView",
				image: Ti.Filesystem.resourcesDirectory +"/images/headline3.png",
				height: 15,
				bottom: 10
			}]
	    });
	
		var supertitle = C.ui.createLabel(undefined,{
			top: 0,
			k_class: "titlesuperlabel"
		});
		titleview.add(supertitle);
		
		var maintitle = C.ui.createLabel(undefined,{
			top: 14,
			k_class: "titlemainlabel"
		});
		titleview.add(maintitle);
	
		var editfield = C.ui.createTextField({
			visible: false,
			top: 2,
			width: 230,
		});
		titleview.add(editfield);
		editfield.addEventListener("change",function(e){
			//Ti.API.log("new value: "+e.value);
			pb.pub("/newtitleeditvalue",e.value);
		});
	
		function setTitle(main,sup){
			maintitle.text = main;
			supertitle.text = sup;
			//titleview.k_children.maintitle.top = (sup ? 12 : 7);
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
		pb.sub("/showtitleedit",function(val,hint){
			editfield.value = val;
			editfield.hintText = hint;
			editfield.visible = true;
			supertitle.visible = false;
			maintitle.visible = false;
		});
		pb.sub("/hidetitleedit",function(){
			editfield.blur();
			editfield.visible = false;
			supertitle.visible = true;
			maintitle.visible = true;
		});
		return titleview;
	};
	
})();