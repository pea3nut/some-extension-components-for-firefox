browser.runtime.onMessage.addListener(function(data ,sender){
    if(!(
        'type' in data
        && data.type ==='transfer_to_native'
    ))return;
    console.log('transfer',...data.args);
    return Promise.resolve(23333);

    // setTimeout(function(){
    //     console.log("sent");
    //     browser.runtime.sendNativeMessage(
    //         'native_launcher',
    //         { type: "open_native_app", data: {target:'notepad'} }
    //     );
    // },500)
    // return browser.runtime.sendNativeMessage(...data.args);
});