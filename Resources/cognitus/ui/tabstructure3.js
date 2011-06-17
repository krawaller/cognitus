/*
Version with webview tabs


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
	var tabrows = [];
	Ti.App.Properties.setInt("tabrowheight", Ti.App.Properties.getInt("tabrowheight") || rowbigheight);
	rowheight = Ti.App.Properties.getInt("tabrowheight");
	var webviewmaster = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory+"/cognitus/html/tabs.html").read().text;
	
	var container = K.create({
		k_type: "View",
		bottom: 0,
		backgroundColor: "red",
		width: Ti.Platform.displayCaps.platformWidth,
		height: Ti.Platform.displayCaps.platformWidth,
	});
	var webview = Ti.UI.createWebView({
	//	scalesPageToFit:true,
	   // contentWidth:'auto',
	  //  contentHeight:'auto',
		height: 180,
		backgroundColor: "green",
		bottom: 0
	});
	container.add(webview);
	
	function updateTabs(page){
		var start = Date.now();
		var numrows = page.listhistory.length, r, t, classes, numtabs, html = "", list, rowheight = 40;
		webview.height = numrows * rowheight;
		for(r = 0; r<numrows; r++){
			list = lists[page.listhistory[r]];
			classes = 'row row' + (r ? "depth"+(numrows-r) :"bottom");
			html += "<div class='"+classes+"'>";
			numtabs = list.length;
			for(t = 0; t<numtabs; t++){
				classes = 'tab';
				if (t==page.listpositions[r]){
					classes += ' tabselected';
				}
				html += "<a href='#' class='"+classes+"' navto='"+list[t].navto+"'>"+C.content.getText(list[t].navtextid)+list[t].suffix+"</a>";
			}
			html += "</div>"; // close row;
		}
		Ti.API.log(html);
		webview.html = webviewmaster.replace(/XXXCONTENTXXX/,html);
		Ti.API.log("CHANGED TABS IN " + (Date.now() - start));
	}
	
	Ti.App.addEventListener("tabnavto",function(e){
		Ti.API.log("TABNAVTO!");
		Ti.API.log(e);
	});
	
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
		/*tabrows.forEach(function(row,i){
			row.height = newh;
			row.bottom = i*newh;
			row.buttons.forEach(function(btn){
				btn.height = newh - 5;
			});
		});*/
	});

	return container;
};
