/*global Ti: true, K: true */

var C = {};

(function() {
	C.state = {lang:"sv",history:[],historyposition:-1};
})();


Ti.include("/assets/kralib.js");
Ti.include("/cognitus/content.js");
Ti.include("/cognitus/ui/ui.js");
K.setStyles(C.ui.properties);