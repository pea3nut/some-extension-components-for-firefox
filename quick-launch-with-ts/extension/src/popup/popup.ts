new Vue({
    el :'#app',
    template :'#app-template',
    data():{
        itemList:QuickLaunchItem[],
        port:browser.runtime.Port,
    }{return {
        itemList:[],
        // see bugzil.la/1382069
        port :(<any>browser).extension.getBackgroundPage().browser.runtime.connectNative("native_launcher"),
    }},
    computed :{
        itemUiList():QuickLaunchItemUiInfo[]{
            return getItemUiList((<QuickLaunchItem[]>this.itemList).filter(i=>i.enable));
        },
    },
    filters :{
        i18n :browser.i18n.getMessage,
    },
    methods :{
        openOptionPage,
        async openItem(item:QuickLaunchItem){
            var cancelMadel =showLoadingMadel();
            var response =await new Promise<NativeResponse>(resolve =>{
                var port =this.port;
                port.onMessage.addListener(function _self(response:NativeResponse) {
                    port.onMessage.removeListener(_self);
                    resolve(response);
                });
                port.postMessage({
                    type :'open_path',
                    data :{
                        path :item.path,
                        args :item.args||[],
                    },
                });
            });

            cancelMadel();
            log('receive response.',response);
            switch(response.errcode){
                case NativeResponseState.OK:
                    window.close();
                    break;
                case NativeResponseState.EXEC_ERROR:
                    browser.notifications.create({
                        type   :browser.notifications.TemplateType.basic,
                        title  :'Error '+(<ExecErrorNativeResponse>response).data.exit_code,
                        message:(<ExecErrorNativeResponse>response).data.stderr,
                    });
                    break;
                default:
                    throw new Error(`Native response: ${JSON.stringify(response)}`);
            };
        },
    },
    async created(){
        this.itemList =(await browser.storage.sync.get('itemList')).itemList;
    },
});

