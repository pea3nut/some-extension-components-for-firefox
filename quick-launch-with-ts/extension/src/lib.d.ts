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
    errcode :number;
    errmsg  :string;
    data    :any;
}