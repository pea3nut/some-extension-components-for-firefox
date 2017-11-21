new class App{
    constructor({filter}){
        this.filter =filter;

        this.init();
    };
    init(){
        document.addEventListener("dragstart",e=>{
            var dragElt =e.target;
            if(dragElt.tagName.toLowerCase()!=='a')return;

            var preventDefault =function(e){
                e.preventDefault();
            };

            document.addEventListener('dragover',preventDefault);

            document.addEventListener('drop',e=>{
                document.removeEventListener('dragover',preventDefault);
                if(!this.filter.every(fn=>fn(e.target)))return;
                e.preventDefault();
                browser.runtime.sendMessage({
                    dir :'content2background',
                    type:'openUrl',
                    payload:{
                        url :dragElt.href,
                        active :false,
                    },
                });
            },{once:true});


        });
    };
}({
    filter:[
        target=>target.contentEditable!=='true',
        target=>target.tagName.toLowerCase()!=='textarea',
        target=>target.tagName.toLowerCase()!=='input' ||target.type!=='text',
    ],
});
