/*
Version with per-page sets of tabs

Tabstructure receives lists & pages as argument. returns container with tabthings. 
Responsible for subscribing to the navto event and redraw the tabs when that happens. 
Tabs should of course also fire proper navto event.

*/



/*
LISTS is object with listid keys, values are arrays of objs like:
{
    navtextid: (page.navtextid) || (page.pageid+"_nav"),
	suffix: page.sub ? !page.view ? " ↑" : " •" : "",
    navto: (page.navto) || (page.pageid),
	level: level
}

PAGES is object with pageid keys, values are objects like:
{
	view: o.view,
	listid: listid,
	listhistory: [].concat(listhistory), // must be copy             // [listid,listid,listid]
	listpositions: [].concat(listpositions), // copy                 // [listposition,listposition,listposition]
	listhistorystring: [].concat(listhistory).join(","),
	level: level,
	using: (o.using) || (""),
	pageid: o.pageid,
	basic: !o.view
}

*/


C.ui.createTabStructure = function(lists,pages){
	var container, structs = {}, rowheight;
	var btnwidth = 90, firstrowbtnwidth = 68, btnspace = 10, rowbigheight = 40;
	var bgcolours = ["#777","#888","#999","#AAA","#BBB","#CCC","#DDD","#EEE","#FFF"];
	Ti.App.Properties.setInt("tabrowheight",Ti.App.Properties.getInt("tabrowheight") || rowbigheight);
	rowheight = Ti.App.Properties.getInt("tabrowheight");
	container = K.create({
		k_type: "View",
		bottom: 0,
		k_click: function(e){
			//Ti.API.log(["clicked the button woo!",e.source,e.source && e.source.navto, e.source && e.source.selected]);
			if (e.source && e.source.navto){ // && !e.source.selected){
				pb.pub("/navto",e.source.navto);
			}
		},
		k_children: (function(){
		  var ret = [];
		  for(var pageid in pages){
			var page = pages[pageid], listhistory = page.listhistory, numrows = page.listhistory.length;
			ret.push({
				k_type: "View",
				bottom: 0,
				visible:false,
				k_id: "page_"+page.pageid,
				k_children: listhistory.map(function(listid,rownumber){
//Ti.API.log["TABROW!",pageid,rownumber];
					var list = lists[listid],
						rowbasecolournumber = bgcolours.length - 1 - numrows*2 + rownumber*2;
					return {
						k_type: "View",
						height: rowheight,
						bottom: rownumber * rowheight,
						rownumber: rownumber,
						k_subs: {
							"/settabrowheight":function(e,newrowheight){
								e.height = newrowheight;
								e.bottom = rownumber * newrowheight;
							}
						},
						k_id: "row_"+rownumber,
						backgroundColor: rownumber ? bgcolours[rowbasecolournumber] : "transparent",
						k_children: [{
							k_type: "View",
							height: 1,
							top: 0,
							backgroundColor: "#000"
						}].concat(list.map(function(tabdef,colnumber){
//Ti.API.log(["TAB!",pageid,rownumber,colnumber,list[colnumber].navto]);
							var selected = (colnumber === page.listpositions[rownumber]);
							return {
								k_type: "View",
								k_subs: {
									"/settabrowheight":function(e,newrowheight){
										e.height = newrowheight - 5;
									}
								},
								height: rowheight - 5,
								width: rownumber ? btnwidth : firstrowbtnwidth,
								left: btnspace+((rownumber ? btnwidth : firstrowbtnwidth)+btnspace)*colnumber + 15*((rownumber)%2),
								top: selected ? 0 : 1,
								backgroundColor: bgcolours[rowbasecolournumber + (selected ? 2 : 1)],
								k_id: "col_"+colnumber,
								k_children: [{
									k_type: "View",
									borderSize: 1,
									borderColor: "#000",
									width: 1,
									left: 0
								},{
									k_type: "View",
									borderSize: 1,
									borderColor: "#000",
									width: 1,
									right: 0
								},{
									k_type: "View",
									borderSize: 1,
									borderColor: "#000",
									height: 1,
									bottom: 0
								},{
									k_id: "label",
									k_type: "Label",
									height: rowheight - 5,
									navto: list[colnumber].navto,
									pageid: pageid,
									selected: selected,
									width: rownumber ? btnwidth : firstrowbtnwidth,
									textid: lists[listid].navtextid,
									text: C.content.getText(list[colnumber].navtextid) + list[colnumber].suffix,
									font: {
										fontWeight: selected ? "bold" : "normal",
										fontSize: 10
									},
									k_subs: {
										"/updatetext": function(e){
											e.text = C.content.getText(list[colnumber].navtextid) + list[colnumber].suffix;
										},
										"/settabrowheight":function(e,newtabrowheight){
											e.height = newtabrowheight;
										}
									}
								}]
							};
						}))
					};
				})
			});
		  }
		  return ret;
		}())
	});
	var nowshowing = 0;
	pb.sub("/navto",function(pageid){
		if (C.state.showingTabs){
			C.state.frame.top = 40;
			//C.state.frame[Titanium.Gesture.orientation.isPortrait() ? "bottom" : "right"] = pages[pageid].listhistory.length * Ti.App.Properties.getInt("tabrowheight");
			C.state.frame["bottom"] = pages[pageid].listhistory.length * Ti.App.Properties.getInt("tabrowheight");
		}
		if (nowshowing){
			nowshowing.visible = false;
		}
		container.k_children["page_"+pageid].visible = true;
		nowshowing = container.k_children["page_"+pageid];
	});
	
	pb.sub("/showchrome",function(){
		
	});
	pb.sub("/hidechrome",function(){
		
	});
/*	Ti.Gesture.addEventListener("orientationchange",function(e){
		if (e.source.isPortrait()){
			if (C.state.showingTabs){
//s				C.state.frame.bottom = 
			}
		} else {
			
		}
	})*/
Ti.API.log("returning container");
	return container;
};