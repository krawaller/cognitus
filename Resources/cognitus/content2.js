// Version with centralised DB handling

(function() {
	var USEVIEWS = true;
	
	var notes = JSON.parse(Ti.App.Properties.getString("notes")||JSON.stringify({})),
		skilltomodule = {},
		allmodules = [],
		moduleskills = {},
		moduleswithsubs = {},
		DBNAME = 'COGNITUS_00080';
	
	var res = Titanium.Database.install(Ti.Filesystem.resourcesDirectory+"/cognitus/cognitus.sqlite",DBNAME);
	res.close();
	
	function dbSinglePropQuery(sql,prop){
		var db = Ti.Database.open(DBNAME),
			res = db.execute(sql),
			ret;
		if(res.isValidRow()){
			ret = res.fieldByName(prop);
		}
		res.close();
		db.close();
		return ret;
	}
	
	function dbQuery(sql,mould){
		var db = Ti.Database.open(DBNAME),
			res = db.execute(sql),
			ret = [],
			i = -1,p;
		while(res.isValidRow()){
			i++;
			ret[i] = {};
			for(p in mould){
				ret[i][p] = res.fieldByName(mould[p]);
			}
			res.next();
		}
		res.close();
		db.close();
		return ret;
	}
	
	function dbOperation(sql){
		var db = Ti.Database.open(DBNAME),
			res = db.execute(sql);
		if (res){
			res.close();
		}
		db.close();
	}
	
	function updateMe(o,textid,textpropname){
		if (!o){
			Ti.API.log(["ERROR ERROR!",textid,textpropname]);
			throw "DLSADKSLÖADSAÖD";
		}
		o[textpropname] = C.content.getText(K.isFunc(textid) ? textid() : textid);
	}
	
	function loadSkillsAndModules(){
		var db = Ti.Database.open(DBNAME);
			rows = db.execute("SELECT moduleid FROM modules ORDER BY priority ASC");
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
		db.close();
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
		getModuleQuizSessions: function(moduleid){
			var sql = 'SELECT quizdate FROM quizsessions WHERE moduleid = "'+moduleid+'"',
				mould = {quizdate:"quizdate"};
			return dbQuery(sql,mould);
		},
		getModuleQuestions: function(moduleid){
			var NOVIEWSsql = 'SELECT * FROM (SELECT quizquestionid, moduleid, priority, type, en, sv, fr, de, es FROM quizquestions INNER JOIN texts ON textid = "quizquestion_" || moduleid || "_" || quizquestionid) as q ORDER BY priority'
				VIEWSsql = "SELECT * FROM quizquestionswithtexts ORDER BY priority",
				mould = {
					quizquestionid: "quizquestionid",
					moduleid: "moduleid",
					type: "type",
					priority: "priority",
					en: "en", sv: "sv", de: "de", es: "es", fr: "fr"
				};
			return dbQuery(USEVIEWS ? VIEWSsql : NOVIEWSsql,mould);
		},
		getMaxLastUpdated: function(){
			return dbSinglePropQuery("SELECT MAX(lastupdated) as max FROM TEXTS","max");
		},
		receiveTextsFromServer: function(o){
			if (!o || o.error || !o.forEach){
				return;
			}
			Ti.API.log("WOO! "+o.length);
			var db = Ti.Database.open(DBNAME),res;
			o.forEach(function(text){
				Ti.API.log("Updating "+text.textid+" ("+text.lastupdated+")");
				res = db.execute("REPLACE INTO texts (textid, lastupdated, sv, en, fr, es, de) VALUES (?,?,?,?,?,?,?)",
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
			db.close();
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
			var NOVIEWSsql = "SELECT mylists.listid, title, mylists.priority, skillcount FROM mylists INNER JOIN listitems ON mylists.listid = listitems.listid WHERE listitems.skillid = '"+skillid+"'",
				VIEWSsql = "SELECT mylists.listid, title, mylists.priority, skillcount FROM (SELECT listid, title, priority, (SELECT COUNT(skillid) FROM listitems WHERE listitems.listid = lists.listid) AS 'skillcount' FROM lists WHERE listid NOT LIKE 'PRELIST%') as mylists INNER JOIN listitems ON mylists.listid = listitems.listid WHERE listitems.skillid = '"+skillid+"'",
				mould = {ListId:"listid",title:"title",priority:"priority",skillcount:"skillcount"};
			return dbQuery(USEVIEWS ? VIEWSsql : NOVIEWSsql,mould);
		},
		addSkillToList: function(listid,skillid){
			dbOperation("UPDATE listitems SET priority = priority+1");
			dbOperation("INSERT INTO listitems (listitemid,listid,skillid,usagetext,priority) VALUES ('listitem_"+Date.now()+"','"+listid+"','"+skillid+"','',0)");
		},
		getListSkills: function(listid){
			var sql = "SELECT listitems.listid, listitems.priority, listitems.usagetext, listitems.skillid, skills.moduleid, listitems.listitemid from listitems INNER JOIN skills ON listitems.skillid = skills.skillid WHERE listitems.listid = '"+listid+"' ORDER BY listitems.priority",
				mould = {ListId:"listid",priority:"priority",usagetext:"usagetext",SkillId:"skillid",ModuleId:"moduleid",ListItemId:"listitemid"};
			return dbQuery(sql,mould);
		},
		getListTitle: function(listid){
			return dbSinglePropQuery("SELECT lists.title FROM lists WHERE listid = '"+listid+"'","title");
		},
		addNewList: function(){
			dbOperation("UPDATE lists SET priority = priority+1");
			dbOperation("INSERT INTO lists (listid,title,priority) VALUES ('list"+Date.now()+"', '"+C.content.getText("mylists_btn_newlist")+"', 0)");
		},
		getMyListsWithSkillCount: function(){
			var VIEWSsql = "SELECT listid, title, priority, skillcount FROM mylists ORDER BY priority",
				NOVIEWSsql = "SELECT listid, title, priority, skillcount FROM (SELECT listid, title, priority, (SELECT COUNT(skillid) FROM listitems WHERE listitems.listid = lists.listid) AS 'skillcount' FROM lists WHERE listid NOT LIKE 'PRELIST%') as mylists ORDER BY priority",
				mould = {ListId:"listid",title:"title",priority:"priority",skillcount:"skillcount"};
			Ti.API.log("WOO!");
			return dbQuery(USEVIEWS ? VIEWSsql : NOVIEWSsql,mould);
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
			var sql = "SELECT skillid, freetext, priority FROM crisislistobjects ORDER BY priority ASC",
				mould = {SkillId:"skillid",freetext:"freetext",priority:"priority"};
			return dbQuery(sql,mould);
		},
		getAllSkillModules: function(){
			return allmodules;
		},
		getModuleForSkill: function(skillid){
			return skilltomodule[skillid];
		},
		testIfSkillOnCrisisList: function(skillid){
			return dbSinglePropQuery("SELECT COUNT(skillid) as count FROM crisislistobjects WHERE skillid = '"+skillid+"'","count");
		},
		removeSkillFromList: function(listitemid,delprio){
			dbOperation("DELETE FROM listitems WHERE listitemid = '"+listitemid+"'");
			dbOperation("UPDATE listitems SET priority = priority-1 WHERE priority > "+delprio);
		},
		removeList: function(listid,delprio){
			if (Ti.App.Properties.getString("crisislistid")===listid){
				Ti.App.Properties.setString("crisislistid","");
			}
			dbOperation("DELETE FROM listitems WHERE listid = '"+listid+"'");
			dbOperation("DELETE FROM lists WHERE listid = '"+listid+"'");
			dbOperation("UPDATE lists SET priority = priority-1 WHERE priority > "+delprio);
		},
		updateSkillUsageText: function(listitemid,newusagetext){
			dbOperation("UPDATE listitems SET usagetext = '"+newusagetext+"' WHERE listitemid = '"+listitemid+"'");
		},
		updateListTitle: function(listid,newtitle){
			dbOperation("UPDATE lists SET title = '"+newtitle+"' WHERE listid = '"+listid+"'");
		},
		updateSkillPositionOnList: function(listitemid,newpriority,oldpriority){
			if (newpriority === oldpriority){
				return;
			}
			Ti.API.log(["MOVE",listitemid,newpriority,oldpriority]);
			if (newpriority > oldpriority){
				dbOperation("UPDATE listitems SET priority = priority-1 WHERE priority<="+newpriority+" AND priority>"+oldpriority+"");
			} else {
				dbOperation("UPDATE listitems SET priority = priority+1 WHERE priority>="+newpriority+" AND priority<"+oldpriority+"");
			}
			dbOperation("UPDATE listitems SET priority = "+newpriority+" WHERE listitemid = '"+listitemid+"'");
		},
		updateListPosition: function(listid,newpriority,oldpriority){
			if (newpriority === oldpriority){
				return;
			}
			Ti.API.log(["MOVE",listid,newpriority,oldpriority]);
			if (newpriority > oldpriority){
				dbOperation("UPDATE lists SET priority = priority-1 WHERE priority<="+newpriority+" AND priority>"+oldpriority+"");
			} else {
				dbOperation("UPDATE lists SET priority = priority+1 WHERE priority>="+newpriority+" AND priority<"+oldpriority+"");
			}
			dbOperation("UPDATE lists SET priority = "+newpriority+" WHERE listid = '"+listid+"'");
		},
		removeSkillFromCrisisList: function(skillid){
			var delprio = dbSinglePropQuery("SELECT priority FROM crisislistobjects WHERE skillid = '"+skillid+"'","priority");
			dbOperation("DELETE FROM crisislistobjects WHERE skillid = '"+skillid+"'");
			dbOperation("UPDATE crisislistobjects SET priority = priority-1 WHERE priority > "+delprio);
		},
		updateSkillUsageTextOnCrisisList: function(skillid,freetext){
			dbOperation("UPDATE crisislistobjects SET freetext = '"+freetext+"' WHERE skillid = '"+skillid+"'");
		},
		addSkillToCrisisList: function(skillid,freetext){
			dbOperation("UPDATE crisislistobjects SET priority = priority+1");
			dbOperation("INSERT INTO crisislistobjects (skillid,freetext,priority) VALUES ('"+skillid+"','"+(freetext||"")+"',0)");
		},
		getCrisisListItemUsageText: function(skillid){
			return dbSinglePropQuery("SELECT freetext FROM crisislistobjects WHERE skillid = '"+skillid+"'","freetext");
		},
		updateSkillPositionOnCrisisList: function(skillid,newpriority,oldpriority){
			if (newpriority > oldpriority){
				dbOperation("UPDATE crisislistobjects SET priority = priority-1 WHERE priority<="+newpriority+" AND priority>"+oldpriority+"");
			} else {
				dbOperation("UPDATE crisislistobjects SET priority = priority+1 WHERE priority>="+newpriority+" AND priority<"+oldpriority+"");
			}
			dbOperation("UPDATE crisislistobjects SET priority = "+newpriority+" WHERE skillid = '"+skillid+"'");
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
			return (dbSinglePropQuery("SELECT "+C.state.lang+" FROM texts WHERE textid = '"+id+"'",C.state.lang)) || ("(no "+id+")");
			/*var lang = C.state.lang,
				db = Ti.Database.open(DBNAME),
				rows = db.execute("SELECT "+lang+" FROM texts WHERE textid = '"+id+"'"),
				ret = rows.fieldByName(lang);
			rows.close();
			db.close();
			return ret || "(no "+id+")";*/
        },
		test: function(){
			var db = Ti.Database.open(DBNAME),
				res = db.execute("SELECT * FROM texts WHERE textid = 'moduleexplanation_distresstolerance_hmtl'");
			Ti.API.log("COUNT: "+res.rowCount);
			if (res.isValidRow()){
				Ti.API.log(res.fieldByName("textid"));
				Ti.API.log(res.fieldByName("sv"));
			}
			res.close();
			db.close();
			Ti.API.log(C.content.getText("moduleexplanation_distresstolerance_hmtl"));
		}
    };
})();