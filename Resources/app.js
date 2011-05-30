/*global Ti: true, Ti.UI: true */

Ti.include("/assets/kralib.js");
Ti.include("/assets/pubsubhottub.js");
Ti.include("/cognitus/cognitus.js");

Ti.UI.setBackgroundColor('#FFF');

var appstructure;
appstructure = [{
	pageid: "home"
},
{
	navtextid: "tab_skill",
	navto: "aboutmodules",
	sub: [{
		pageid: "aboutmodules"
	},
	{
		pageid: "modulelist",
		view: C.ui.createModuleListView(),
		sub: [{
			pageid: "moduleexplanation",
			using: "module"
		},
		{
			pageid: "moduleskillist",
			using: "module",
			view: C.ui.createModuleSkillListView(),
			sub: [{
				using: "skill",
				pageid: "skillrational"
			},
			{
				using: "skill",
				pageid: "skilldescription"
			},
			{
				using: "skill",
				pageid: "skillpractice"
			}]
		},
		{
			navtextid: "tab_moduletrain",
			navto: "moduletraininstruction",
			sub: [{
				using: "module",
				pageid: "moduletraininstruction"
			},
			{
				using: "module",
				pageid: "moduletrainsession",
				view: C.ui.createModuleTrainSessionView()
			},
			{
				using: "module",
				pageid: "moduletrainhistory",
				view: C.ui.createModuleTrainHistoryView()
			}]
		}]
	},
	{
		pageid: "mylists",
		view: C.ui.createMyListsView(),
		sub: [{
			pageid: "skillist",
			view: C.ui.createSkillListView(),
			using: "list"
		}]
	}]
},
{
	navtextid: "tab_crisis",
	navto: "crisis",
	sub: [{
		pageid: "crisis",
		view: C.ui.createCrisisView()
	}]
},
{
	navtextid: "tab_about",
	navto: "about",
	sub: [{
		pageid: "about"
	},
	{
		pageid: "newslist",
		view: C.ui.createNewsListView(),
		sub: [{
			using: "news",
			pageid: "newsitem",
			view: C.ui.createNewsItemView()
		}]
	}]
}];

C.state.mainWindow = C.ui.createAppWindow(appstructure);
C.state.mainWindow.open();

pb.pub("/appstart");



function forceLoad() {
	Ti.UI.createActivityIndicator();
	Ti.UI.createAlertDialog();
	Ti.UI.createAnimation();
	Ti.UI.createButton();
	Ti.UI.createButtonBar();
	Ti.UI.createEmailDialog();
	Ti.UI.createImageView();
	Ti.UI.createLabel();
	Ti.UI.createOptionDialog();
	Ti.UI.createPicker();
	Ti.UI.createProgressBar();
	Ti.UI.createScrollableView();
	Ti.UI.createSlider();
	Ti.UI.createSwitch();
	Ti.UI.createTab();
	Ti.UI.createTabGroup();
	Ti.UI.createTabbedBar();
	Ti.UI.createTableView();
	Ti.UI.createTableViewRow();
	Ti.UI.createTableViewSection();
	Ti.UI.createTextArea();
	Ti.UI.createTextField();
	Ti.UI.createToolbar();
	Ti.UI.createView();
	Ti.UI.createWebView();
	Ti.UI.createWindow();
}
