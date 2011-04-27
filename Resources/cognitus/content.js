(function() {
	var db = Titanium.Database.install(Ti.Filesystem.resourcesDirectory+"/cognitus/cognitus.sqlite",'00018'),
		notes = JSON.parse(Ti.App.Properties.getString("notes")||JSON.stringify({})),
		skilltomodule = {},
		allmodules = [],
		moduleskills = {};
	
	function updateMe(o,textid,textpropname){
		o[textpropname] = C.content.getText(K.isFunc(textid) ? textid() : textid);
	}
	
	function loadSkillsAndModules(){
		var rows = db.execute("SELECT moduleid FROM modules ORDER BY priority DESC");
		while (rows.isValidRow()){
			moduleskills[rows.field(0)] = [];
			allmodules.push(rows.field(0));
			rows.next();
		}
		rows.close();
		rows = db.execute("SELECT skillid, moduleid FROM skills ORDER BY priority DESC");
		while (rows.isValidRow()){
			var skill = rows.field(0), module = rows.field(1);
			skilltomodule[skill] = module;
			moduleskills[module].push(skill);
			rows.next();
		}
		rows.close();
	}

	// initial loading of skills and modules from database
	loadSkillsAndModules();

    C.content = {
		getMyCrisisSkills: function(){
			var rows = db.execute("SELECT skillid, freetext, priority FROM crisislistobjects ORDER BY priority ASC"),
				ret = [];
			while(rows.isValidRow()){
				ret.push({SkillId:rows.field(0),freetext:rows.field(1),priority:rows.field(2)});
				rows.next();
			}
			rows.close();
			return ret;
		},
		getAllSkillModules: function(){
			return allmodules;
		},
		getModuleForSkill: function(skillid){
			return skilltomodule[skillid];
		},
		testIfSkillOnCrisisList: function(skillid){
			var rows = db.execute("SELECT COUNT(skillid) FROM crisislistobjects WHERE skillid = '"+skillid+"'"),
				ret = rows.field(0);
			rows.close();
			return !!ret;
		},
		removeSkillFromCrisisList: function(skillid){
			var res = db.execute("SELECT priority FROM crisislistobjects WHERE skillid = '"+skillid+"'"),
				delprio = res.field(0);
			res.close();
			res = db.execute("DELETE FROM crisislistobjects WHERE skillid = '"+skillid+"'");
			db.execute("UPDATE crisislistobjects SET priority = priority-1 WHERE priority > "+delprio);
			if (res){
				res.close();	
			}
		},
		addSkillToCrisisList: function(skillid){
			db.execute("UPDATE crisislistobjects SET priority = priority+1");
			res = db.execute("INSERT INTO crisislistobjects (skillid,freetext,priority) VALUES ('"+skillid+"','',0)");
			if (res){
				res.close();	
			}
		},
		updateSkillPositionOnCrisisList: function(skillid,newpriority,oldpriority){
			if (newpriority > oldpriority){
				db.execute("UPDATE crisislistobjects SET priority = priority-1 WHERE priority<="+newpriority+" AND priority>"+oldpriority+"");
			} else {
				db.execute("UPDATE crisislistobjects SET priority = priority+1 WHERE priority>="+newpriority+" AND priority<"+oldpriority+"");
			}
			res = db.execute("UPDATE crisislistobjects SET priority = "+newpriority+" WHERE skillid = '"+skillid+"'");
			if (res){
				res.close();	
			}
		},
		toggleSkillOnCrisisList: function(skillid){
			var res;
			if (C.content.testIfSkillOnCrisisList(skillid)){
				Ti.API.log("Deleting skillid "+skillid+" from crisis list!");
				alert("Removed!");
				C.content.removeSkillFromCrisisList(skillid);
			} else { // TODO fix text here woooo
				Ti.API.log("Adding skillid "+skillid+" to crisis list!");
				alert("Added!");
				C.content.addSkillToCrisisList(skillid);
			}
			pb.pub("/updatedcrisislist");
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
			return ret || "(no "+id+")";
        }
    };
})();