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
		Window: {
			
		},
		View: {
			show: function(){}
		},
		Button: {
			height:50,
			width:250,
			color:'#000',
			font: {
				fontSize:18,
				fontWeight:'bold'
			}
		},
		NavButtonView: {
			k_type: "View",
			height: 30,
			width: 100,
			borderColor: "#000",
			borderWidth: 1,
			backgroundColor: "#CCC"
		},
		NavButtonLabel: {
			k_type: "Label"
		},
		TitleView: {
			height: 40,
			k_type: "View"
		},
		TitleLabel: {
			k_type: "Label",
			font: {
				fontWeight: "bold",
				fontSize: 20
			},
			shadowColor:'#CCC',
		    shadowOffset:{x:0,y:1}
		},
		InfoLabel: {
			
		},
		Label: {
			color:theme.textColor,
			font: {
				fontFamily:theme.fontFamily,
				fontSize:15
			},
			textAlign: "center",
			height:'auto'
		},
		TextField: {
			height:55,
			borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
			color:'#000000',
			clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ALWAYS
		},
		HeaderView: {
			backgroundColor:'#CCC',
			height:40
		}
	};
})();

//global shortcut for UI properties, since these get used A LOT. polluting the global
//namespace, but for a good cause (saving keystrokes)
var $$ = C.ui.properties;
