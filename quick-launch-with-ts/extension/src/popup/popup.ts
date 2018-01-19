var vm =new Vue({
    el :'#app',
    template :'#app-template',
    data():{
        itemList:QuickLaunchItem[],
        port:browser.runtime.Port,
    }{return {
        itemList:[],
        port :browser.runtime.connectNative('native_launcher'),
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
            this.port.postMessage({
                type :'open_path',
                data :{
                    path :item.path,
                    args :item.args||[],
                },
            });
            var response:NativeResponse =await new Promise(resolve =>{
                var port =this.port;
                port.onMessage.addListener(function _self(response:NativeResponse) {
                    port.onMessage.removeListener(_self);
                    resolve(response);
                });
            }) as NativeResponse;

            if(response.errcode){
                throw new Error(`Native response: ${response.errmsg}`);
            }else{
                console.log('Success of sent to native site.');
                window.close();
            };
        },
    },
});
~async function(){
    vm.itemList =(await browser.storage.sync.get('itemList')).itemList;
}();