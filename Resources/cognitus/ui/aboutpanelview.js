(function(){
	C.ui.createAboutPanelView = function(){
		var panel = Ti.UI.createView({
			top: 0,
			height: 50,
			zIndex: 5,
			visible: 0
			//, backgroundColor: "green"
		});
		var mailbtn = C.ui.createButton({
			left: 10,
			width: 140,
			k_click: function(e){
				Titanium.UI.createEmailDialog({
					toRecipients: ["developer@dbt-app.com"],
					subject: "Cognitus Application feedback",
					html: true,
				}).open();
			},
			textid: "about_btn_mail",
			image: Ti.Filesystem.resourcesDirectory+"/images/icons/mail_plain.png"
		});
		panel.add(mailbtn);
		
		var ratebtn = C.ui.createButton({
			right: 10,
			width: 140,
			image: Ti.Filesystem.resourcesDirectory+"/images/icons/rate.png",
			k_click: function(e){
				Ti.Platform.openURL("itms://itunes.apple.com/app/id?mt=8");
			},
			textid: "about_btn_rate"
		});
		panel.add(ratebtn);
		
		return panel;
	};
})();