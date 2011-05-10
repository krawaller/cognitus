C.ui.createNewsListView = function(o){
	var view = C.ui.createPage({});
	view.add( C.ui.createLabel(function(){return "newslist_description";},{height:100,top:20}) );
	var table = K.create({
		k_type: "TableView",
		top: 100,
		//style: Titanium.UI.iPhone.TableViewStyle.GROUPED,
		k_click: function(e){
			pb.pub("/navto","newsitem",{NewsId:e.row.NewsId});
		}
	});
	view.add(table);
	view.render = function(arg){
		table.setData(C.content.getNewsList().map(function(n){
			 return K.create({
				hasChild: true,
				k_type: "TableViewRow",
				NewsId: n.newsid,
				k_children: [{
					k_type: "Label",
					top: 0,
					left: 20,
					textAlign: "left",
					font: {
						fontSize: 10
					},
					text: n.date
				},{
					k_type: "Label",
					top: 12,
					left: 5,
					textAlign: "left",
					font: {
						fontSize: 15,
						fontWeight: "normal"
					},
					text: n.headline
				}]
			});
		}));
	};
	return view;
};