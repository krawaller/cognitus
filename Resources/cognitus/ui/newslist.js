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
		var news = C.content.getNewsList();
		Ti.API.log("KSDAÖKDKSA");
		Ti.API.log(news);
		Ti.API.log("KSDAÖKDKSA");
		Ti.API.log(C.content.dbSinglePropQuery("SELECT count(*) as c FROM texts WHERE textid LIKE 'news_html_%'","c"));
		Ti.API.log(C.content.dbSinglePropQuery("SELECT count(*) as c FROM newswithdetails","c"));
		table.setData(news.map(function(n){
			 return K.create({
				hasChild: true,
				k_type: "TableViewRow",
				NewsId: n.created,
				k_children: [{
					k_type: "Label",
					top: 0,
					left: 20,
					textAlign: "left",
					font: {
						fontSize: 10
					},
					text: K.dateFormat(Date(n.created*1000),"yyyy-mm-dd")
				},{
					k_type: "Label",
					top: 12,
					left: 5,
					textAlign: "left",
					font: {
						fontSize: 15,
						fontWeight: "normal"
					},
					text: C.content.getText("news_title_"+n.created)//n["title_"+C.state.lang]
				}]
			});
		}));
	};
	return view;
};