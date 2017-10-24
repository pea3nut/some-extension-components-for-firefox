const Content =new Chaz('background','content');
const Popup =new Chaz('background','popup');


Content.on('showButton',function(data,sender){
    browser.pageAction.show(sender.tab.id);
});
Popup.on('getActivatedTabId',function(data,sender,callback){
    callback(Chaz.activeInfo)
});
