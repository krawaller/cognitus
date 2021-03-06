$ = function(str){ return document.getElementById(str); };
$$ = function(str){ return document.querySelectorAll(str); };

var timer, startEl;
document.addEventListener('touchstart', function(e){ 
    startEl = e.target; 
    moved = false; 
    timer = setTimeout(function(){ 
        customEvent = document.createEvent("Events");
        customEvent.initEvent('down', true, true);
        startEl.dispatchEvent(customEvent);
    }, 100);  
}, false);
document.addEventListener('touchmove', function(){ moved = true; if(timer){ clearTimeout(timer); } }, false);
document.addEventListener('touchend', function(e){
    if(timer){ clearTimeout(timer); }
    
    customEvent = document.createEvent("Events");
    customEvent.initEvent('up', true, true);
    startEl.dispatchEvent(customEvent);
     
    if(!moved && e.target == startEl){
        customEvent = document.createEvent("Events");
        customEvent.initEvent('tap', true, true);
        startEl.dispatchEvent(customEvent);
    }
}, false);

var slice = Array.prototype.slice;

var tmpl = function(str, data){
    var err = "";
    try {
        var func = tmpl.cache[str];
        if (!func) {
            var strFunc = "var PPP666=[];with(obj){PPP666.push('" +
            str.replace(/[\r\t\n]/g, " ").replace(/'(?=[^#]*#>)/g, "\t").split("'").join("\\'").split("\t").join("'").replace(/<#=(.+?)#>/g, "',$1,'").split("<#").join("');").split("#>").join("PPP666.push('") +
            "');}return PPP666.join('');";
            func = new Function("obj", strFunc);
            tmpl.cache[str] = func;
        }
        return func(data);
    } 
    catch (e) {
        Ti.App.fireEvent('error', e);
    }
    return '<div style="width: 200px; margin: 0 auto; text-align: center; font-size: 20px; font-family: Helvetica; margin-top: 100px;">Something went wrong. Please try again!</div>';
};
tmpl.cache = {};

var _ = {
    each: function(obj, fn){
        (obj instanceof Array ? obj : [obj]).forEach(fn);
    }    
};

Array.prototype.remove = function(obj){
    var idx;
    while( (idx = this.indexOf(obj)) != -1 ){
        this.splice(idx, 1);
    }
    return this;
};