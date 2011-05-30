C.ui.createSkillTable = function(o, callback, excluded) {
	var table = Ti.UI.createTableView(K.merge(o,{}));
	table.addEventListener("click", function(e) {
		if (e.row && e.row.skillid) {
			callback(e.row.skillid,e.row.moduleid);
		}
	});
	table.render = function(moduleid) {
		Ti.API.log("RENDERING table for module "+moduleid);
		var submodules = C.content.getModuleWithSubModules(moduleid),
			sections = [];
		for (var submoduleid in submodules) {
			Ti.API.log("---- submodule "+submoduleid);
			var section = Ti.UI.createTableViewSection();
			if (submoduleid !== "NONE") {
				var header = K.create({
					k_type: "View",
					height: 20,
					backgroundColor: "#red",
					k_children: [{
						k_type: "Label",
						text: C.content.getText(submoduleid + "_title")
					}]
				});
				section.headerView = header;
			}
			submodules[submoduleid].forEach(function(skillid) {
				Ti.API.log("---- ---- "+skillid);
				var x = excluded.indexOf(skillid) != -1;
				section.add( Ti.UI.createTableViewRow({
					skillid: skillid,
					moduleid: moduleid,
					submoduleid: submoduleid,
					selected: false,
					title: (x ? "(" : "") + C.content.getText("skill_" + skillid + "_title") + (x ? ")" : ""),
					backgroundColor: x ? "#CCC" : "#FFF",
					excluded: x
				}) );
			});
			sections.push(section);
		}
		table.setData(sections);
		Ti.API.log("rendered table!!");
		Ti.API.log(table.data);
	};

	return table;
};
