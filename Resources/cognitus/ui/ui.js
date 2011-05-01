(function() {

    function createPage(o) {
		delete o.backgroundColor; // TODO - remove in respective file!
        var view = K.create(K.merge({
            k_type: "View"
            //, width: $$.platformWidth
        },
        o));
        return view;
    }
	
	var webviewmaster = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory+"/cognitus/html/master.html").read().text;
	function updateWebView(w,html){
		w.html = webviewmaster.replace(/XXXCONTENTXXX/,html);
	}
	function createWebView(o){
		var webview = Ti.UI.createWebView(K.merge({
			backgroundColor: "#FFF"
		},o||{}));
		return webview;
	}

    function createLabel(id, o) {
        var label = K.create(K.merge(o || {},{
            k_type: "Label",
			textAlign: "left",
			verticalAlign: "top",
			left: 10,
			k_class: "textLabel"
        }));
        C.content.setObjectText(label, id);
        return label;
    }

	function showMessage(textid,type){
		alert(C.content.getText(textid));
	}

    function createAppWindow(appstructure) {
		var newlistid = (function(){
			var max = 0;
			return function(){
				return max++;
			};
		})();

        // ****************** Building the app structure from the tree
        function processContent(o, lists, pages, listid, listhistory, listpositions, level) {
            if (Array.isArray(o)) {
                // processing a List
                lists[listid] = [];
                o.forEach(function(page,i) {
                    lists[listid].push({
                        navtextid: (page.navtextid) || (page.pageid+"_nav"),
						suffix: page.sub ? !page.view ? " ↑" : " •" : "",
                        navto: (page.navto) || (page.pageid),
						level: level
                    });
					processContent(page, lists, pages, listid, [].concat(listhistory).concat(listid), [].concat(listpositions).concat([i]), level);
                });
            } else {
                // processing a Page
				if (!o.navto){
                	pages[o.pageid] = {
                    	view: o.view,
						listid: listid,
                    	listhistory: [].concat(listhistory), // must be copy
						listpositions: [].concat(listpositions), // copy
						listhistorystring: [].concat(listhistory).join(","),
						level: level,
						using: (o.using) || (""),
						pageid: o.pageid,
						basic: !o.view
                	};
				}
                if (o.sub) {
                    processContent(o.sub, lists, pages, newlistid(), listhistory, listpositions, level+1);
                }
            }
        }
        var lists = {},
        	pages = {};
		processContent(appstructure,lists,pages,newlistid(),[], [], 1);


        // ***************** Creating the window object and adding the pages
        var win = K.create({
            k_type: "Window",
            exitOnClose: true,
            orientationModes: [
				Titanium.UI.PORTRAIT,
				Titanium.UI.UPSIDE_PORTRAIT,
				Titanium.UI.LANDSCAPE_LEFT,
				Titanium.UI.LANDSCAPE_RIGHT
			],
            fullscreen: true,
			backgroundColor: "red"
        });
		var swipedir;
		var frame = K.create({
			k_type: "View",
			top: 40,
			bottom: 40,
			backgroundColor: "#FFF",
			k_children: [{
				k_type: "View",
				height: 1,
				top: 0,
				backgroundColor: "#000"
			}],
			k_events: {
				doubletap: function(e){
					updateAnchor(true);
				},
				swipe: function(e){
					swipedir = e.direction;
				},
				touchend: function(e){
					if (swipedir){
						if (swipedir === "left"){
							goBack();
						} else {
							goForward();
						}
						swipedir = false;
					}
				}
			}
		});
		win.add(frame);

        for (var pid in pages) {
            var page = pages[pid];
			if (page.view){
            	page.view.opacity = 0;
            	frame.add(page.view);
			}
        }
		
		// tab stuff
		
		var tabrows = [], rowheight = 25, btnwidth = 90, firstrowbtnwidth = 68, btnspace = 10;
		[0,1,2,3].forEach(function(row){
			var tabrow = K.create({
				k_type: "View",
				height: rowheight,
				backgroundColor: ["#AAA","#BBB","#CCC","#DDD"][row],
				bottom: row*rowheight,
				k_children: [{
					k_type: "View",
					height: 1,
					top: 0,
					backgroundColor: "#000"
				}]
			});
			var buttons = [];
			[0,1,2,3].forEach(function(col){
				var btn = K.create({
					k_type: "View",
					k_style: "NavButtonView",
					k_id: "button",
					k_children: [{
						k_type: "View",
						borderSize: 1,
						borderColor: "#000",
						width: 1,
						left: 0
					},{
						k_type: "View",
						borderSize: 1,
						borderColor: "#000",
						width: 1,
						right: 0
					},{
						k_type: "View",
						borderSize: 1,
						borderColor: "#000",
						height: 1,
						bottom: 0
					},{
						k_id: "label",
						k_type: "Label",
						height: rowheight - 5,
						width: row ? btnwidth : firstrowbtnwidth
					}],
					height: rowheight - 5,
					width: row ? btnwidth : firstrowbtnwidth,
					top: 0,
					left: btnspace+((row ? btnwidth : firstrowbtnwidth)+btnspace)*col + 15*((row)%2),
					k_click: function(e){
						pb.pub("/navto", btn.navto );
					}
				});
				buttons.push(btn);
				tabrow.add(btn);
			});
			tabrow.buttons = buttons;
			tabrows.push(tabrow);
			win.add(tabrow);
		});
		
		var anchor = K.create({
			k_type: "View",
			k_style: "NavButtonView",
			borderSize: 1,
			borderColor: "#000",
			backgroundColor: "#777",
			zIndex: 100,
			height: 30,
			width: 30,
			right: 5,
			top: 5,
			k_children: [{
				k_style: "NavButtonLabel",
				k_id: "label",
				text: "↓"
			}],
			k_click: function(e){
				updateAnchor(true);
			}
		});
		
		win.add(anchor);
		
		var showing = true;
		function updateAnchor(toggle){
			var dur = 300, prev = showing;
			showing = toggle? !showing : showing;
			if (!showing){
				anchor.k_children.label.text = "↓";
				/*
				tabrows.forEach(function(tabrow){
					tabrow.animate({bottom: -rowheight, duration: dur});
				});
				controlpanel.animate({top: -50});
				frame.animate({top:0,bottom:0}); */
				// NOANIM VERSION
				tabrows.forEach(function(tabrow){
					tabrow.bottom = -rowheight;
				});
				controlpanel.top = -50;
				frame.top = 0;
				frame.bottom = 0;
			} else {
				anchor.k_children.label.text = "↑";
				/*
				tabrows.forEach(function(tabrow,i){
					if (tabrow.showing){
						tabrow.animate({bottom: i*rowheight, duration: dur});
					}
				});
				controlpanel.animate({top: 0});
				frame.animate({top:40,bottom:rowheight});*/
				// NOANIM VERSION
				tabrows.forEach(function(tabrow,i){
					if (tabrow.showing){
						tabrow.bottom = i*rowheight;
					}
				});
				controlpanel.top = 0;
				frame.top = 40;
				frame.bottom = rowheight;
			}
		}
		
		function updateTabs(page){
			var bgcolours = ["#777","#999","#BBB","#DDD","#FFF"],
				numrows = page.listhistory.length;
			//Ti.API.log(["going to show these tabs",page.listhistory,"with these positions",page.listpositions]);
			tabrows.forEach(function(tabrow,i){
				if (i < page.listhistory.length){ // this level is shown!
					var list = lists[page.listhistory[i]];
					//Ti.API.log("Tabrow "+i+" set to listid "+page.listhistory[i]+", which has "+list.length+" tabs");
					tabrow.listid = page.listhistory[i];
					if (showing){
						tabrow.bottom = i*rowheight;
					}
					tabrow.backgroundColor = (i === 0 ? "transparent" : bgcolours[bgcolours.length - numrows - 1 + i]);
					tabrow.showing = 1;
					tabrow.buttons.forEach(function(btn,j){
						var label = btn.k_children.label;
						if (j<list.length && list[j]){
							btn.opacity = 1;
							label.text = C.content.getText(list[j].navtextid)+list[j].suffix;
							btn.navto = list[j].navto;
							if (j==page.listpositions[i]){
								label.font = {
									fontWeight: "bold",
									fontSize: 10
								};
								btn.backgroundColor = bgcolours[bgcolours.length - numrows + i];
								btn.top = 0;
							} else {
								label.font = {
									fontWeight: "normal",
									fontSize: 10
								};
								btn.top = 1;
								btn.backgroundColor = bgcolours[bgcolours.length - numrows - 1 + i];
							}
						} else {
							btn.opacity = 0;
						}
					});
				} else { // hide the tabrow;
					tabrow.listid = -1;
					tabrow.bottom = -rowheight;
					tabrow.showing = 0;
				}
			});
		}

        // ****************** Title bits
        var titleview = K.create({
            k_type: "View",
            height: 35,
            top: 5,
            width: 200,
            left: 50,
            borderWidth: 1,
			zIndex: 5,
            borderColor: "#000",
            backgroundColor: "#CCC",
            k_children: [,{
				k_id: "supertitle",
				k_type: "Label",
				font: {fontSize:10},
				top: 0
			},{
				top: 12,
				k_type: "Label",
				k_id: "maintitle",
                font: {fontSize:14,fontWeight:"bold"}
            }]
        });
        frame.add(titleview);

        function updateTitle(pagedef,args) {
			if (!pagedef){
				pagedef = C.state.currentPage;
				args = C.state.lastArgs;
			}
			if (pagedef.using !== "news"){
				titleview.k_children.maintitle.text = C.content.getText(  pagedef.pageid +"_title");
			} else {
				titleview.k_children.maintitle.text = C.content.getText(  args.NewsId +"_headline");
			}
			if (pagedef.using){
				titleview.k_children.supertitle.text = (pagedef.using === "news" ? C.content.getNewsItem(args.NewsId).date : (C.content.getText(pagedef.using === "module" ? "module_"+args.ModuleId : "skill_"+args.SkillId ) +"_title"));
				titleview.k_children.maintitle.top = 12;
			} else {
				titleview.k_children.supertitle.text = "";
				titleview.k_children.maintitle.top = 7;
			}
        }
        pb.sub("/updatetext", updateTitle);


		var controlpanel = K.create({
			k_type: "View",
			top:0,
			height:30
			
		});
		win.add(controlpanel);

		// ********************* Backbtn
		function goBack(){
			if (C.state.historyposition>0){
				var to = C.state.history[--C.state.historyposition];
				pb.pub("/navto",to.pageid,K.merge({dontadjusthistory:true},to.args));
			}
		}
		var backbtn = K.create({
            k_class: "NavButtonView",
            height: 30,
            top: 5,
            width: 30,
            left: 5,
            k_children: [{
                k_class: "NavButtonLabel",
				text: "←"
            }],
			k_click: goBack
        });
		controlpanel.add(backbtn);
		
		// ********************* Forwardbutton
		function goForward(){
			if (C.state.historyposition < C.state.history.length-1){
				var to = C.state.history[++C.state.historyposition];
				pb.pub("/navto",to.pageid,K.merge({dontadjusthistory:true},to.args));
			}
		}
		var forwardbtn = K.create({
            k_class: "NavButtonView",
            height: 30,
            top: 5,
            width: 30,
            left: 40,
            k_children: [{
                k_class: "NavButtonLabel",
				text: "→"
            }],
			k_click: goForward
        });
		controlpanel.add(forwardbtn);

		// ********************* Notes btn
		
		var notesbtn = K.create({
			k_class: "NavButtonView",
			width: 50,
			top: 5,
			left: 95,
			k_children: [{
				k_class: "NavButtonLabel",
				text: "notes"
			}]
		});
		controlpanel.add(notesbtn);

		// ********************* Language test

		var langtest = K.create({
			k_class: "NavButtonView",
			width: 50,
			top: 5,
			left: 150,
			k_children: [{
				k_class: "NavButtonLabel",
				text: "lang"
			}],
			k_click: function(e){
				var lang = C.state.lang;
				C.state.lang = (lang == "en" ? "sv" : lang == "sv" ? "textid" : "en");
				C.state.currentTitle = C.content.getText(C.state.currentPageId+"_title");
				pb.pub("/updatetext");
			}
		});
		controlpanel.add(langtest);

		// ******************* Basic text view
		
		var textview = (function(){
			var view = C.ui.createPage({
				backgroundColor: "red",
				opacity: 0
			});
			var webview = C.ui.createWebView({top:30});
			view.add(webview);
			view.render = function(argstouse,topage){
				Ti.API.log(["Updating web view",argstouse,topage]);
				var id = (topage.using === "module" ? topage.pageid+"_"+argstouse.ModuleId :
						  topage.using === "skill" ? topage.pageid+"_"+argstouse.SkillId : topage.pageid) + "_html";
				C.ui.updateWebView(webview,C.content.getText(id));
			};
			return view;
		})();
		frame.add(textview);

		// ******************* Stuff

		pb.sub("/updatetext",function(){
			if (C.state.currentPageView.render){
				C.state.currentPageView.render(C.state.lastArgs,C.state.currentPage);
			}
			updateTabs(C.state.currentPage);
		});

		// ******************* Navigation logic
		
		pb.sub("/navto",function(pageid,args){
			args = args || {};
			if (!pages[pageid]){
				throw "WTF, couldn't find "+pageid+" in tree!";
			}
			var lastpage = pages[C.state.currentPageId],
				topage = pages[pageid],
				historymax = 25;
			// HISTORY
			if (!args.dontadjusthistory && !(lastpage && topage.view === lastpage.view)){
				C.state.historyposition++;
				C.state.history.splice(C.state.historyposition);
				C.state.history.push({pageid:pageid,args:args});
			}
			delete args.dontadjusthistory;
			//Ti.API.log(["HISTORY","position="+C.state.historyposition+", size="+C.state.history.length,C.state.history]);
			backbtn.opacity = C.state.historyposition ? 1 : 0.5; // TODO - nicer! // .k_children[0].text = C.state.historyposition ? "←" : "x";
			forwardbtn.opacity = C.state.historyposition < C.state.history.length - 1 ? 1 : 0.5;
			if (C.state.history.length>historymax){
				C.state.history = C.state.history.splice(C.state.history.length-historymax);
				C.state.historyposition = C.state.history.length - 1; // since we'll only truncate after normal move, thus we're at the front!
				//Ti.API.log(["ADJUSTED HISTORY","position="+C.state.historyposition+", size="+C.state.history.length,C.state.history]);
			}
			
			
			updateTabs(topage);
			
			// textview
			if (topage.basic){
				topage.view = textview;
			}
			
			// animation
			if (lastpage && topage.view !== lastpage.view){
				/*topage.view.zIndex = 1;
				topage.view.opacity = 1;
				lastpage.zIndex = 2;
				lastpage.view.animate({opacity:0},function(){lastpage.zIndex=1;}); */
				// NOANIM VERSION
				lastpage.view.opacity = 0;
				topage.view.opacity = 1;
			} else {
				//topage.view.animate({opacity:1}); // NOANIM
				topage.view.opacity = 1;
			}
			// render stuff
			var argstouse = K.merge(args || {},C.state.lastArgs || {});
			if (argstouse.SkillId && !argstouse.ModuleId){
				argstouse.ModuleId = C.content.getModuleForSkill(argstouse.SkillId);
			}
			if (topage.view.render){
				topage.view.render(argstouse,topage);
			}
			C.state.currentPageView = topage.view;
			C.state.currentPage = topage;
			C.state.currentTitle = C.content.getText(pageid+"_title");
			updateTitle(topage,args);
			C.state.currentPageId = pageid;
			C.state.currentBack = topage.back;
			C.state.lastArgs = argstouse;
			updateAnchor();
			// skill crisis list btn
			if (topage.using === "skill"){
				crisislistitembutton.opacity = 1;
				crisislistitembutton.k_children.plusminuslabel.text = (C.content.testIfSkillOnCrisisList(args.SkillId) ? "-" : "+");
			}
			if (topage.using !== "skill"){
				crisislistitembutton.opacity = 0;
			}
		});

		// ******************** Crisis list item button
		var crisislistitembutton = K.create({
			k_class: "NavButtonView",
			top: 50,
			right: 5,
			height: 30,
			width: 30,
			opacity: 0,
			zIndex: 5,
			k_click: function(e){
				showCrisisListItemPanel(C.state.lastArgs.SkillId,false);
			},
			k_children: [{
				k_id: "plusminuslabel",
				text: "+",
				font: {
					fontSize: 20
				},
				top: 0,
				height: 20
			},{
				k_id: "crisislabel",
				k_type: "Label",
				font: {
					fontSize: 8
				},
				bottom: 0,
				height: 10
			}]
		});
		C.content.setObjectText(crisislistitembutton.k_children.crisislabel,"crisislistitem_button_tag");
		frame.add(crisislistitembutton);

		// ******************** Crisis list item panel
		var crisislistitempanel = K.create({
			k_type: "View",
			backgroundColor: "rgba(0,0,0,0.8)",
			opacity: 0,
			zIndex: 150,
			k_id: "modal",
			k_click: function(e){
				if (e.source.k_id === "modal"){
					hideCrisisListItemPanel(cip_skillid,cip_fromlist);
				}
			},
			k_children: [{
				k_type: "View",
				borderSize: 1,
				borderColor: "#000",
				backgroundColor: "#EEE",
				top: 20,
				left: 20,
				right: 20,
				bottom: 20,
				k_id: "panel",
				k_children: [{
					k_type: "Label",
					k_class: "sublabel",
					top: 10,
					height: 15,
					k_id: "modulelabel"
				},{
					k_type: "Label",
					k_class: "titlelabel",
					top: 30,
					height: 20,
					k_id: "skillabel"
				},{
					k_type: "Label",
					k_class: "instructionlabel",
					top: 55,
					height: 50,
					k_id: "instructionlabel"
				},{
					k_type: "TextArea",
					top: 110,
					height: 80,
					width: 200,
					left: 20,
					borderColor: "#CCC",
					borderSize: 1,
					value: "foo",
					k_id:"textarea"
				},{
					k_type: "View",
					k_class: "NavButtonView",
					height: 30,
					width: 100,
					bottom: 50,
					left: 10,
					k_id: "deletebtn",
					k_children: [{
						k_class: "NavButtonLabel",
						text: "del"
					}],
					k_click: function(e){
						C.content.removeSkillFromCrisisList(cip_skillid);
						showMessage("crisislistitem_message_deleted");
						setCrisisListItemPanelToAdd();
					}
				},{
					k_type: "View",
					k_class: "NavButtonView",
					height: 30,
					width: 100,
					bottom: 10,
					right: 10,
					k_id: "cancelbtn",
					k_children: [{
						k_class: "NavButtonLabel",
						text: "canc"
					}],
					k_click: function(e){
						hideCrisisListItemPanel(cip_skillid,cip_fromlist);
					}
				},{
					k_type: "View",
					k_class: "NavButtonView",
					height: 30,
					width: 100,
					bottom: 10,
					left: 10,
					k_id: "gotobtn",
					k_children: [{
						k_class: "NavButtonLabel",
						text: "goto"
					}],
					k_click: function(e){
						if (cip_fromlist){
							pb.pub("/navto","skillrational",{SkillId:cip_skillid});
						} else {
							pb.pub("/navto","mycrisisskillist");
						}
						hideCrisisListItemPanel(cip_skillid,cip_fromlist);
					}
				},{
					k_type: "View",
					k_class: "NavButtonView",
					height: 30,
					width: 100,
					bottom: 50,
					right: 10,
					k_id: "addbtn",
					k_children: [{
						k_class: "NavButtonLabel"
					}],
					k_click: function(e){
						if (cip_textarea.value && cip_textarea.value.length){
							C.content.addSkillToCrisisList(cip_skillid,cip_textarea.value);
							showMessage("crisislistitem_message_added");
							setCrisisListItemPanelToUpdate();
						} else {
							showMessage("crisislistitem_message_textneeded","error");
						}
					}
				},{
					k_type: "View",
					k_class: "NavButtonView",
					height: 30,
					width: 100,
					bottom: 50,
					right: 10,
					k_id: "updatebtn",
					k_children: [{
						k_class: "NavButtonLabel",
						text: "update"
					}],
					k_click: function(e){
						if (cip_textarea.value && cip_textarea.value.length){
							C.content.updateSkillUsageTextOnCrisisList(cip_skillid,cip_textarea.value);
							showMessage("crisislistitem_message_updated");
						} else {
							showMessage("crisislistitem_message_textneeded","error");
						}
					}
				}]
			}]
		});
		win.add(crisislistitempanel);
		var cip = crisislistitempanel.k_children.panel,
			cip_modlabel = cip.k_children.modulelabel,
			cip_skillabel = cip.k_children.skillabel,
			cip_instrlabel = cip.k_children.instructionlabel,
			cip_textarea = cip.k_children.textarea,
			cip_delbtn = cip.k_children.deletebtn,
			cip_closebtn = cip.k_children.cancelbtn,
			cip_addbtn = cip.k_children.addbtn,
			cip_updatebtn = cip.k_children.updatebtn,
			cip_gotobtn = cip.k_children.gotobtn,
			cip_fromlist,
			cip_isonlist,
			cip_skillid;
		function hideCrisisListItemPanel(skillid,fromlist){
			if (!fromlist){
				crisislistitembutton.k_children.plusminuslabel.text = (C.content.testIfSkillOnCrisisList(skillid) ? "-" : "+");
			}
			//crisislistitempanel.animate({opacity:0});
			// NOANIM
			crisislistitempanel.opacity = 0;
		}
		function setCrisisListItemPanelToAdd(){
			cip_instrlabel.text = C.content.getText("crisislistitem_instruction_add");
			cip_delbtn.opacity = 0;
			cip_updatebtn.opacity = 0;
			cip_addbtn.opacity = 1;
			cip_textarea.value = "";
		}
		function setCrisisListItemPanelToUpdate(){
			cip_instrlabel.text = C.content.getText("crisislistitem_instruction_update");
			cip_textarea.value = C.content.getCrisisListItemUsageText(cip_skillid);
			cip_delbtn.opacity = 1;
			cip_addbtn.opacity = 0;
			cip_updatebtn.opacity = 1;
		}
		function showCrisisListItemPanel(skillid,fromlist){
			cip_fromlist = fromlist;
			cip_skillid = skillid;
			cip_isonlist = (fromlist) || (C.content.testIfSkillOnCrisisList(skillid));
			cip_modlabel.text = C.content.getText("module_"+C.content.getModuleForSkill(skillid)+"_title");
			cip_skillabel.text = C.content.getText("skill_"+skillid+"_title");
			cip_textarea.hintText = "xxx"+C.content.getText("crisislistitem_instruction_hinttext");
			cip_delbtn.k_children[0].text = C.content.getText("crisislistitem_button_delete");
			cip_addbtn.k_children[0].text = C.content.getText("crisislistitem_button_add");
			cip_updatebtn.k_children[0].text = C.content.getText("crisislistitem_button_update");
			cip_gotobtn.k_children[0].text = C.content.getText("crisislistitem_button_goto_"+(fromlist ? "skill" : "list"));
			cip_closebtn.k_children[0].text = C.content.getText("crisislistitem_button_close");
			if (cip_isonlist){
				setCrisisListItemPanelToUpdate();
			} else {
				setCrisisListItemPanelToAdd();
			}
			//crisislistitempanel.animate({opacity:1});
			// NOANIM
			crisislistitempanel.opacity = 1;
		}
		pb.sub("/showcrisislistitempanel",function(skillid,fromlist){
			showCrisisListItemPanel(skillid,fromlist);
		});
		

		// ******************** Start logic

		pb.sub("/appstart",function(){
			pb.pub("/navto","home"); // TODO - fix dynamically!
		});

        // ******************* All done, returning the window!
        return win;

    }

    // expose
    C.ui = {
		showMessage: showMessage,
		createWebView: createWebView,
		updateWebView: updateWebView,
        createPage: createPage,
        createLabel: createLabel,
		createAppWindow: createAppWindow
    };

})();

Ti.include("/cognitus/ui/styles.js");

Ti.include("/cognitus/ui/tab-skills.js");
//Ti.include("/cognitus/ui/aboutmodules.js");
Ti.include("/cognitus/ui/modulelist.js");
//Ti.include("/cognitus/ui/moduleexplanation.js");
Ti.include("/cognitus/ui/moduleskillist.js");
//Ti.include("/cognitus/ui/skillexplanation.js");
//Ti.include("/cognitus/ui/skillexercises.js");
//Ti.include("/cognitus/ui/skillexamples.js");
//Ti.include("/cognitus/ui/moduletraininstruction.js");
Ti.include("/cognitus/ui/moduletrainsession.js");
Ti.include("/cognitus/ui/moduletrainhistory.js");

Ti.include("/cognitus/ui/mycrisisskillist.js");

Ti.include("/cognitus/ui/newslist.js");
Ti.include("/cognitus/ui/newsitem.js");
