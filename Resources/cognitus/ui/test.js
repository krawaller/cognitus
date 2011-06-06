xhr = {
	get: function(url,callback){
		var c = Titanium.Network.createHTTPClient();
		c.open("GET",url);
		c.onload = function(){
			callback(this.responseData);
		};
		c.send();
	}
};

C.ui.createTestView = function(o){
	var view = C.ui.createPage({});
	var spinner = Ti.UI.createActivityIndicator({
		height: 50,
		width: 50,
		top: 200,
		style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK
	});
	view.add(spinner);
	var btn = K.create({
		k_type: "Button",
		top: 60,
		left: 40,
		title: "Uppdatera från servern...",
		height: 30,
		width: 200,
		k_click: function(e){
			spinner.show();
			var maxlast = C.content.getMaxLastUpdated();
			Ti.API.log("MAX: "+maxlast);
			label.text = "Laddar...";
			btn.enabled = false;
			btn.opacity = 0.5;
			xhr.get("http://cognitus.krawaller.se/api/texts?lastupdated="+maxlast,function(data){
				btn.opacity = 1;
				btn.enabled = true;
				data = JSON.parse(data);
				Ti.API.log([data,typeof data,data.length,data[0]]);
				label.text = "Hämtade "+data.length+" nya poster";
				spinner.hide();
				C.content.receiveTextsFromServer(data);
				pb.pub("/updatetext");
			});
		}
	});
	view.add(btn);
	var label = Ti.UI.createLabel({
		top: 100,
		left: 40,
		height: 30,
		text: "..."
	});
	view.add(label);
	return view;
};