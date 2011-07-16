(function() {	
	 var theme = {
		textColor:'#000000',
		grayTextColor:'#888888',
		headerColor:'#333333',
		lightBlue:'#006cb1',
		darkBlue:'#93caed',
		fontFamily: K.os({
			iphone:'Helvetica Neue',
			android:'Droid Sans'
		})
	};
	C.ui.theme = theme;

	C.ui.properties = {
		//grab platform dimensions only once to save a trip over the bridge
		platformWidth: Ti.Platform.displayCaps.platformWidth,
		platformHeight: Ti.Platform.displayCaps.platformHeight,
		animationDuration: 300,
		//we use these for default components
		Label: {
			color:theme.textColor,
			font: {
				fontFamily:theme.fontFamily,
				fontSize:15
			},
			height: "auto",
			textAlign: "center",
			verticalAlign: "top",
			verticalTextAlign: "center"
		},
		TextArea: {
			borderWidth: 2
		},
		TextField: {
			borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
			height: 30	
		},
		// styleclasses
		titlesuperlabel: {
			font: {fontSize:13},
			color: "#113a6f"	
		},
		titlemainlabel: {
			color: "#113a6f",
            font: {fontSize:17,fontWeight:"bold"}
		},
		descriptionlabel: {
			height: 15,
			color: "blue",
			textAlign: "center",
			font: {
				fontFamily: theme.fontFamily,
				fontSize: 14
			}
		},
		rowtoplabel: {
			top: 0,
			left: 20,
			textAlign: "left",
			font: {
				fontSize: 10
			}
		},
		quizswitch: { // only used in moduletrainsession
			
		},
		quizslider: { // only used in moduletrainsession
			
		},
		quizquestionlabel: { // used in moduletrainsession, headlining each question
			left: 10,
			height: 20,
			top: 5,
			color: "green"	
		},
		rowmainlabel: {
			top: 18,
			left: 5,
			textAlign: "left",
			color: "#000",
			font: {
				fontSize: 16,
				fontWeight: "bold"
			}
		},
		rowmainwrittenlabel: {
			top: 20,
			left: 25,
			height: 30,
			textAlign: "left",
			font: {
				fontSize: 14,
				fontStyle: "italic"
			}
		},
		rowtopleftlabel: {
			top: 0,
			left: 0,
			height: 20,
			width: "auto",
			font: {
				fontSize: 10
			},
			color: "#666"
		},
		rowtoprightlabel: {
			top: 0,
			height: 20,
			left: 5,
			width: "auto",
			color: "#444",
			font: {
				fontSize: 12,
				fontWeight: "normal",//"bold",
				textDecoration: "underline"
			}
		},
		tableheaderlabel: {
			color: "#FFF",
			textAlign: "left",
			shadowColor: '#333',
			shadowOffset: { y: -1, x: 0 },
			font: { fontWeight: 'bold', fontSize: 15 },
			left: 10
		},
		tableheaderheavylabel: {
			color: "#FFF",
			textAlign: "left",
			left: 30,
			font: {fontWeight:"bold"}
		},
		tableheaderview: {
			height: 20,
			backgroundImage: "images/headerview.png"
			//backgroundColor: "#red"
		},
		tableheaderheavyview: { // used in skilltable.js, where we have double section levels
			height: 30,
			backgroundColor: "#blue"
		},
		inpagesuptitlelabel: { // used in notesmodal
			textAlign: "center", height: 15, font: {fontSize: 10}, color: "#666"
		},
		inpagemaintitlelabel: { // used in notesmodal
			textAlign: "center", height: 25, font: {fontSize: 14, fontWeight: "bold"}
		},
		keyboardtoolbarbutton: { // used in ui.js for textfield and textarea
			k_type: "Button"
		},
		keyboardtoolbarlabel: { // used in ui.js for textfield and textarea
			k_type: "Label",
			width: 200,
			height: 20,
			font: {
				fontSize: 14,
				fontWeight: "bold"
			},
			backgroundColor: "#12BC0F",
			color: "#FFF"
		},
		modalbackgroundview: { // the transparent background view in the modal panels
			k_type: "View",
			backgroundColor: "rgba(0,0,0,0.8)",
			zIndex: 150
		},
		modalpanelview: { // the panel containing the modal stuff
			k_type: "View",
			borderSize: 1,
			borderColor: "#000",
			backgroundColor: "#FFF",
			top: 20,
			left: 20,
			right: 20,
			bottom: 20,
		},
		markedrow: { // marking the current row in the history table and notes table
			backgroundImage: "images/rowselectedbackground.png" 
		},
		blockedrow: { // marking unavailable rows in list- and skillselection
			backgroundColor: "#CCC"
		}
	};
})();

//global shortcut for UI properties, since these get used A LOT. polluting the global
//namespace, but for a good cause (saving keystrokes)
var $$ = C.ui.properties;
