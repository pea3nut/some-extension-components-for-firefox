browser.runtime.onMessage.addListener(function(data ,sender ,callback){
    if(
        !data
        || data.dir!=='content2background'
    )return;
    switch(data.type){
        case 'openUrl':
            browser.tabs.create({
                url :data.payload.url,
                active :!!data.payload.active,
            });
            break;
        default:
            console.warn(`receive an unknown event that type is ${data.type}.`);
    };
});