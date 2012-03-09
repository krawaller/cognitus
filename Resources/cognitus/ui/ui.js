(function() {

	var flexSpace = Titanium.UI.createButton({
		systemButton: Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});



	function createModal(o) {
		o = o || {};
		var closefun = function() {
			if (o.onClose) {
				o.onClose();
			}
			modal.visible = false;
		};
		var showfun = function(arg) {
			if (o.onShow) {
				o.onShow(arg);
			}
			modal.visible = true;
		};
		var modal = Ti.UI.createView({
			zIndex: 500,
			visible: false
		});
		var panel = Ti.UI.createView({
			borderSize: 1,
			borderColor: "#000",
			backgroundColor: "#FFF",
			opacity: 1,
			top: 20,
			left: 20,
			right: 20,
			bottom: 20,
			zIndex: 501
		});
		modal.add(panel);
			var modalbackground = Ti.UI.createView({
			backgroundColor: "#000",
			opacity: 0.5
//			backgroundColor: "rgba(0,0,0,0.8)",
//			k_class: "modalbackgroundview",
		});
		modal.add(modalbackground);
		if (!o.noclose) {
			var closebtn = C.ui.createButton({
				k_type: "Button",
				top: 5,
				left: 5,
				width: 34,
				height: 34,
				zIndex: 1000,
				backgroundImage: "/images/icons/close.png",
				k_click: closefun
			});
			panel.add(closebtn);
		}
		modal.close = closefun;
		modal.show = showfun;
		modal.panel = panel;
		// helptextid provided?
		if (o.helptextid) {
			var helpbtn = C.ui.createButton({
				zIndex: 1000,
				height: 34,
				width: 34,
				top: 10,
				right: 10,
				backgroundImage: "/images/icons/information.png",
				k_click: function() {
					pb.pub("/showhelpmodal", C.content.getText(o.helptextid), true);
				}
			});
			modal.panel.add(helpbtn);
		}
		// finish
		return modal;
	}



	function createPage(o) {
		o = K.merge({
			k_type: "View",
			//"ScrollView",
			backgroundColor: "#FFF",
			contentHeight: 'auto'
			//showVerticalScrollIndicator:o.noscroll?false:true
		},
		o || {});
		var view = K.create(o);
		return view;
	}



	function createTextArea(o) {
		return createTextField(o, true);
	}



	function createTableView(o) {
		var table = K.create(K.merge(o || {},
		{
			k_type: "TableView"
		}));
		return table;
	}



	function createTextField(o, area) {
		o = o || {};
		if (C.state.platform === "android"){
			o.height = 40;
		} else {
			var donebtn = K.create({
				k_class: "keyboardtoolbarbutton",
				title: "↓",
				font: {
					fontWeight: "bold"
				},
				k_click: function(e) {
					textfield.blur();
				},
				style: Titanium.UI.iPhone.SystemButtonStyle.BORDERED
			});
			var toolbartitle = K.create({
				k_class: "keyboardtoolbarlabel",
				text: o.hintText || o.toolbarTitle
			});
			o = K.merge(o, {
				keyboardToolbar: [flexSpace, toolbartitle, flexSpace, donebtn],
				k_events: {
					focus: function(e) {
						toolbartitle.text = ((textfield.hintText) || (textfield.toolbarTitle) || "");
					}
				}
			});
		}
		var textfield = K.create(K.merge(o,{
			k_type: area ? "TextArea" : "TextField"
		}));
		if (o.adjustscroll) {
			textfield.addEventListener("focus", function(e) {
				//o.containingTable && o.containingTable.scrollToIndex(o.rowIndex);
			});
			textfield.addEventListener("blur", function(e) {
				//o.containingView && o.containingView.scrollTo(0,0);
				//o.containingTable && o.containingTable.scrollToIndex(0);
			});
		}
		return textfield;
	}

	function createTableSection(title,heavy){
		if (title){
			headerview = createTableSectionHeader(title,heavy);
			if (C.state.platform == "android"){
				sec = Ti.UI.createTableViewSection({});
				r = Ti.UI.createTableViewRow({
					height: headerview.height,
					iamaheader: true
				});
				r.add(headerview);
				sec.add(r);
			} else {
				sec = Ti.UI.createTableViewSection({headerView: headerview});
			}
		} else {
			sec = Ti.UI.createTableViewSection({});
		}
		return sec;
	}

	function createTableSectionHeader(text, heavy) {
		var header = K.create({
			k_type: "View",
			k_class: (heavy ? "tableheaderheavyview" : "tableheaderview")
		});
		header.add(createLabel(undefined, {
			text: text,
			k_class: "tableheader" + (heavy ? "heavy" : "") + "label"
		}));
		return header;
	}



	function createTableViewRow(o) {
		var row = K.create(K.merge(o || {},
		{
			k_type: "TableViewRow",
			selectedBackgroundImage: "/images/rowselectedbackground.png",
			height: 50
		}));
		if (o.rowtoplabel) {
			row.add(createLabel(undefined, {
				k_class: "rowtoplabel",
				text: o.rowtoplabel
			}));
		}
		if (o.rowmainlabel) {
			row.add(createLabel(undefined, {
				k_class: "rowmainlabel",
				text: o.rowmainlabel
			}));
		}
		return row;
	}



	function createLabel(id, o) {
		var label = K.create(K.merge(o || {},
		{
			k_type: "Label",
			k_class: "descriptionlabel"
			//,top: 0
		}));
		if (id) {
			C.content.setObjectText(label, id);
		}
		return label;
	}



	function createNavButton(o) {
		return createButton(o);
	}



	function createSlider(o) {
		return K.create({
			k_type: "Slider"
		},
		o);
		/*
		var label = createLabel({right:3,top:10,text:5,width:20,height:20,backgroundColor:"red"}),
			slider = K.create({k_type:"Slider",right: 20,zIndex:5,min:o.min,max:o.max}),
			view = K.create(K.merge({k_type:"View",height:20},o));
		//view.add(label);
		view.add(slider);
		slider.value = o.value || 5;
		slider.addEventListener("change",function(e){
			label.text = Math.round(e.value);
			view.value = Math.round(e.value);
		});
		return view;
		*/
	}

	C.utils = C.utils || {};
	if (C.state.platform == "android"){
		C.utils.setButtonText = function(btn,txt){
			btn.setButtonText(txt);
		};
		C.utils.setButtonIcon = function(btn,img){
			if (!btn.setLeftIcon){
				btn.backgroundImage = img;
			} else {
				btn.setLeftIcon(img);
			}
		};
		C.utils.setButtonState = function(btn,bool){
			btn.setActiveState(bool);
		};
	} else {
		C.utils.setButtonText = function(btn,txt){
			btn.title = txt;
		};
		C.utils.setButtonIcon = function(btn,img){
			btn.image = img;
		};
		C.utils.setButtonState = function(btn,bool){
			btn.opacity = bool?1:0.5;
			btn.enabled = bool;
		};
	};

	function createButton(o) {
		o = K.merge(o || {},{
			font: {
				fontSize: 11
			},
			k_type: "Button",
			height: 32,
			backgroundImage: "/images/button32.png",
			backgroundLeftCap: 5
		});
		if (C.state.platform != "android"){
			btn = K.create(o);
			if (o.textid) {
				C.content.setObjectText(btn, o.textid, "title");
			}
		} else {
			var setActiveState = function(state){
				if (label){
					label.color = !!state?"#FFF":"#999";
				}
				btn.opacity = state ? 1 : 0.5;
				btn.touchEnabled = !!state;
			}
			if (o.width < 36){ // icon button!
				btn = K.create(o);
				btn.setActiveState = setActiveState;
				return btn;
			}
			// normal button
			delete o.backgroundImage;
			delete o.backgroundLeftCap;
			var img = o.image;
			delete o.image;
			o.k_type = "View";
			if (o.width%10){
				o.width = Math.ceil(o/10)*10;
			}
			btn = K.create(o);

			var label = C.ui.createLabel(o.textid,{
				color:"#FFF",
				zIndex:100,
				touchEnabled:false,
				font:{fontSize:11},
				height: 28,
				top: 10,
				width: o.width-20
			});
			btn.add(label);

			btn.setButtonText = function(txt){ label.text = txt; };
			if (o.title){
				label.text = o.title;
			}
			
			btn.setLeftIcon = function(img){
				if (btn.width < 36) {
					btn.backgroundImage = img;
				} else {
					icon.image = img;
				}
			}
			btn.setActiveState = setActiveState;
			btn.add(Ti.UI.createImageView({
				height: 32,
				width: 5,
				left: 0,
				touchEnabled: false,
				image: "/images/button32_left.png",
				canScale: false
			}));
			btn.add(Ti.UI.createImageView({
				height: 32,
				width: 5,
				right: 0,
				touchEnabled: false,
				image: "/images/button32_right.png",
				canScale: false
			}));
			for(i=0;i*10<o.width-10;i++){
				btn.add(Ti.UI.createImageView({
					height: 32,
					left: 5+i*10,
					width: 10,
					touchEnabled: false,
					image: "/images/button32_center.png",
					canScale: false,
					zIndex: 0
				}));
			}
			var icon = Ti.UI.createImageView({
				height: 15,
				width: 25,
				image: img,
				left: 5,
				top: 8,
				touchEnabled: false
			});
			btn.add(icon);
		}
		return btn;
	}

	function createTableViewRowDeleteButton(o){
		return Ti.UI.createButton(K.merge(o||{},{
			iamadeletebutton: true,
			width: 32,
			height: 32,
			zIndex: 1000,
			iamadeletebutton: true,
			backgroundColor: "red",
			visible: false
		}));
	}

	function openConfirmDialogue(fun){
		var d = Ti.UI.createOptionDialog({
			destructive: 0,
			cancel: 1,
			options: [C.content.getText("sys_confirm"),C.content.getText("sys_cancel")],
			title: C.content.getText("sys_confirmdelete")
		});
		d.addEventListener('click',function(e){
			if (e.index === 0){
				fun();
			}
		});
		d.show();
	};

	function showMessage(textid, type) {
		alert(C.content.getText(textid));
	}

	// expose
	C.ui = {
		showMessage: showMessage,
		createTableViewRowDeleteButton: createTableViewRowDeleteButton,
		createPage: createPage,
		createLabel: createLabel,
		createButton: createButton,
		createTableView: createTableView,
		createTableViewRow: createTableViewRow,
		createTextField: createTextField,
		createTableSection: createTableSection,
		createTableSectionHeader: createTableSectionHeader,
		createTextArea: createTextArea,
		createModal: createModal,
		createSlider: createSlider,
		openConfirmDialogue: openConfirmDialogue
	};

})();

Ti.include(
	"/cognitus/ui/appwindow.js",
	"/cognitus/ui/styles.js",
	"/cognitus/ui/tab-skills.js",
	"/cognitus/ui/modulelist.js",
	"/cognitus/ui/moduleskillist.js",
	"/cognitus/ui/moduletrainsession.js",
	"/cognitus/ui/moduletrainsessionlist.js",
	"/cognitus/ui/crisis.js",
	"/cognitus/ui/newslist.js",
	"/cognitus/ui/newsitem.js",
	"/cognitus/ui/mylists.js",
	"/cognitus/ui/skillist.js",
	"/cognitus/ui/skilltable.js",
	"/cognitus/ui/test.js",
	"/cognitus/ui/languageselectmodal.js",
	"/cognitus/ui/htmlview.js"
);
