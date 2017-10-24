~async function (){
    // 获取最近关闭的标签
    var tabs =await browser.runtime.sendMessage({
        message:'request-tabs',
    });
    // 渲染UI
    var insertElt =document.getElementById('uc-insert');
    var itemTplElt =document.getElementById('uci-tpl');

    for(let {tab} of tabs){
        let tempElt =itemTplElt.cloneNode(true);
        tempElt.style.display =null;
        tempElt.title =tab.title;
        let img =tempElt.querySelector('img');
        img.src=tab.favIconUrl;
        img.onerror =function(){
            this.style.visibility ='hidden';
        };
        tempElt.querySelector('.uci-text').innerHTML =tab.title;
        tempElt.setAttribute('session-id',tab.sessionId);
        insertElt.appendChild(tempElt);
    };
    // 处理事件
    document.addEventListener('click',function(e){
        var listItem =e.target;
        while(
            listItem 
            && !listItem.classList.contains('uc-item')
        ) listItem=listItem.parentNode;
        if(!listItem)return;


        if(listItem.hasAttribute('session-id')){
            browser.runtime.sendMessage({
                message :'restore',
                sessionId :listItem.getAttribute('session-id'),
            });
        }else if(listItem.hasAttribute('run-script')){
            browser.runtime.sendMessage({
                message :'run-script',
                script :listItem.getAttribute('run-script'),
            });
        }

        window.close();
    });
}();
