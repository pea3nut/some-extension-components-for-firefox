const Content =new Chaz('background','content');
const RuleURI ='http://127.0.0.1/works/addon-recommend/test/recommend-Rules.json';
const updateFrequency =24*60*60*1000;
const Develop =true;
var Rules =null;


// 一些初始化工作
~async function (){
    browser.storage.local.set({
        user_action:{
            close:{}
        }
    });
    // 获取Rules
    var {update_time:updateTime} =await browser.storage.local.get('update_time');
    if(!updateTime || updateTime-(+new Date)<updateFrequency || Develop){
        let response =await fetch(RuleURI+'?'+ +new Date);
        Rules =await response.json();
        Rules.reminders =Rules.reminders.filter(({type})=>type==='addon');//过滤以及兼容旧版配置文件
        browser.storage.local.set({
            update_time :+new Date,
            recommend_rules :Rules,
        });
    }else{
        0,{recommend_rules:Rules} =await browser.storage.local.get('recommend_rules');
    };
}();



// 绑定推荐匹配
Content.on('key',function({key},sender){
    var rule =Rules.rules.find(rule=>rule.keyEvent&&key===rule.keyEvent);
    if(!rule)return;
    renderUseAddonIds(rule['reminder_ids']);
});
Content.on('url',function({url},sender){
    var rule =Rules.rules.find(rule=>rule.regexp&&(new RegExp(rule.regexp)).test(url));
    if(rule)    Develop&&console.log('match url:'+url);
    else return Develop&&console.log('miss url:'+url);
    renderUseAddonIds(rule['reminder_ids']);
});
/**
 * 是否可以提示用户。返回值根据Rules有关
 * @return {Boolean}
 * */
async function canHintUser(addonId){
    var {user_action:userAction} =await browser.storage.local.get('user_action');
    console.log(userAction);
    if(!userAction.close[addonId])return true;
    var hintedTodayCount =function(){
        var returnValue =0;
        for(let closeData of userAction.close[addonId]){
            var inToday =new Date - closeData.date < 24*60*60*1000;
            if(inToday)returnValue++;
        };
        return returnValue;
    }();
    var hintedCount =userAction.close[addonId].length;
    return Rules['consts']['max_daily_addon'] > hintedTodayCount
        && Rules['consts']['max_close_count'] > hintedCount
    ;
}
/**
 * 根据给出的add-on ID渲染多个推荐
 * @param {Array} addonIds
 * */
async function renderUseAddonIds(addonIds){
    addonIds.forEach(async function(addonId){
        var renderInfo =Rules.reminders.find(({addon_id})=>addon_id===addonId);
        if(!renderInfo) return Develop&&console.warn('miss '+addonId);
        let tmp =await canHintUser(addonId);
        if(!tmp)return Develop&&console.warn(addonId+'hint exceeding frequency limit');
        console.log(tmp);
        render(renderInfo);
    });
}
/**
 * 根据推荐信息，渲染通知
 * */
async function render({addon_id,title,desc,url,addon_name}){
    var createId =await browser.notifications.create({
        type    :'basic',
        message :`推荐您使用"${addon_name}"：`+(desc||''),
        title   :title||'免费使用适合本网站的扩展！',
        iconUrl :browser.extension.getURL('/images/addon-preview-default.jpg'),
    });
    browser.notifications.onClicked.addListener(function(id){
        if(id===createId)browser.tabs.create({
            url,
            active :true,
        });
    });
    browser.notifications.onClosed.addListener(async function(id){
        if(id!==createId)return;
        var {user_action:userAction} =await browser.storage.local.get('user_action');
        if(!userAction.close[addon_id]){
            userAction.close[addon_id] =[];
        }
        userAction.close[addon_id].push({date:+new Date});
        browser.storage.local.set({
            user_action:userAction,
        });
    });
}

//*/