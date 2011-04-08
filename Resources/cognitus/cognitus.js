var C = {};

(function() {
	C.state = {lang:"en"};
	C.getText = function(id){
		var lang = C.state.lang, texts = {
			modules_title: {
				en: "Modules",
				sv: "Moduler"
			},
			modules_description: {
				en: "All modules:",
				sv: "Alla moduler:"
			},
			distresstolerance_title: {
				en: "Distress Tolerance",
				sv: "Att stå ut"
			},
			distresstolerance_description: {
				en: "Gotta take it!",
				sv: "Stålsätt dig!"
			},
			mindfulness_title: {
				en: "Mindfulness",
				sv: "Här & nu"
			},
			mindfulness_description: {
				en: "Mindfulness is nice!",
				sv: "Måste vara här & nu!"
			},
			crisis_title: {
				en: "Crisis",
				sv: "Krishantering"
			},
			crisis_description: {
				en: "Ack, crisis! Danger danger!",
				sv: "Oops, nu är det kris!"
			}	
		};
		if (!texts[id][lang]){
			throw "No entry for "+id+" in language "+lang+"!";
		}
		return texts[id][lang];
	};
})();


Ti.include("/assets/kralib.js");
Ti.include("/cognitus/ui/ui.js");
K.setStyles(C.ui.properties);
