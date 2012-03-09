C.ui.createSkillTable = function(o, callback) {
	var table = Ti.UI.createTableView(K.merge(o, {}));
	table.addEventListener("click", function(e) {
		if (e.row && !e.row.iamaheader && !e.row.excluded && e.row.skillid) {
			callback(e.row.skillid, e.row.moduleid);
		}
	});
	table.render = function(a_moduleid, excluded, adding) {
		var modules = a_moduleid ? [a_moduleid] : C.content.getAllSkillModules(),
		showmoduleheader = !a_moduleid,
		sections = [],
		headerheight = 20,
		rowheight = 40,
		headers = 0,
		rows = 0;
		//Ti.API.log("RENDERING table!");
		modules.forEach(function(moduleid) {
			if (showmoduleheader){
				sections.push(C.ui.createTableSection(C.content.getText("module_"+moduleid+"_title"),true));
			}
			//Ti.API.log("---- module "+moduleid);
			var submodules = C.content.getModuleWithSubModules(moduleid),
				numberofsubmodules = 0,
				submoduleid;
			for(submoduleid in submodules){
				numberofsubmodules++;
			}
			for (submoduleid in submodules) {
				//Ti.API.log("---- ---- submodule " + submoduleid);
				var section;
				if (numberofsubmodules > 1) { //submoduleid !== "NONE") {
					headers++;
					headertext = C.content.getText(submoduleid === "9NONE" ? "sys_nosubmodule_title" : "module_"+submoduleid.substr(1) + "_title");
					section = C.ui.createTableSection(headertext);
				} else {
					section = Ti.UI.createTableViewSection();
				}
				submodules[submoduleid].forEach(function(skillid) {
					//Ti.API.log("---- --- ---- " + skillid);
					var x = (excluded.indexOf(skillid) != -1);
					rows++;
					var rowdef = {
						skillid: skillid,
						//height: rowheight,
						moduleid: moduleid,
						submoduleid: submoduleid,
						selected: false,
						rowmainlabel: /*(x ? "((" : "") +*/ C.content.getText("skill_" + skillid + "_title") /* + (x ? "))" : "")*/,
						excluded: x,
						className: x ? "blocked" : "available"
					};
					if (x){
						rowdef.k_class = "blockedrow";
					} else {
						rowdef.rightImage = "/images/icons/" + (adding ? "add_button.png" : "goto_button.png");
					}
					section.add(C.ui.createTableViewRow(rowdef));
				});
				sections.push(section);
			}
		});
		table.setData(sections);
		//Ti.API.log("rendered table!!");
		//Ti.API.log(table.data);
		//return headers * headerheight + rows * rowheight;
	};

	return table;
};
