// Version with centralised DB handling

(function() {
	xhr = {
		get: function(url,callback){
			var c = Titanium.Network.createHTTPClient();
			c.open("GET",url);
			c.onload = function(){
				callback(this.responseData);
			};
			c.send();
		}
	};	
	
	
	var USEVIEWS = true;
	
	var notes = JSON.parse(Ti.App.Properties.getString("notes")||JSON.stringify({})),
		skilltomodule = {},
		allmodules = [],
		moduleskills = {},
		moduleswithsubs = {},
		DBNAME = 'COGNITUS_00133';
	
	var res = Titanium.Database.install(Ti.Filesystem.resourcesDirectory+"/cognitus/cognitus.sqlite",DBNAME);
	res.close();
	
	function dbSinglePropQuery(sql,prop,varargs){
		var db = Ti.Database.open(DBNAME);
		if (!db || !db.execute || (typeof db.execute !== "function")){
			throw "No DB available for: "+sql;
		}
		var res = db.execute(sql,varargs || []),
			ret;
		if (!res){
			throw "Error! Error! "+sql+" ||| "+prop;
		}
		if(res.isValidRow()){
			ret = res.fieldByName(prop);
		}
		res.close();
		db.close();
		return ret;
	}
	
	function dbQuery(sql,mould,varargs){
		var db = Ti.Database.open(DBNAME),
			res = db.execute(sql,varargs || []),
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
	
	function dbOperation(sql,varargs){
		var db = Ti.Database.open(DBNAME),
			res = db.execute(sql,varargs || []);
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
		rows = db.execute("SELECT skillid, moduleid, coalesce(submoduleid, '9NONE') as submoduleid FROM skills ORDER BY moduleid, submoduleid ASC, priority ASC");
		var prevsub, prevmodule;
		while (rows.isValidRow()){
			var skill = rows.field(0),
				module = rows.field(1),
				sub = (rows.field(2) || "9NONE");
			skilltomodule[skill] = module;
			moduleskills[module].push(skill);
			if ((sub !== prevsub) || (prevmodule !== module)){
				moduleswithsubs[module][sub] = [];
			}
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
		loadTextsFromServer: function(){
			var maxlast = C.content.getMaxLastUpdated();
			Ti.API.log("LOADING FROM SERVER!");
			xhr.get("http://cognitus.krawaller.se/api/texts?lastupdated="+maxlast,function(data){
				data = JSON.parse(data);
				//Ti.API.log([data,typeof data,data.length,data[0]]);
				Ti.API.log("Hämtade "+data.length+" nya poster");
				C.content.receiveTextsFromServer(data);
				pb.pub("/updatetext");
			});
		},
		getHelpForPageId: function(pageid,lang){
			return dbSinglePropQuery("SELECT "+lang+"  FROM texts WHERE textid = ?",lang,[pageid+"_help_html"]);
		},
		dbQuery: dbQuery,
		dbSinglePropQuery: dbSinglePropQuery,
		dbOperation: dbOperation,
		getNoteList: function(){
			var sql = "SELECT pagename, note, updated FROM notes ORDER BY updated DESC",
				mould = {
					pagename: "pagename",
					note: "note",
					updated: "updated"
				},
				res = dbQuery(sql,mould);
			return dbQuery(sql,mould);
		},
		testIfPageHasNote: function(pagename){
			return dbSinglePropQuery("SELECT COUNT(*) as c FROM notes WHERE pagename = ?","c",[pagename]);
		},
		getNoteForPage: function(pagename){
			return dbSinglePropQuery("SELECT note FROM notes WHERE pagename = ?","note",[pagename]) || "";
		},
		deleteNote: function(pagename){
			dbOperation("DELETE FROM notes WHERE pagename = ?",[pagename]);
		},
		saveNoteForPage: function(pagename,note){
			if (!note){
				dbOperation("DELETE FROM notes WHERE pagename = ?",[pagename]);
			} else {
				dbOperation("REPLACE INTO notes (pagename,note,updated) VALUES (?,?,DATETIME())",[pagename,note]);
			}
		},
		deleteQuizSession: function(quizdate){
			//Ti.API.log("WOO "+dbSinglePropQuery("SELECT COUNT(*) as c FROM quizanswers WHERE quizdate = ?","c",[quizdate]));
			dbOperation("DELETE FROM quizanswers WHERE quizdate = ?",[quizdate]);
		},
		storeQuizSession: function(quizdate,answers){
			dbOperation("DELETE FROM quizanswers WHERE quizdate = ?",[quizdate]);
			answers.forEach(function(a){
				Ti.API.log([quizdate,a.quizquestionid,a.value]);
				dbOperation("INSERT INTO quizanswers (quizdate,quizquestionid,value) VALUES (?,?,?)",[quizdate,a.quizquestionid,a.value]);
			});
		},
		getModuleQuizSessions: function(moduleid){
			var sql = 'SELECT quizdate FROM quizsessions WHERE moduleid = ? ORDER BY quizdate DESC',
				mould = {quizdate:"quizdate"};
			return dbQuery(sql,mould,[moduleid]);
		},
		getQuizSessionAnswers: function(quizdate){
			var sql = "SELECT * FROM quizanswerswithdetails WHERE quizdate = ?",
				mould = {
					quizquestionid: "quizquestionid",
					moduleid: "moduleid",
					type: "type",
					priority: "priority",
					en: "en", sv: "sv", de: "de", es: "es", fr: "fr",
					quizdate: "quizdate",
					value: "value",
					helpen: "helpen", helpsv:"helpsv",helpde:"helpde",helpes:"helpes",helpfr:"helpfr"
				};
			return dbQuery(sql,mould,[quizdate]);
		},
		getModuleQuestions: function(moduleid){
			var sql = "SELECT * FROM quizquestionswithtexts WHERE moduleid = ? ORDER BY priority",
				mould = {
					quizquestionid: "quizquestionid",
					moduleid: "moduleid",
					type: "type",
					priority: "priority",
					en: "en", sv: "sv", de: "de", es: "es", fr: "fr",
					helpen: "helpen", helpsv:"helpsv",helpde:"helpde",helpes:"helpes",helpfr:"helpfr"
				};
			return dbQuery(sql,mould,[moduleid]);
		},
		getMaxLastUpdated: function(){
			return dbSinglePropQuery("SELECT MAX(lastupdated) as max FROM TEXTS","max");
		},
		receiveTextsFromServer: function(o){
			if (!o || o.error || !o.forEach){
				return;
			}
			var db = Ti.Database.open(DBNAME),res;
			o.forEach(function(text){
				res = db.execute("REPLACE INTO texts (textid, lastupdated, sv, en, fr, es, de, created) VALUES (?,?,?,?,?,?,?,?)",
					text.textid,
					text.lastupdated,
					text.sv,
					text.en,
					text.fr,
					text.es,
					text.de,
					text.created
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
			return Ti.App.Properties.getString("crisisnumber");
		},
		setCrisisNumber: function(number){
			Ti.App.Properties.setString("crisisnumber",number);
		},
		getListsIncludingSkill: function(skillid){
			var sql = "SELECT mylists.listid as listid, title, mylists.priority as priority, skillcount FROM mylists INNER JOIN listitems ON mylists.listid = listitems.listid WHERE listitems.skillid = '"+skillid+"'",
				mould = {ListId:"listid",title:"title",priority:"priority",skillcount:"skillcount"},
				result;
			result = dbQuery(sql,mould);
			return result;
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
			return !!listid.match(/PRELIST/)
				? dbSinglePropQuery("SELECT prelistswithdetails."+C.state.lang+" as title FROM prelistswithdetails WHERE listid = '"+listid+"'","title")
			 	: dbSinglePropQuery("SELECT lists.title FROM lists WHERE listid = '"+listid+"'","title");
		},
		addNewList: function(){
			dbOperation("UPDATE lists SET priority = priority+1");
			dbOperation("INSERT INTO lists (listid,title,priority) VALUES ('list"+Date.now()+"', '"+C.content.getText("mylists_btn_newlist")+"', 0)");
		},
		getMyListsWithSkillCount: function(){
			var sql = "SELECT listid, title, priority, skillcount FROM mylists ORDER BY priority",
				mould = {ListId:"listid",title:"title",priority:"priority",skillcount:"skillcount"};
			return dbQuery(sql,mould);
		},
		getPreListsWithDetails: function(lang){
			var sql = "SELECT skillcount, listid, "+lang+" as title, priority FROM prelistswithdetails",
				mould = {ListId: "listid",title:"title",priority:"priority",skillcount:"skillcount"};
			return dbQuery(sql,mould);
		},
		getPreListSkills: function(listid,lang){
			var sql = "SELECT listid, skillid, moduleid, priority, listitemid, "+lang+" as usagetext FROM prelistitemswithdetails WHERE listid = '"+listid+"'",
				mould = {ListId:"listid",priority:"priority",usagetext:"usagetext",SkillId:"skillid",ModuleId:"moduleid",ListItemId:"listitemid"};
			return dbQuery(sql,mould);
		},
		getNewsItem: function(created){
			var sql = "SELECT created, title_sv, title_en, title_de, title_es, title_fr, html_sv, html_en, html_de, html_es, html_fr FROM newswithdetails WHERE created = ?",
				mould = {
					created: "created",
					title_sv: "title_sv",
					title_en: "title_en",
					title_es: "title_es",
					title_de: "title_de",
					title_fr: "title_fr",
					html_sv: "html_sv",
					html_en: "html_en",
					html_es: "html_es",
					html_de: "html_de",
					html_fr: "html_fr"
				};
			return dbQuery(sql,mould,[created]);
		},
		getNewsList: function(){
			/*var sql = "SELECT created, title_sv, title_en, title_de, title_es, title_fr FROM newswithdetails",
				mould = {
					created: "created",
					title_sv: "title_sv",
					title_en: "title_en",
					title_es: "title_es",
					title_de: "title_de",
					title_fr: "title_fr"
				};*/
			var sql = "SELECT created, textid FROM texts WHERE textid LIKE 'news_title_%'",
				mould = {
					created: "created",
					textid: "textid"
				};
			return dbQuery(sql,mould);
		},
		getAllSkillModules: function(){
			return allmodules;
		},
		getModuleForSkill: function(skillid){
			return skilltomodule[skillid];
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
			if (newpriority > oldpriority){
				dbOperation("UPDATE lists SET priority = priority-1 WHERE priority<="+newpriority+" AND priority>"+oldpriority+"");
			} else {
				dbOperation("UPDATE lists SET priority = priority+1 WHERE priority>="+newpriority+" AND priority<"+oldpriority+"");
			}
			dbOperation("UPDATE lists SET priority = "+newpriority+" WHERE listid = '"+listid+"'");
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
        }
    };
})();