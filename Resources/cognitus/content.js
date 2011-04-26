(function() {
	var db = Titanium.Database.install(Ti.Filesystem.resourcesDirectory+"/cognitus/cognitus.sqlite",'000004'),
		notes = JSON.parse(Ti.App.Properties.getString("notes")||JSON.stringify({})),
		skilltomodule = {},
		allmodules = [],
		moduleskills = {};
	
	function updateMe(o,textid,textpropname){
		o[textpropname] = C.content.getText(K.isFunc(textid) ? textid() : textid);
	}
	
	function loadSkillsAndModules(){
		rows = db.execute("SELECT skillid, moduleid FROM skills");
		while (rows.isValidRow()){
			var skill = rows.field(0), module = rows.field(1);
			skilltomodule[skill] = module;
			if (allmodules.indexOf(module)===-1){
				allmodules.push(module);
			}
			if (!moduleskills[module]){
				moduleskills[module] = [];
			}
			moduleskills[module].push(skill);
			rows.next();
		}
		rows.close();
	}

	// initial loading of skills and modules from database
	loadSkillsAndModules();

    C.content = {
		getAllSkillModules: function(){
			return allmodules;
		},
		getSkillsForModule: function(moduleid){
			return moduleskills[moduleid];
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