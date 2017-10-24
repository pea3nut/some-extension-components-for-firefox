class CETracking{
    /**
     * @param {Array} appIdList - an array of be allowed extension ID
     * @param {*|Function} allow - response value, if is a function, argument passed same as browser.runtime.onMessageExternal.addListener
     * */
    constructor(appIdList,allow=true){
        if(CETracking.used){
            console.warn('you has been instantiation CETracking.')
        };
        CETracking.used =true;
        this.allow =allow;
        this.appIdList =appIdList;
        this.develop =true;
        this.init();
    };
    init(){
        var that =this;
        browser.runtime.onMessageExternal.addListener(function(data,sender){
            if(!that.appIdList.includes(sender.id)){
                that.log('ignore',JSON.stringify(Array.from(arguments)));
                return;
            };
            if(typeof that.allow==='function'){
                return that.allow(...Array.from(arguments));
            }else{
                return Promise.resolve(that.allow);
            };
        });
    };
    log(...args){
        this.develop &&console.log(...args);
    };
};
CETracking.used =false;