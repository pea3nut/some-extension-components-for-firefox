class Chaz{
    /**
     * @param selfType {string|Symbol} 自身的脚本类型
     * @param targetType {string} 目标的脚本类型
     * */
    constructor(selfType,targetType){
        this.eventMap={};
        this.develop =true;

        this.selfType =selfType;
        this.targetType =targetType;

        //连接池
        this.connectPool =new Set();

        this.init();
    };
    init(){
        if(!Chaz.allowScriptType.includes(this.selfType)){
            throw new Error(`Chaz.init: selfType "${this.selfType} is not allowed."`);
        };
        if(this.selfType==='background'&&Chaz.needConnect){
            this.connectTransfer();
            Chaz.needConnect =false;
            if(!this.targetType) return;//仅建立连接，无需继续实例化
        }else if(this.selfType==='content'&&Chaz.needConnect){
            this.connectBackground();
            Chaz.needConnect =false;
        };
        if(!Chaz.allowScriptType.includes(this.targetType)){
            throw new Error(`Chaz.init: targetType "${this.selfType} is not allowed."`);
        };
        browser.runtime.onMessage.addListener((...argn)=>{
            if(!Chaz.isNormalChazEvent(argn[0]))return;
            return this.onMessageListener(...argn);
        });
    };
    connectTransfer(){
        browser.runtime.onMessage.addListener((data ,sender ,callback)=>{
            if(
                !Chaz.isChazEvent(data)
                || Chaz.isNormalChazEvent(data)
            )return;//不是Chaz事件或是普通Chaz事件
            switch(true){
                case data.transfer://转发请求
                    return Chaz.send(data.data,{
                        transfer  :true,
                        tabIdPool :this.connectPool,
                    });
                case data.hello://将连接添加进连接池
                    this.connectPool.add(sender.tab.id);
                    return Promise.resolve(sender.tab.id);
                case typeof data.goodbye==='string'://将连接从连接池基础
                    this.connectPool.delete(+data.goodbye);
                    return Promise.resolve(`delete ${sender.tab.id} in pool.`);
                case data.extra://额外的查询报文

            };
        });
        if(browser.tabs && browser.tabs.onActivated){
            browser.tabs.onActivated.addListener(activeInfo=>{
                Chaz.activeInfo =activeInfo;
            });
        };
    };
    connectBackground(){
        Chaz.send(new Chaz.ChazEvent({
            origin :this.selfType,
            target :'background',
            hello :true,
        })).then(function(tabId){
            Chaz.tabId=''+tabId;
        });
        window.addEventListener('unload',function(){
            Chaz.send(new Chaz.ChazEvent({
                origin :this.selfType,
                target :'background',
                goodbye :Chaz.tabId,
            }));
        });
    };
    onMessageListener({origin,target,event,data},sender,callback){
        if(
            origin!==this.targetType
            || target!==this.selfType
        ) return;//丢弃事件

        //还原类似于原生的事件信息，执行事件
        if(origin==='content'){

        }
        var argns =Array.from(arguments);
        argns[0] =data;
        return this.execEvent(event,argns);
    };
    execEvent(eventType,argns){
        if(!this.eventMap[eventType]){
            this.develop&&console.warn(`ignore event ${eventType}`)
            return Promise.resolve(()=>'no listener.');
        };
        var returnValue =null;
        for(let fn of this.eventMap[eventType]){
            let tmp =fn.apply(null,argns);
            if(tmp instanceof Promise)returnValue =tmp;
            if(tmp ===true) returnValue =tmp;
        };
        return returnValue;
    };

    on(type ,listener ,options){
        if(!this.eventMap[type]) this.eventMap[type]=[];
        this.eventMap[type].push(listener);
    };

    send(eventType ,data ,tabId=null){
        var chazSendData =new Chaz.ChazEvent({
            tabId,
            origin :this.selfType,
            target :this.targetType,
            event :eventType,
            data,
        });
        if(Chaz.needTransfer(chazSendData)){
            // 将报文包装成中间报文交给background转发
            return Chaz.send(new Chaz.ChazEvent({
                origin :this.selfType,
                target :'background',
                transfer :true,
                data :chazSendData,
            }));
        }else{
            return Chaz.send(chazSendData ,{tabIdPool:this.connectPool});
        };

    };
};

Chaz.activeInfo =null;
Chaz.tabId =null;
Chaz.needConnect =true;
Chaz.allowScriptType=['content','background','popup'];
Chaz.myIsActivedTab =function(){
    return Chaz.send();
};

/**
 * Chaz事件
 * @param {object} data - 元信息
 * */
Chaz.ChazEvent =class{constructor(data){
    this.chaz     =true;//该事件是否属于Chaz的标志位
    this.transfer =!!data.transfer;
    this.hello    =!!data.hello;
    this.extra    =!!data.extra;
    this.goodbye  =data.goodbye||false;
    ['origin','target','event','tabId','data'].forEach(
        key=>{
            if(key in data)this[key]=data[key];
        }
    );
}};
/**
 * 使用Chaz.ChazEvent发送消息
 * 除非你明确知道自己要用这个，否则请使用Chaz#send
 * @param {Chaz.ChazEvent} ce
 * @param {ArrayLike} tabIdPool
 * @param {boolean} transfer - 该发送是转发过来的，用于特殊处理
 * */
Chaz.send =function(ce,{tabIdPool,transfer}={}){
    if(
        (ce.origin==='background'&&ce.target==='content')
        || (transfer && ce.target==='content')
    ){
        if(ce.tabId) return browser.tabs.sendMessage(ce.tabId ,ce);
        tabIdPool =Array.from(tabIdPool);
        return Promise.race(
            tabIdPool.map(tabId=>browser.tabs.sendMessage(tabId ,ce))
        );
    }else{
        let argn =[];
        if(typeof ce.tabId!=='undefined') argn.push(ce.tabId);
        argn.push(ce);
        return browser.runtime.sendMessage(...argn);
    };
};
/**
 * 检测此ChazEvent是否需要转交（即不可直达）
 * @param {Chaz.ChazEvent} obj
 * */
Chaz.needTransfer =function(obj){
    return Chaz.isChazEvent(obj)
        && obj.origin !=='background'
        && obj.target !=='background'
    ;
};
/**
 * 检测对象是否是一个Chaz.ChazEvent
 * 由于事件通过JSON传递，会丢失__proto__，因此无法使用instanceof
 * @param {Chaz.ChazEvent} obj
 * */
Chaz.isChazEvent =function(obj){
    return typeof obj==='object'
        && obj.chaz===true
        && obj.origin
        && obj.target
    ;
};
/**
 * 检测对象是否是一个普通报文
 * @param {Chaz.ChazEvent} obj
 * */
Chaz.isNormalChazEvent =function(obj){
    return Chaz.isChazEvent(obj)
        && obj.transfer !==true
        && obj.hello    !==true
        && obj.goodbye  !==true
    ;
};
/**
 * 检测当前content script所在的标签是否是激活状态
 * */
Chaz.myIsActivedTab =function(){

};

// if(// 检测若在background作用域，自动建立连接
//     typeof browser !=='undefined'
//     && browser.tabs
//     && browser.runtime
// )new Chaz('background');