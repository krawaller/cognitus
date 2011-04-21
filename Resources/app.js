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
			view: C.ui.createAboutModulesView()
		},{
			pageid: "modulelist",
			view: C.ui.createModuleListView(),
			sub: {
				listid: "moduleinfo",
				back: {
					pageid: "modulelist",
					navtextid: "backtomodulelist_nav"
				},
				pages: [{
					pageid: "moduleexplanation",
					view: C.ui.createModuleExplanationView()
				},{
					pageid: "moduleskillist",
					view: C.ui.createModuleSkillListView(),
					sub: {
						listid: "skillinfo",
						back: {
							pageid: "moduleskillist",
							navtextid: "moduleskillist_nav"
						},
						pages: [{
							pageid: "skillexplanation",
							view: C.ui.createSkillExplanationView(),
						},{
							pageid: "skillexercises",
							view: C.ui.createSkillExercisesView()
						},{
							pageid: "skillexamples",
							view: C.ui.createSkillExamplesView()
						}]
					}
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