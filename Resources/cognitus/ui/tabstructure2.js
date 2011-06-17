/*
Version with only one set of tabs


Tabstructure constructor receives lists & pages as argument. returns container with tabthings. 
Responsible for subscribing to the navto event and redraw the tabs when that happens. 
Tabs should of course also fire proper navto event.

Listens to:
	settabrowheight
	orientationchange (native event)
	updatetabs        (fired from navto bits)


*/

C.ui.createTabStructure = function(lists, pages) {
	// tab stuff
	var tabrows = [],
		rowbigheight = 40,
		rowdefaultheight = 25,
		rowheight, btnwidth = 90,
		firstrowbtnwidth = 68,
		btnspace = 10;
	Ti.App.Properties.setInt("tabrowheight", Ti.App.Properties.getInt("tabrowheight") || rowbigheight);
	rowheight = Ti.App.Properties.getInt("tabrowheight");
	
	var container = K.create({
		k_type: "View",
		bottom: 0,
		width: Ti.Platform.displayCaps.platformWidth,
		height: Ti.Platform.displayCaps.platformWidth,
		k_click: function(e){
			//Ti.API.log(["clicked the button woo!",e.source,e.source && e.source.navto, e.source && e.source.selected]);
			if (e.source && e.source.navto){ // && !e.source.selected){
				pb.pub("/navto",e.source.navto);
			}
		}
	});
	
	
	[0, 1, 2, 3, 4].forEach(function(row) {
		var tabrow = K.create({
			k_type: "View",
			height: rowheight,
			backgroundColor: ["#AAA", "#BBB", "#CCC", "#DDD", "#EEE"][row],
			bottom: row * rowheight,
			k_children: [{
				k_type: "View",
				height: 1,
				top: 0,
				backgroundColor: "#000"
			}]
		});
		var buttons = [];
		[0, 1, 2, 3].forEach(function(col) {
			var btn = K.create({
				k_type: "View",
				k_style: "NavButtonView",
				k_id: "button",
				k_children: [{
					k_type: "View",
					borderSize: 1,
					borderColor: "#000",
					width: 1,
					left: 0
				},
				{
					k_type: "View",
					borderSize: 1,
					borderColor: "#000",
					width: 1,
					right: 0
				},
				{
					k_type: "View",
					borderSize: 1,
					borderColor: "#000",
					height: 1,
					bottom: 0
				},
				{
					k_id: "label",
					k_type: "Label",
					height: rowheight - 5,
					width: row ? btnwidth : firstrowbtnwidth
				}],
				height: rowheight - 5,
				width: row ? btnwidth : firstrowbtnwidth,
				top: 0,
				left: btnspace + ((row ? btnwidth : firstrowbtnwidth) + btnspace) * col + 15 * ((row) % 2)
			});
			pb.sub("/updatetext",function(){
				var label = btn.k_children.label;
				if (btn.visible){
					label.text = C.content.getText(label.navtextid)+label.suffix;
				}
			});
			buttons.push(btn);
			tabrow.add(btn);
		});
		tabrow.buttons = buttons;
		tabrows.push(tabrow);
		container.add(tabrow);
	});


	function updateTabs(page){
		var start = Date.now();
				var bgcolours = ["#666","#777","#888","#999","#AAA","#BBB","#CCC","#DDD","#EEE","#FFF"],
					numrows = page.listhistory.length;
				//Ti.API.log(["going to show these tabs",page.listhistory,"with these positions",page.listpositions]);
				tabrows.forEach(function(tabrow,i){
					if (i < page.listhistory.length){ // this level is shown!
						var list = lists[page.listhistory[i]];
						//Ti.API.log("Tabrow "+i+" set to listid "+page.listhistory[i]+", which has "+list.length+" tabs");
						tabrow.listid = page.listhistory[i];
						tabrow.backgroundColor = (i === 0 ? "transparent" : bgcolours[bgcolours.length - 1 - numrows*2 + i*2]);
						tabrow.buttons.forEach(function(btn,j){
							//var label = btn.k_children.label;
							var label = btn.k_child_label;
							if (j<list.length && list[j]){
								btn.visible = true;
								label.text = C.content.getText(list[j].navtextid)+list[j].suffix;
								label.suffix = list[j].suffix;
								label.navtextid = list[j].navtextid;
								btn.navto = list[j].navto;
								label.navto = list[j].navto;
								if (j==page.listpositions[i]){
									label.font = {
										fontWeight: "bold",
										fontSize: 10
									};
									btn.selected = true;
									label.selected = true;
									btn.backgroundColor = bgcolours[bgcolours.length - 1 - numrows*2 + i*2 + 2];
									btn.top = 0;
								} else {
									btn.selected = false;
									label.selected = false;
									label.font = {
										fontWeight: "normal",
										fontSize: 10
									};
									btn.top = 1;
									btn.backgroundColor = bgcolours[bgcolours.length - 1 - numrows*2 + i*2 + 1];
								}
							} else {
								btn.visible = false;
							}
						});
					} else { // hide the tabrow;
					}
				});
		//		frame.bottom = rowsshowing*Ti.App.Properties.getInt("tabrowheight");
		Ti.API.log("CHANGED TABS IN " + (Date.now() - start));
	}
			
	var showingtabs = true;

	// interactivity
	pb.sub("/updatetabs", function(pageid) {
		updateTabs(pages[pageid]);
	});
	
	Ti.Gesture.addEventListener('orientationchange', function(e){
		C.state.orientation = ((e.source.orientation === Titanium.UI.LANDSCAPE_LEFT) || (e.source.orientation === Titanium.UI.LANDSCAPE_RIGHT) ? "landscape" : "portrait");
		Ti.API.log("changing! "+C.state.orientation);
		if (C.state.orientation === "landscape"){
			container.right = 0;
			container.transform = Ti.UI.create2DMatrix({rotate:-90});
			//container.width = Ti.Platform.displayCaps.platformHeight;
		} else {
			container.transform = Ti.UI.create2DMatrix({rotate:0});
			delete container.right;
			//container.width = Ti.Platform.displayCaps.platformWidth;
			container.bottom = 0;
		}
	});
	
	pb.sub("/settabrowheight", function(newh){
		tabrows.forEach(function(row,i){
			row.height = newh;
			row.bottom = i*newh;
			row.buttons.forEach(function(btn){
				btn.height = newh - 5;
			});
		});
	});
	
	

	return container;
};
