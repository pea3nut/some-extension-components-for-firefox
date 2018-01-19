var browser ={
    i18n:{
        getMessage(key){
            return key.match(/[A-Z]?[a-z]+$/)[0]
        },
    },
    storage:{
        sync:{
            async get(){return {itemList:[{
                i18nName :'popup__notepad',
                icon :'/images/skin/notepad.png',
                path :'%windir%\\System32\\notepad.exe',
                enable :true,
            },{
                i18nName :'popup__mspaint',
                icon :'/images/skin/mspaint.png',
                path :'%windir%\\System32\\mspaint.exe',
                enable :true,
            },{
                i18nName :'popup__calc',
                icon :'/images/skin/calc.png',
                path :'%windir%\\System32\\calc.exe',
                enable :true,
            },{
                i18nName :'popup__myComputer',
                icon :'/images/skin/my-computer.png',
                path :'%windir%\\explorer.exe',
                args :[','],
                enable :true,
            }]}},
        },
    },
};