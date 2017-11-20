new class App{
    constructor(){
        this.init();
    };
    async init(){
        var activeTab =(await browser.tabs.query({active:true}))[0];
        browser.tabs.onUpdated.addListener(this.debounce({
            fn :this.onUpdatedHandle,
            context :this,
            idle :10,
            run :[activeTab.id,{},activeTab],
        }));
        browser.tabs.onActivated.addListener(this.onActivatedHandle.bind(this));
    };
    async onActivatedHandle(){
        var activeTab =(await browser.tabs.query({active:true}))[0];
        if(this.needGenerateQRCode(activeTab.url)){
            this.showPageAction(activeTab.id);
        }else{
            this.hidePageAction(activeTab.id);
        };
    };
    onUpdatedHandle(tabId,changeInfo,tab){
        if(this.needGenerateQRCode(tab.url)){
            this.showPageAction(tabId);
        }else{
            this.hidePageAction(tabId);
        };
    };
    needGenerateQRCode(url){
        return /^(https?|ftp)\:/.test(url);
    };
    showPageAction(tabId){
        browser.pageAction.show(tabId);
    };
    hidePageAction(tabId){
        browser.pageAction.hide(tabId);
    };
    debounce({fn,idle=10,context=null,run=false,runSync=false}){
        var timer = null;
        var wrapper =function(){
            clearTimeout(timer);
            timer = setTimeout(()=>{
                fn.apply(context,arguments);
            } ,idle);
        };
        if(run)wrapper(...run);
        else if (runSync) fn.apply(context,runSync);
        return wrapper;
    };
};
