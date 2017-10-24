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
        if(info.status ==='complete' && tabId in googleListenMap){
            console.log('cancel #'+tabId);
            clearTimeout(googleListenMap[tabId]);
            delete googleListenMap[tabId];
        };
    });

    browser.notifications.onClicked.addListener(function(notificationId){
        if(!(notificationId in notificationMap))return;
        browser.tabs.update(
            notificationMap[notificationId].tabId,
            {
                url :google2baidu(notificationMap[notificationId].url)
            }
        );
        delete notificationMap[notificationId];
    });
    async function sendSign({tabId,url}){
        var notificationId =await browser.notifications.create({
            type :'basic',
            title :'使用百度搜索？',
            message :'您访问的服务当前连接过慢，可能无法使用，是否使用百度进行搜索？',
        });
        notificationMap[notificationId] =arguments[0];
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