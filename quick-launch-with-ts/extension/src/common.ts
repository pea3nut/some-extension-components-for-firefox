function getItemUiList(items:QuickLaunchItem[]):QuickLaunchItemUiInfo[]{
    return items
        .map(function(item){
            var shortName:string =function(item){
                if('i18nName' in item)return browser.i18n.getMessage(item.i18nName);
                else if('name' in item)return item.name;
                else if('path' in item)return item.path.split('\\').pop();
                else throw new Error('Could not get shortName from item.')
            }(item);
            var fullName:string =function(item,shortName){
                var result =shortName;
                if(item.path) result +=` (${item.path})`;
                return result;
            }(item,shortName);
            var icon:string =function(item){
                if('icon' in item)return item.icon;
                else if('path' in item)return getIconFromPath(item.path);
                else throw new Error('Could not get icon from item.')
            }(item);
            return {
                icon,
                shortName,
                fullName,
                origin :item,
            };
        })
    ;
};
async function selectFile():Promise<string>{
    var response =await browser.runtime.sendNativeMessage(
        'native_launcher',
        {type :'select_file'}
    );
    if(response.errcode){
        throw new Error(`Native response: ${response.errmsg}`);
    };
    return response.data.path;
};
function getIconFromPath(path:string){
    return `moz-icon://.${path.split('.').pop()}?size=32`;
    // todo:
    // when moz-icon is full available, parse path env and use this code:
    // return `moz-icon:file:///${path.replace(/\\/g,'/')}?size=32`;
    // bug see http://bugzil.la/1428271
};
async function openOptionPage(){
    return (<any>browser).windows.create({
        type: 'detached_panel',
        url: '/options/options.html',
        width: 650,
        height: 450
    });
};