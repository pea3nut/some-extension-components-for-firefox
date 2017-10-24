const Background =new Chaz('content','background');
const Popup =new Chaz('content','popup');

console.log('content.js is running');
Background.send('showButton');
Popup.on('getUrl',function(data,sender,callback){
    console.log('content.js #'+Chaz.tabId);
    callback(document.URL);
});

