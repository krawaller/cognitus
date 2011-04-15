Ti.include("/assets/kralib.js");
Ti.include("/assets/pubsubhottub.js");
Ti.include("/cognitus/cognitus.js");

Titanium.UI.setBackgroundColor('#FFF');

var apptabs = [{
	textid: "skilltab",
	content: {
		listid: "skilltop",
		pages: [{
			pageid: "aboutmodules",
			navtextid: "aboutmodules_nav",
			view: C.ui.createAboutModulesView()
		},{
			pageid: "modulelist",
			navtextid: "modulelist_nav",
			view: C.ui.createModuleListView(),
			sub: {
				listid: "moduleinfo",
				back: {
					pageid: "modulelist",
					navtextid: "backtomodulelist_nav"
				},
				pages: [{
					pageid: "moduleexplanation",
					navtextid: "moduleexplanation_nav",
					view: C.ui.createModuleExplanationView()
				},{
					pageid: "moduleskillist",
					navtextid: "moduleskillist_nav",
					view: C.ui.createModuleSkillListView()
				}]
			}
		}]
	}
},{
	textid: "crisistab",
	content: {
		pageid: "crisis",
		view: C.ui.createCrisisView()
	}
}];

C.state.mainWindow = C.ui.createAppWindow(apptabs); //C.ui.createApplicationWindow();
C.state.mainWindow.open();

pb.pub("/appstart");