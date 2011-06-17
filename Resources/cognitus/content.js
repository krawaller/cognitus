// Old version with no centralised DB access

(function() {
	var db = Titanium.Database.install(Ti.Filesystem.resourcesDirectory+"/cognitus/cognitus.sqlite",'00073'),
		notes = JSON.parse(Ti.App.Properties.getString("notes")||JSON.stringify({})),
		skilltomodule = {},
		allmodules = [],
		moduleskills = {},
		moduleswithsubs = {};
	
	/*allmodules = ["mindfulness","interpersonaleffectiveness","emotionregulation","distresstolerance"];
	moduleskills = {
		mindfulness: [],
		interpersonaleffectiveness: [],
		emotionregulation: [],
		distresstolerance: []
	}*/
	
	
	function updateMe(o,textid,textpropname){
		if (!o){
			Ti.API.log(["ERROR ERROR!",textid,textpropname]);
			throw "DLSADKSLÖADSAÖD";
		}
		o[textpropname] = C.content.getText(K.isFunc(textid) ? textid() : textid);
	}
	
	function loadSkillsAndModules(){
		var rows = db.execute("SELECT moduleid FROM modules ORDER BY priority ASC");
		while (rows.isValidRow()){
			moduleskills[rows.field(0)] = [];
			moduleswithsubs[rows.field(0)] = {};
			allmodules.push(rows.field(0));
			rows.next();
		}
		rows.close();
		rows = db.execute("SELECT skillid, moduleid, submoduleid FROM skills ORDER BY moduleid, priority ASC");
		var prevsub, prevmodule;
		while (rows.isValidRow()){
			var skill = rows.field(0),
				module = rows.field(1),
				sub = (rows.field(2) || "NONE");
			skilltomodule[skill] = module;
			moduleskills[module].push(skill);
			if ((sub !== prevsub) || (prevmodule !== module)){
				//Ti.API.log("New submodule "+sub+" (last was "+prevsub+")");
				moduleswithsubs[module][sub] = [];
			}
			//Ti.API.log([skill,module,sub]);
			moduleswithsubs[module][sub].push(skill);
			prevmodule = module;
			prevsub = sub;
			rows.next();
		}
		rows.close();
	}

	// initial loading of skills and modules from database
	loadSkillsAndModules();

	var newsitems = [{
		newsid: "news00001",
		date: "2011-04-01"
	},{
		newsid: "news00002",
		date: "2011-04-12"
	}];

    C.content = {
		getMaxLastUpdated: function(){
			res = db.execute("SELECT MAX(lastupdated) as max FROM TEXTS");
			return res.fieldByName("max");
		},
		receiveTextsFromServer: function(o){
			if (!o || o.error || !o.forEach){
				return;
			}
			Ti.API.log("WOO! "+o.length);
			o.forEach(function(text){
				Ti.API.log("Updating "+text.textid+" ("+text.lastupdated+")");
				db.execute("REPLACE INTO texts (textid, lastupdated, sv, en, fr, es, de) VALUES (?,?,?,?,?,?,?)",
					text.textid,
					text.lastupdated,
					text.sv,
					text.en,
					text.fr,
					text.es,
					text.de
				);
				pb.pub("/updatetexts");
			});
			// TODO - add insert for news part shit?
		},
		getModuleWithSubModules: function(moduleid){
			return moduleswithsubs[moduleid];
		},
		getCrisisList: function(){
			return Ti.App.Properties.getString("crisislistid");
		},
		setCrisisList: function(listid){
			Ti.App.Properties.setString("crisislistid",listid);
		},
		getCrisisNumber: function(){
			return Ti.App.Properties.getInt("crisisnumber");
		},
		setCrisisNumber: function(number){
			Ti.App.Properties.setInt("crisisnumber",number);
		},
		getListsIncludingSkill: function(skillid){
			var rows = db.execute("SELECT mylists.listid, title, mylists.priority, skillcount FROM mylists INNER JOIN listitems ON mylists.listid = listitems.listid WHERE listitems.skillid = '"+skillid+"'");
				ret = [];
			while(rows.isValidRow()){
				ret.push({
					ListId: rows.field(0),
					title: rows.field(1),
					priority: rows.field(2),
					skillcount: rows.field(3)
				});
				rows.next();
			}
			rows.close();
			return ret;			
		},
		addSkillToList: function(listid,skillid){
			db.execute("UPDATE listitems SET priority = priority+1");
			db.execute("INSERT INTO listitems (listitemid,listid,skillid,usagetext,priority) VALUES ('listitem_"+Date.now()+"','"+listid+"','"+skillid+"','',0)");
		},
		getListSkills: function(listid){
			var rows = db.execute("SELECT listitems.priority, listitems.usagetext, listitems.skillid, skills.moduleid, listitems.listitemid from listitems INNER JOIN skills ON listitems.skillid = skills.skillid WHERE listitems.listid = '"+listid+"' ORDER BY listitems.priority"),
				ret = [];
			while(rows.isValidRow()){
				ret.push({
					ListId: listid,
					priority: rows.field(0),
					usagetext: rows.field(1),
					SkillId: rows.field(2),
					ModuleId: rows.field(3),
					ListItemId: rows.field(4)
				});
				rows.next();
			}
			rows.close();
			return ret;
		},
		getListTitle: function(listid){
			var rows = db.execute("SELECT lists.title FROM lists WHERE listid = '"+listid+"'"),
				ret=  rows.field(0);
			rows.close();
			return ret;
		},
		addNewList: function(){
			db.execute("UPDATE lists SET priority = priority+1");
			var res = db.execute("INSERT INTO lists (listid,title,priority) VALUES ('list"+Date.now()+"', '"+C.content.getText("mylists_btn_newlist")+"', 0)");
			if (res){
				res.close();
			}
		},
		getMyListsWithSkillCount: function(){
			var rows = db.execute("SELECT listid, title, priority, skillcount FROM mylists ORDER BY priority"),
				ret = [];
			while(rows.isValidRow()){
				ret.push({
					ListId: rows.field(0),
					title: rows.field(1),
					priority: rows.field(2),
					skillcount: rows.field(3)
				});
				rows.next();
			}
			rows.close();
			return ret;
		},
		getNewsItem: function(newsid){
			var item;
			newsitems.forEach(function(n){if (n.newsid === newsid){item = n;}});
			if (!item){
				throw "No find news! "+newsid;
			}
			return K.merge(item,{headline: C.content.getText(item.newsid+"_headline"), content: C.content.getText(item.newsid+"_content")});
		},
		getNewsList: function(){
			return newsitems.map(function(n){
				return K.merge(n,{
					headline: C.content.getText(n.newsid+"_headline")
				});
			});
		},
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
		removeSkillFromList: function(listitemid,delprio){
			res = db.execute("DELETE FROM listitems WHERE listitemid = '"+listitemid+"'");
			db.execute("UPDATE listitems SET priority = priority-1 WHERE priority > "+delprio);
			if (res){
				res.close();	
			}
		},
		removeList: function(listid,delprio){
			if (Ti.App.Properties.getString("crisislistid")===listid){
				Ti.App.Properties.setString("crisislistid","");
			}
			res = db.execute("DELETE FROM listitems WHERE listid = '"+listid+"'");
			res = db.execute("DELETE FROM lists WHERE listid = '"+listid+"'");
			db.execute("UPDATE lists SET priority = priority-1 WHERE priority > "+delprio);
			if (res){
				res.close();	
			}
		},
		updateSkillUsageText: function(listitemid,newusagetext){
			db.execute("UPDATE listitems SET usagetext = '"+newusagetext+"' WHERE listitemid = '"+listitemid+"'");
		},
		updateListTitle: function(listid,newtitle){
			db.execute("UPDATE lists SET title = '"+newtitle+"' WHERE listid = '"+listid+"'");
		},
		updateSkillPositionOnList: function(listitemid,newpriority,oldpriority){
			if (newpriority === oldpriority){
				return;
			}
			Ti.API.log(["MOVE",listitemid,newpriority,oldpriority]);
			if (newpriority > oldpriority){
				db.execute("UPDATE listitems SET priority = priority-1 WHERE priority<="+newpriority+" AND priority>"+oldpriority+"");
			} else {
				db.execute("UPDATE listitems SET priority = priority+1 WHERE priority>="+newpriority+" AND priority<"+oldpriority+"");
			}
			res = db.execute("UPDATE listitems SET priority = "+newpriority+" WHERE listitemid = '"+listitemid+"'");
			if (res){
				res.close();	
			}
		},
		updateListPosition: function(listid,newpriority,oldpriority){
			if (newpriority === oldpriority){
				return;
			}
			Ti.API.log(["MOVE",listid,newpriority,oldpriority]);
			if (newpriority > oldpriority){
				db.execute("UPDATE lists SET priority = priority-1 WHERE priority<="+newpriority+" AND priority>"+oldpriority+"");
			} else {
				db.execute("UPDATE lists SET priority = priority+1 WHERE priority>="+newpriority+" AND priority<"+oldpriority+"");
			}
			res = db.execute("UPDATE lists SET priority = "+newpriority+" WHERE listid = '"+listid+"'");
			if (res){
				res.close();	
			}
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
		updateSkillUsageTextOnCrisisList: function(skillid,freetext){
			db.execute("UPDATE crisislistobjects SET freetext = '"+freetext+"' WHERE skillid = '"+skillid+"'");
		},
		addSkillToCrisisList: function(skillid,freetext){
			db.execute("UPDATE crisislistobjects SET priority = priority+1");
			res = db.execute("INSERT INTO crisislistobjects (skillid,freetext,priority) VALUES ('"+skillid+"','"+(freetext||"")+"',0)");
			if (res){
				res.close();	
			}
		},
		getCrisisListItemUsageText: function(skillid){
			var res = db.execute("SELECT freetext FROM crisislistobjects WHERE skillid = '"+skillid+"'"),
				text = res.field(0);
			res.close();
			return text;
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
				ret = rows.fieldByName(lang);
			if (!ret){
				Ti.API.log("COULDN'T FIND TEXT:");
				Ti.API.log([id,lang,rows.rowCount,ret]);
			}
			rows.close();
			return ret || "(no "+id+")";
        },
		test: function(){
			var res = db.execute("SELECT * FROM texts WHERE textid = 'moduleexplanation_distresstolerance_hmtl'");
			Ti.API.log("COUNT: "+res.rowCount);
			if (res.isValidRow()){
				Ti.API.log(res.fieldByName("textid"));
				Ti.API.log(res.fieldByName("sv"));
			}
			res.close();
			Ti.API.log(C.content.getText("moduleexplanation_distresstolerance_hmtl"));
		}
    };
})();