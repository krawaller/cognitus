Ti.include("/assets/kralib.js");
Ti.include("/assets/pubsubhottub.js");
Ti.include("/cognitus/cognitus.js");

Titanium.UI.setBackgroundColor('#FFF');

C.state.mainWindow = C.ui.createApplicationWindow();
C.state.mainWindow.open();

pb.pub("/appstart");