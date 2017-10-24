const Content =new Chaz('background','content');
Content.on('openNewTab',function({url,isBackground} ,sender ,callback){
    browser.tabs.create({
        url,
        active :!isBackground,
    });
});
Content.on('createWindow',function({url,minWidth,minHeight} ,sender ,callback){
    browser.windows.create({
        url,
        width :minWidth||550,
        height :minHeight||500,
    });
});