const Background =new Chaz('content','background');
Background.send('url',{url:document.URL});
document.addEventListener('keypress',function(event){
    var key ='';
    event.ctrlKey   &&(key+='ctrl+');
    event.altKey    &&(key+='alt+');
    event.shiftKey  &&(key+='shift+');
    key +=String.fromCharCode(event.charCode);
    key =key.toLowerCase();
    Background.send('key',{key});
});