(function() {
	var db = Titanium.Database.install(Ti.Filesystem.resourcesDirectory+"/cognitus/cognitus.sqlite",'000003');
	
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
				rows = db.execute("SELECT "+lang+" FROM texts WHERE textid = '"+id+"'"),
				ret = rows.field(0);
			rows.close();
			return ret;
        }
    };
})();