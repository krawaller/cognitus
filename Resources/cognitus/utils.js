(function() {

	C.utils = {
		pageNameToArgs: function(pagename) {
			var split = pagename.split("XXXXX"),
				pageid = split[0],
				args = {};
			for (var i = 1; i < split.length; i++) {
				var str = split[i],
					spl = str.split("|||"),
					what = spl[0],
					val = spl[1];
				args[what] = val;
			}
			return [pageid, args];
		},
		pageNameToTitle: function(pagename){
			var a = C.utils.pageNameToArgs(pagename),
				pageid = a[0],
				args = a[1];
			return C.utils.getPageTitle(C.state.pages[pageid],args);
		},
		currentPageName: function() {
			var p = C.state.currentPage,
				args = C.state.lastArgs,
				name = p.pageid,
				using = p.using ? Array.isArray(p.using) ? p.using : [p.using] : [],
			prefix = "XXXXX";
			using.forEach(function(t) {
				switch (t) {
				case "module":
					name += prefix + "ModuleId|||" + args.ModuleId;
					break;
				case "skill":
					name += prefix + "SkillId|||" + args.SkillId;
					break;
				case "list":
					name += prefix + "ListId|||" + args.ListId;
					break;
				case "trainsession":
					name += prefix + "quizdate|||" + args.quizdate;
					break;
				case "news":
					name += prefix + "NewsId|||" + args.NewsId;
					break;
				default:
					throw "Unknown using prop '" + t + "'!";
				}
			});
			return name;
		},
		getPageTitle: function(pagedef,args){
			if (!pagedef){
				pagedef = C.state.currentPage;
				args = C.state.lastArgs;
			}
			var main, sup = "";
			if (Array.isArray(pagedef.using)){
				if ((pagedef.using[0] === "trainsession") && (pagedef.using[1] === "module")){
					main = args.quizdate;
					sup = C.content.getText("module_"+args.ModuleId+"_title");
				}
			} else {
				switch(pagedef.using){
					case "news":
						main = C.content.getText("news_title_"+args.NewsId);
						sup =  K.dateFormat(Date(args.NewsId*1000),"yyyy-mm-dd");
						break;
					case "module":
						sup = C.content.getText("module_"+args.ModuleId+"_title");
						main = C.content.getText(pagedef.pageid +"_title");
						break;
					case "skill":
						sup = C.content.getText("skill_"+args.SkillId+"_title");
						main = C.content.getText(pagedef.pageid +"_title");
						break;
					case "list":
						main = C.content.getListTitle(args.ListId);
						sup = C.content.getText("skillist_supertitle");
						break;
					default:
						main = C.content.getText(  pagedef.pageid +"_title");
						break;
				}
			}
			return {main:main,sup:sup};
	    }
	};

})();
