~function(){
    var googleListenMap ={};
    var notificationMap ={};
    var dev =true;
    const Timeout =1;

    console.log('bg.js loaded');



    browser.webRequest.onBeforeRequest.addListener(function({url,tabId}){
        if(!isGoogleUrl(url))return;
        if(tabId in googleListenMap)return;
        log('listen #'+tabId);
        googleListenMap[tabId] =setTimeout(function(){
            log('dispatch #'+tabId);
            sendSign({tabId,url});
            delete googleListenMap[tabId];
        },Timeout*1000);
    },{
        urls :[
            'https://*/search*'
        ],
        types :['main_frame'],
    });
    browser.tabs.onUpdated.addListener(function(tabId ,info ,tab){
        if(info.status ==='complete' && isGoogleUrl(tab.url)){
            //browser.pageAction.hide(tabId);
        }
        if(info.status ==='complete' && tabId in googleListenMap){
            console.log('cancel #'+tabId);
            clearTimeout(googleListenMap[tabId]);
            delete googleListenMap[tabId];
        };
    });

    browser.runtime.onMessage.addListener(function(data){
        if(!data ||data.type!=='google2baidu')return;
        ~async function(){
            var tab =(await browser.tabs.query({active:true}))[0];
            console.log(tab);
            browser.tabs.update(
                tab.id,
                {
                    url :google2baidu(tab.url)
                }
            );
        }();
    });
    async function sendSign({tabId,url}){
        browser.pageAction.show(tabId);
    };
    function google2baidu(url){
        return getBaiduSearchUrl(
            (new URLSearchParams(new URL(url).search)).get('q')
        );
    }
    function getBaiduSearchUrl(searchTerms){
        return `https://www.baidu.com/s?wd=${searchTerms}`;
    }
    function log(){
        dev &&console.log(...arguments);
    };
    function isGoogleUrl(url){
        var reg =[
            // www.google.com
            // www.google.com.hk
            /https?:\/\/www\.google(\.[^\.]+){1,2}\//
        ];
        return reg.some(r=>r.test(url));
    };
}();