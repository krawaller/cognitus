Ti.include("/assets/kralib.js");
Ti.include("/assets/pubsubhottub.js");
Ti.include("/cognitus/cognitus.js");

Titanium.UI.setBackgroundColor('#FFF');

var appstructure = [{
	navtextid: "skilltab",
	navto: "aboutmodules",
	sub: [{
		pageid: "aboutmodules"
//		,view: C.ui.createAboutModulesView()
	},{
		pageid: "modulelist",
		view: C.ui.createModuleListView(),
		sub: [{
			pageid: "moduleexplanation",
			using: "module"
		//	,view: C.ui.createModuleExplanationView()
		},{
			pageid: "moduleskillist",
			using: "module",
			view: C.ui.createModuleSkillListView(),
			sub: [{
				using: "skill",
				pageid: "skillrational"
				//view: C.ui.createSkillExplanationView()
			},{
				using: "skill",
				pageid: "skilldescription"
				//view: C.ui.createSkillExercisesView()
			},{
				using: "skill",
				pageid: "skillpractice"
				//view: C.ui.createSkillExamplesView()
			}]
		},{
			navtextid: "moduletrain_nav",
			navto: "moduletraininstruction",
			sub: [{
				using: "module",
				pageid: "moduletraininstruction"
				//view: C.ui.createModuleTrainInstructionView()
			},{
				using: "module",
				pageid: "moduletrainsession",
				view: C.ui.createModuleTrainSessionView()
			},{
				using: "module",
				pageid: "moduletrainhistory",
				view: C.ui.createModuleTrainHistoryView()
			}]
		}]
	}]
},{
	navtextid: "crisistab",
	navto: "mycrisisskillist",
	sub: [{
		pageid: "mycrisisskillist",
		view: C.ui.createMyCrisisSkillListView()
	}]
}];

C.state.mainWindow = C.ui.createAppWindow(appstructure);
C.state.mainWindow.open();

pb.pub("/appstart");

function forceLoad(){
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
};
