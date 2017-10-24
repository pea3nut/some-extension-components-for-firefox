browser.runtime.onMessage.addListener(function(request){
    browser.tabs.create({
        url :request.url,
        active :!request.isBackground,
    });

    // # Firefox 55依旧不支持openerTabId
    // browser.tabs.query({active: true}).then(function(tabs){
    //     browser.tabs.create({
    //         url :request.url,
    //         active :!request.isBackground,
    //         openerTabId :browser.tabs,
    //     });
    // })
});