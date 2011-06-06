C.ui.createSkillTable = function(o, callback) {
	var table = Ti.UI.createTableView(K.merge(o, {}));
	table.addEventListener("click", function(e) {
		if (e.row && !e.row.excluded && e.row.skillid) {
			callback(e.row.skillid, e.row.moduleid);
		}
	});
	table.render = function(a_moduleid, excluded) {
		var height, modules = a_moduleid ? [a_moduleid] : C.content.getAllSkillModules(),
		showmoduleheader = !a_moduleid,
		sections = [],
		headerheight = 20,
		rowheight = 40,
		headers = 0,
		rows = 0;
		Ti.API.log("RENDERING table!");
		modules.forEach(function(moduleid) {
			if (showmoduleheader){
				var modulesection = Ti.UI.createTableViewSection({
					headerTitle: C.content.getText(moduleid+"_title")
				});
				sections.push(modulesection);
			}
			Ti.API.log("---- module "+moduleid);
			var submodules = C.content.getModuleWithSubModules(moduleid);
			for (var submoduleid in submodules) {
				Ti.API.log("---- ---- submodule " + submoduleid);
				var section = Ti.UI.createTableViewSection();
				if (submoduleid !== "NONE") {
					headers++;
					var header = K.create({
						k_type: "View",
						height: headerheight,
						backgroundColor: "#red",
						k_children: [{
							k_type: "Label",
							text: C.content.getText("module_"+submoduleid + "_title")
						}]
					});
					section.headerView = header;
				}
				submodules[submoduleid].forEach(function(skillid) {
					Ti.API.log("---- --- ---- " + skillid);
					var x = excluded.indexOf(skillid) != -1;
					rows++;
					section.add(Ti.UI.createTableViewRow({
						skillid: skillid,
						height: rowheight,
						moduleid: moduleid,
						submoduleid: submoduleid,
						selected: false,
						title: (x ? "(" : "") + C.content.getText("skill_" + skillid + "_title") + (x ? ")" : ""),
						backgroundColor: x ? "#CCC" : "#FFF",
						excluded: x
					}));
				});
				sections.push(section);
			}
		});
		table.setData(sections);
		Ti.API.log("rendered table!!");
		Ti.API.log(table.data);
		return headers * headerheight + rows * rowheight;
	};

	return table;
};
