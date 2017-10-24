~function(){
    browser.browserAction.onClicked.addListener(function(){
        ~async function(){
            var [{tab}] =await browser.sessions.getRecentlyClosed({maxResults:1});
            browser.sessions.restore(tab.sessionId);
        }();//https://bugzilla.mozilla.org/show_bug.cgi?id=1398672
    });
    var fn =null;

    browser.sessions.onChanged.addListener(fn =function(){
        ~async function (){
            var tabs =await browser.sessions.getRecentlyClosed({maxResults:1});
            if(tabs.length){
                browser.browserAction.enable();
            }else{
                browser.browserAction.disable();
            }
        }();
    });
    fn();


    browser.sessions.onChanged.addListener(fn =function(){
        ~async function(){
            await browser.contextMenus.removeAll();
            var tabs =await browser.sessions.getRecentlyClosed({maxResults:10});
            for(let {tab} of tabs){
                browser.contextMenus.create({
                    title: tab.title,
                    icons :{
                        '16':tab.favIconUrl,
                        '32':tab.favIconUrl
                    },
                    contexts: ['browser_action'],
                    onclick(){
                        browser.sessions.restore(tab.sessionId);
                    }
                });
            };
        }();
    });
    fn();
}();