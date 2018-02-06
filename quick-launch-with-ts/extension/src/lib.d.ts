declare interface VueConstructor{
    new(data:any):any;
}
declare interface Vue{}
declare var Vue :VueConstructor;


interface QuickLaunchItemUiInfo{
    icon:string;
    shortName:string;
    fullName:string;
    origin:QuickLaunchItem;
}

interface QuickLaunchItem{
    name?:string;
    i18nName?:string;
    path:string;
    icon?:string;
    args?:string[];
    enable:boolean;
}

interface NativeResponse{
    errcode :NativeResponseState;
    errmsg  :string;
    data    :any;
}

declare const enum NativeResponseState{
    OK =0,
    ERROR =1,
    JSON_ILLEGAL =101,
    EXEC_ERROR =102,
    SELECT_FILE_CANCEL =103,
}