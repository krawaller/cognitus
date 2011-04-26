Ti.include("/assets/kralib.js");
Ti.include("/assets/pubsubhottub.js");
Ti.include("/cognitus/cognitus.js");

Titanium.UI.setBackgroundColor('#FFF');

var appstructure = [{
	navtextid: "skilltab",
	navto: "aboutmodules",
	sub: [{
		pageid: "aboutmodules",
		view: C.ui.createAboutModulesView()
	},{
		pageid: "modulelist",
		view: C.ui.createModuleListView(),
		sub: [{
			pageid: "moduleexplanation",
			view: C.ui.createModuleExplanationView()
		},{
			pageid: "moduleskillist",
			view: C.ui.createModuleSkillListView(),
			sub: [{
				pageid: "skillexplanation",
				view: C.ui.createSkillExplanationView()
			},{
				pageid: "skillexercises",
				view: C.ui.createSkillExercisesView()
			},{
				pageid: "skillexamples",
				view: C.ui.createSkillExamplesView()
			}]
		}]
	}]
},{
	pageid: "crisis",
	view: C.ui.createCrisisView()
}];

C.state.mainWindow = C.ui.createAppWindow(appstructure);
C.state.mainWindow.open();

pb.pub("/appstart");