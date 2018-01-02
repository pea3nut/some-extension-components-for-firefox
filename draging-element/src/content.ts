interface AdditionalActionMap{
    [dataType: string]: AdditionalActionSinger;
}
interface AdditionalActionSinger{
    (data:AdditionalActionSingerData):void;
}
interface AdditionalActionSingerData{
    beDraggedElt:HTMLElement;
    dropTargetElt:HTMLElement;
    dataItem:DataTransferItem;
    data:DataTransfer;
}
interface BrowserDefaultActionTester {
    (data: BrowserDefaultActionTesterData): boolean;
}
interface BrowserDefaultActionTesterData{
    beDraggedElt:HTMLElement;
    dropTargetElt:HTMLElement;
    dataTypes:string[];
    data:DataTransfer;
}

new class App{
    dev:boolean =true;//todo: set false when release
    constructor(){
        this.log('app run');
        this.init();
    };
    log(...args){this.dev&&console.log(...args)};
    init(){
        const app =this;
        /**
         * When drag a local file to web-page, it dose have dragstart and dragend event.
         * So:
         *  - Use dragover event and thisEventIsDragStart variable to hacks dragstart
         *  - Use drag to hacks dragend. Each Listener will be called by be bound order.
         * */
        var thisEventIsDragStart =true;
        document.addEventListener('dragover',function(event){
            if(!thisEventIsDragStart)return app.log('deny dragover as dragstart');
            else {
                thisEventIsDragStart=false;
                document.addEventListener(
                    'drop',
                    function(){
                        app.log('reset thisEventIsDragStart');
                        thisEventIsDragStart =true;
                    }
                );
            }

            event.preventDefault();

            var beDraggedElt =event.target as HTMLElement;
            var dropTargetElt:HTMLElement =function(){
                document.addEventListener(
                    'drop',
                    event=>{dropTargetElt =event.target as HTMLElement},
                    {once:true}
                );
                return null;
            }();
            var dataType:string =null;
            var callWithDropped:AdditionalActionSinger =null;



            for(let [type,fn] of Object.entries(App.additionalActionMap)){
                if(event.dataTransfer.types.includes(type)){
                    callWithDropped =fn;
                    dataType =type;
                    break;
                };
            };

            if(callWithDropped ===null)return;

            {// to allow drop
                let dragoverListener =function(event){
                    event.preventDefault();
                };
                document.addEventListener('dragover',dragoverListener);
                document.addEventListener(
                    'drop',
                    ()=>document.removeEventListener('dragover',dragoverListener),
                    {once:true}
                );
            };

            document.addEventListener('drop',function(event){
                if(event.defaultPrevented)return app.log('have been consumed by other listener');
                if(App.browserDefaultActions.some(fn=>fn({
                    beDraggedElt,
                    dropTargetElt,
                    dataTypes:event.dataTransfer.types,
                    data:event.dataTransfer,
                })))return app.log('can be consumed by browser');
                event.preventDefault();
                app.log('run callback',dataType);
                callWithDropped({
                    beDraggedElt,
                    dropTargetElt,
                    dataItem:Array.from(event.dataTransfer.items).find(i=>i.type===dataType),
                    data:event.dataTransfer,
                });
            },{once:true});


        });
    };
    static openNewTab({url,active=false}){
        browser.runtime.sendMessage(<ExtensionMessage>{
            dir :'content2background',
            type:'openUrl',
            payload:{url,active},
        });
    };

    static additionalActionMap:AdditionalActionMap={
        'text/uri-list'(data){
            data.dataItem.getAsString(url=>App.openNewTab({url}));
        },
        'Files'(data){
            var items =Array.from(data.data.items) as DataTransferItem[];
            for(let item of items){
                let file =item.getAsFile();
                console.log(file);
                let url =URL.createObjectURL(file);
                App.openNewTab({url});
            };
        },
    };
    static browserDefaultActions:BrowserDefaultActionTester[]=[
        function(data){
            if(!data.dataTypes.includes('text/plain'))return false;
            var elt =data.dropTargetElt;
            while(elt!==document.documentElement){
                if(elt.tagName.toLowerCase()=== 'textarea')return true;
                elt =elt.parentElement;
            };
            return false;
        },
        function(data){
            if(!data.dataTypes.includes('text/plain'))return false;
            var elt =data.dropTargetElt;
            while(elt!==document.documentElement){
                if(
                    elt.tagName.toLowerCase() ==='input'
                    &&(<HTMLInputElement>elt).type ==='text'
                )return true;
                elt =elt.parentElement;
            };
            return false;
        },
        function(data){
            if(!data.dataTypes.includes('text/plain'))return false;
            var elt =data.dropTargetElt;
            while(elt!==document.documentElement){
                if(elt.contentEditable=== 'true')return true;
                elt =elt.parentElement;
            };
            return false;
        },
    ];
};

