const Background =new Chaz('content','background');
document.addEventListener('mouseup',function(e){
    var checkedText =document.getSelection().toString();
    if(!checkedText)return;
    // 由于click事件会紧随mouseup之后触发
    // mouseup会让菜单显示，而click会导致菜单隐藏
    // 因此此时挂起一个微任务来延迟菜单现显示
    Promise.resolve().then(function(){
        showContextmenu({
            text :checkedText,
            event :e,
        });
    });
});

const Action ={
    copy(){
        document.execCommand('copy');
    },
    taobao(text){
        Background.send('openNewTab',{
            url:'https://s.taobao.com/search?q=abc'+text,
            isBackground:true
        });
    },
    dict(text){
        Background.send('createWindow',{
            url:'http://dict.youdao.com/app/firefox/search?q='+text,
        });
    },
    note(text){
        Background.send('createWindow',{
            url:'http://mini.note.sdo.com/my?site=firefox#text='+text,
        });
    },
    wiki(text){
        Background.send('createWindow',{
            url:'http://so.baike.com/doc/'+text,
            minWidth:750,
            minHeight:600,
        });
    },
};


var getContextmenu =function _self(){
    var elt =document.createElement('iframe');
    var url =browser.extension.getURL('/checked-contextmenu-iframe.html');
    elt.src =url;
    elt.style.border ='none';
    elt.style.width  ="9999px";
    elt.style.height ="9999px";
    window.addEventListener('message',function(e){
        if(
            typeof e.data !=='object'
            || e.data.token!=='checked-contextmenu'
            || e.data.type !=='load'
        )return;
        elt.style.width  =e.data.width;
        elt.style.height =e.data.height;
    });

    var div =document.createElement('div');
    div.appendChild(elt);
    getContextmenu =function(){
        return div;
    };
    return _self.apply(this,arguments);
};

var showContextmenu =function _self({text,event}){
    var elt =getContextmenu();
    var checkedText =null;
    var hidden =function(){
        if(!elt.style||elt.style.display!=='block')return;
        elt.style.display ='none';
        document.body.removeChild(elt);
    };
    document.addEventListener('click',hidden);
    document.addEventListener('contextmenu',hidden);
    document.addEventListener('wheel',hidden);
    window.addEventListener('message',function(e){
        if(
            typeof e.data !=='object'
            || e.data.token!=='checked-contextmenu'
            || e.data.type !=='do_action'
        )return;
        hidden();
        execAction(e.data.action,checkedText);
    });

    showContextmenu =function ({text,event}){
        checkedText =text;//闭包
        elt.style.display ='block';
        elt.style.position ='fixed';
        elt.style.top =event.clientY+'px';
        elt.style.left =event.clientX+'px';
        document.body.appendChild(elt);
    };

    return _self.apply(this,arguments);
};

function execAction(action ,text){
    if(!Action[action])return;
    Action[action](text,action);
};