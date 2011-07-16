/*global Ti: true, Ti.UI: true */

var C = {
	state: {lang:"sv",history:[],historyposition:-1,showingTabs:true}
};

Ti.include("/assets/kralib.js",
		   "/assets/pubsubhottub.js",
		   "/cognitus/content2.js",
		   "/cognitus/utils.js",
		   "/cognitus/ui/ui.js");

K.setStyles(C.ui.properties);

//Ti.UI.setBackgroundColor('#00F');
Ti.UI.setBackgroundImage('Default.png');
//Ti.API.log(Ti.Filesystem.resourcesDirectory+'/iphone/Default.png');



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
				pageid: "moduletrainsessionlist",
				view: C.ui.createModuleTrainSessionListView(),
				sub: [{
					pageid: "moduletrainsession",
					view: C.ui.createModuleTrainSessionView(),
					using: ["trainsession","module"]
				}]
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
	pageid: "crisis",
	view: C.ui.createCrisisView()
	/*navtextid: "tab_crisis",
	navto: "crisis",
	sub: [{
		pageid: "crisis",
		view: C.ui.createCrisisView()
	}]*/
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
			pageid: "newsitem"
			//, view: C.ui.createNewsItemView()
		}]
	},{
		pageid: "test",
		view: C.ui.createTestView()
	}]
}];

C.state.mainWindow = C.ui.createAppWindow(appstructure);
C.state.mainWindow.open();

pb.pub("/appstart");

//C.content.test();

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
	Ti.UI.createScrollView();
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
