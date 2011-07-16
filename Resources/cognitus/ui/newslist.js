C.ui.createNewsListView = function(o){
	var view = C.ui.createPage({});
	view.add( C.ui.createLabel("newslist_description",{
		k_class: "descriptionlabel",
		left: 10,
		top:5
	}));
	var table = C.ui.createTableView({
		k_type: "TableView",
		top: 30,
		//style: Titanium.UI.iPhone.TableViewStyle.GROUPED,
		k_click: function(e){
			pb.pub("/navto","newsitem",{NewsId:e.row.NewsId});
		}
	});
	view.add(table);
	view.render = function(arg){
		//var news = C.content.getNewsList();
		table.setData(C.content.getNewsList().map(function(n){
			return C.ui.createTableViewRow({
				rightImage: "images/icons/goto_button.png",
				NewsId: n.created,
				rowtoplabel: K.dateFormat(Date(n.created*1000),"yyyy-mm-dd"),
				rowmainlabel: C.content.getText("news_title_"+n.created)
			});
		}));
	};
	return view;
};