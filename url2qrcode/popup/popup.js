const imageSize =200;
const loadElt =document.getElementById("qrcode");
const Content =new Chaz('popup','content');
const Background =new Chaz('popup','background');

// 创建二维码
var qrcode = new QRCode(loadElt,{
    width :imageSize,
    height :imageSize
});
loadElt.style.width=imageSize+'px';
//
// 请求地址
~async function (){
    var activeInfo =await Background.send('getActivatedTabId');
    console.log(activeInfo);
    var url =await Content.send('getUrl',null,activeInfo.tabId);
    console.log(url)
    qrcode.makeCode(url);
}();
