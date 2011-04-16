(function() {
	function updateMe(o,textid,textpropname){
		o[textpropname] = C.content.getText(K.isFunc(textid) ? textid() : textid);
	}
	var notes = JSON.parse(Ti.App.Properties.getString("notes")||JSON.stringify({}));
	var skillmodules = {
		mindfulness: ["observe","describe","participate"],
		distresstolerance: ["distract","selfsoothe"],
		emotionregulation: ["oppositeaction"],
		interpersonal: ["describe"]
	};
	var skilltomodule = {},allmodules = [];
	for(var m in skillmodules){
		allmodules.push(m);
		skillmodules[m].forEach(function(s){
			skilltomodule[s] = m;
		});
	}
    C.content = {
		getAllSkillModules: function(){
			return allmodules;
		},
		getSkillsForModule: function(moduleid){
			return skillmodules[moduleid];
		},
        setObjectText: function(object, textid, textpropname) {
			textpropname = (textpropname) || ("text");
            pb.sub("/updatetext",updateMe,object,textid,textpropname);
			updateMe(object,textid,textpropname);
        },
		getNote: function(id) {
			return notes[id] || "";
		},
		setNote: function(id,note){
			notes[id] = note;
			Ti.App.Properties.setString("notes",JSON.stringify(notes));
		},
        getText: function(id) {
            var lang = C.state.lang,
            texts = {
				skill_describe_description: {
					en: "Describe the situation!",
					sv: "Beksriv situationen."
				},
				skill_oppositeaction_description: {
					en: "Act in opposition to your emotion!",
					sv: "Gör tvärtom mot vad du känner!"
				},
				skill_selfsoothe_description: {
					en: "Soothe yourself!",
					sv: "Ge dig själv tröst!"
				},
				skill_distract_description: {
					en: "Distract yourself to break the negative thought pattern!",
					sv: "Distrahera dig själv så du bryter mönstret."
				},
				skill_participate_description: {
					en: "Participate, don't stand on the sidelines!",
					sv: "Delta, stå inte brevid och titta på!"
				},
				skill_observe_description: {
					en: "Observe the situation neutrally.",
					sv: "Observera situationen objektivt."
				},	
				skill_describe_title: {
					en: "Describe",
					sv: "Beskriv"
				},
				skill_oppositeaction_title: {
					en: "Opposite action",
					sv: "Handla tvärt emot"
				},
				skill_selfsoothe_title: {
					en: "Self soothe",
					sv: "Trösta dig själv"
				},
				skill_distract_title: {
					en: "Distract",
					sv: "Distrahera"
				},
				skill_participate_title: {
					en: "Participate",
					sv: "Delta"
				},
				skill_observe_title: {
					en: "Observe",
					sv: "Observera"
				},
				module_mindfulness_title: {
					sv: "Medveten närvaro",
					en: "Mindfulness"
				},
				module_distresstolerance_title: {
					sv: "Att stå ut",
					en: "Distress tolerance"
				},
				module_emotionregulation_title: {
					en: "Emotion regulation",
					sv: "Hantera känslor"
				},
				module_interpersonal_title: {
					en: "Interpersonal effectiveness",
					sv: "Hantera relationer"
				},
				module_mindfulness_description: {
					sv: "Var medveten i stunden ju! Woo!",
					en: "It is important to be mindful!"
				},
				module_distresstolerance_description: {
					sv: "För att stå ut, knip ihop ögonen och räkna till 10.",
					en: "To tolerate distress, close your eyes hard and count to 10!"
				},
				module_emotionregulation_description: {
					en: "Put a damp towel on your forhead.",
					sv: "Lägg en blöt handduk över pannan."
				},
				module_interpersonal_description: {
					en: "Relations are important!",
					sv: "Det är viktigt att hantera sina relationer!"
				},
				skillexamples_nav: {
					en: "Use",
					sv: "Använda"
				},
				skillexercises_nav: {
					en: "Practice",
					sv: "Träna"
				},
				skillexplanation_nav: {
					en: "Understand",
					sv: "Förstå"
				},
				skillexamples_title: {
					en: "Examples of use",
					sv: "Tillämpningar"
				},
				skillexercises_title: {
					en: "Skill exercises",
					sv: "Övningar"
				},
				skillexplanation_title: {
					en: "Skill explanation",
					sv: "Färdighetsförklaring"
				},
				backtomodulelist_nav: {
					en: "Modules",
					sv: "Moduler"
				},
				moduleexplanation_title: {
					en: "Module explanation",
					sv: "Modulförklaring"
				},
				moduleexplanation_description: {
					sv: "Denna modul bla bla bla",
					en: "This module yada yada"
				},
				moduleskillist_title: {
					en: "Module skills",
					sv: "Modulfärdigheter"
				},
				moduleskillist_description: {
					sv: "Här är alla färdigheter i denna modul!",
					en: "Ok, here we have the skills for this module!"
				},
				moduleskillist_nav: {
					sv: "Färdigheter",
					en: "Skills"
				},
				moduleexplanation_nav: {
					sv: "Förklaring",
					en: "Explanation"
				},
				skilltab: {
					en: "Skills",
					sv: "Färdigheter"
				},
				crisistab: {
					en: "Crisis!",
					sv: "Kris!"
				},
				aboutmodules_nav: {
					en: "about",
					sv: "om"
				},
				modulelist_nav: {
					en: "list",
					sv: "lista"
				},
				aboutmodules_title: {
					en: "Skills and modules",
					sv: "Färdighetsmoduler"
				},
				aboutmodules_description: {
					en: "Divided into modules, see?",
					sv: "Ok, indelad i moduler!"
				},
				modulelist_title: {
					en: "All modules",
					sv: "Modullista"
				},
				modulelist_description: {
					en: "Wooo, the full list!",
					sv: "Ok, här är de!"
				},
				note_instruction: {
					en: "Notes about",
					sv: "Anteckningar om"
				},
                modules_title: {
                    en: "Modules",
                    sv: "Moduler"
                },
                modules_description: {
                    en: "All modules:",
                    sv: "Alla moduler:"
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
            if (!texts[id] || !texts[id][lang]) {
                throw "No entry for " + id + " in language " + lang + "!";
            }
            return texts[id][lang];
        }
    };
})();