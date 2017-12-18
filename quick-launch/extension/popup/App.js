class App{
    constructor({actionMap,el}){
        this.i18nKey   ='chaz-i18n';
        this.actionKey ='chaz-action';
        this.el =el;
        this.actionMap =actionMap;
        this.init();
    };
    init(){
        Array.from(this.el.getElementsByTagName('*')).forEach(tag=>{
            if(tag.hasAttribute(this.i18nKey)){
                tag.textContent =browser.i18n.getMessage(tag.getAttribute(this.i18nKey));
            };
        });
        this.el.addEventListener('click',event=>{
            var elt =event.target;
            while(
                !elt.hasAttribute(this.actionKey)
                && elt.tagName.toLocaleLowerCase()!=='body'
                )elt =elt.parentNode;

            if(elt.hasAttribute(this.actionKey)){
                this.actionMap[elt.getAttribute(this.actionKey)].call(elt).then(()=>window.close());
            };
        });
    };
};
App.debug =true;// Set false when release.
App.createOpenAction =function(appName){
    return async function(){
        var response =await browser.runtime.sendNativeMessage(
            'native_launcher',
            {
                type :'open_native_app',
                data :{
                    target :appName,
                },
            }
        );
        if(response.errcode){
            throw new Error(`Native response: ${response.errmsg}`);
        }else{
            App.debug &&console.log('Success of sent to native site.');
        };
    };
};