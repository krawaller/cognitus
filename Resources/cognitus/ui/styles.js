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
			verticalTextAlign: "top"
		}
	};
})();

//global shortcut for UI properties, since these get used A LOT. polluting the global
//namespace, but for a good cause (saving keystrokes)
var $$ = C.ui.properties;
