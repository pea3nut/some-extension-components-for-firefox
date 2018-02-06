const DEBUG =true;
var log =function(...args:any[]){
    DEBUG &&console.log(...args);
};

abstract class ExecErrorNativeResponse implements NativeResponse{
    errcode :NativeResponseState.EXEC_ERROR;
    errmsg  :string;
    data    :{
        exit_code:number;
        stdout:string;
        stderr:string;
    };
    static is(response:NativeResponse):response is ExecErrorNativeResponse{
        return response.errcode ===NativeResponseState.EXEC_ERROR;
    };
}

function getItemUiList(items:QuickLaunchItem[]):QuickLaunchItemUiInfo[]{
    return items.map(function(item){
        var shortName:string =function(item){
            if('i18nName' in item) return browser.i18n.getMessage(item.i18nName);
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
    });
};

var selectFile =function () {
    var port:any =browser.runtime.connectNative('native_launcher');
    var listenerQueue:((data:NativeResponse)=>{})[] =[];
    port.onMessage.addListener(function (response:NativeResponse) {
        if(listenerQueue.length ===0)return;
        listenerQueue.shift()(response);
    });
    return function():Promise<NativeResponse>{
        port.postMessage({type :'select_file'});
        return new Promise<NativeResponse>(resolve =>listenerQueue.push(<any>resolve));
    };
}();

function getIconFromPath(path:string){
    return `moz-icon://.${path.split('.').pop()}?size=32`;
    // todo:
    // when moz-icon is full available, parse path env and use this code:
    // return `moz-icon:file:///${path.replace(/\\/g,'/')}?size=32`;
    // bug see http://bugzil.la/1428271
};

async function openOptionPage(){
    return browser.windows.create({
        type: browser.windows.CreateType.detached_panel,
        url: '/options/options.html',
        width: 650,
        height: 450
    });
};

/**
 * @return {function} hidden the madel
 * */
var showLoadingMadel:()=>(()=>void) =function(){
    var madel =document.createElement('div');
    Object.assign(madel.style,{
        position:'absolute',
        top:0,
        left:0,
        width:'100%',
        height:'100%',
        display:'flex',
        background:'#000',
        opacity:'0.7',
        justifyContent:'center',
        alignItems:'center',
    });
    var img =function(){
        var img =new Image(30,30);
        img.src ='/images/loading.svg';
        return img;
    }();
    madel.appendChild(img);
    return function(){
        document.body.appendChild(madel);
        var bodyOverflow =document.body.style.overflow;
        document.body.style.overflow='hidden';
        var timer =setInterval(function(){
            var deg =0;
            return function(){
                img.style.transform =`rotate(${deg+=10}deg)`;
            };
        }(),1000/25);
        return function () {
            document.body.removeChild(madel);
            if(bodyOverflow)document.body.style.overflow=bodyOverflow;
            clearInterval(timer);
        };
    };
}();