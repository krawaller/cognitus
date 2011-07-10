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
			left: 20
		},
		tableheaderview: {
			height: 20,
			backgroundColor: "#red"
		},
		inpagesuptitlelabel: { // used in notesmodal
			textAlign: "center", height: 15, font: {fontSize: 10}, color: "#666"
		},
		inpagemaintitlelabel: { // used in notesmodal
			textAlign: "center", height: 25, font: {fontSize: 14, fontWeight: "bold"}
		}
	};
})();

//global shortcut for UI properties, since these get used A LOT. polluting the global
//namespace, but for a good cause (saving keystrokes)
var $$ = C.ui.properties;
