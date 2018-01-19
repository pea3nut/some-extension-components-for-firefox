declare const tingle:any;
declare const Sortable:any;


document.title =browser.i18n.getMessage('options__pageTitle');


var vm =new Vue({
    el :'#app',
    template :'#app-template',
    data()
        :{
            itemList:QuickLaunchItem[],
        }{return {
            itemList :[],
        };
    },
    computed :{
        itemUiList():QuickLaunchItemUiInfo[]{
            return getItemUiList(this.itemList);
        },
    },
    watch:{
        itemList(value:QuickLaunchItem[]){
        },
    },
    filters :{
        i18n :browser.i18n.getMessage,
    },
    methods :{
        syncItemList(){
            return browser.storage.sync.set({
                itemList :this.itemList,
            });
        },
        getItemName(item:QuickLaunchItem){
            return item.name||item.path.split('\\').pop();
        },
        toggle(item:QuickLaunchItem){
            item.enable =!item.enable;
            this.syncItemList();
        },
        remove(item:QuickLaunchItem){
            this.itemList.splice(this.itemList.indexOf(item),1);
            this.syncItemList();
        },
        edit(item:QuickLaunchItem){
            openItemEditor(item).then(()=>this.syncItemList());
        },
        async newItem(){
            var item =await openItemEditor();
            this.itemList.push(item);
            this.syncItemList();
        },
    },
    ready(){
        var vm =this;
        this.$nextTick(function(){
            Sortable.create(
                document.querySelector('.item-list'),
                {
                    animation: 150,
                    handle: '.hamburger-svg',
                    onSort(sortData:any){
                        vm.itemList.splice(
                            sortData.newIndex,
                            0,
                            ...vm.itemList.splice(sortData.oldIndex,1)
                        );
                        vm.syncItemList();
                    },
                }
            );
        });
    },
});


~async function(){
    vm.itemList =(await browser.storage.sync.get('itemList')).itemList;
}();


async function openItemEditor(item?:QuickLaunchItem){
    const mode:'edit'|'new' =item?'edit':'new';
    item =item||{
        enable :true,
        path:'',
        args:[],
    };

    return new Promise(function(resolve,reject){
        var modal = new tingle.modal({
            footer: mode==='new',
            stickyFooter: mode==='new',
            closeMethods: ['overlay', 'button', 'escape'],
            closeLabel: "Close",
            cssClass: ['custom-class-1', 'custom-class-2'],
            onOpen: function(){
                new Vue({
                    template:'#modal-template',
                    el :this.modalBoxContent.querySelector('#app'),
                    data(){return {
                        item,
                    }},
                    computed:{
                        itemArgs:{
                            get(){return this.item.args?this.item.args.join(' '):''},
                            set(value:string){this.item.args =value.split(' ')},
                        },
                    },
                    filters :{
                        i18n :browser.i18n.getMessage,
                    },
                    methods :{
                        async selectFile(){
                            var button:HTMLButtonElement =this.$els.selectFileButton;
                            button.disabled =true;
                            try{
                                this.item.path =await selectFile();
                            }catch(e){
                                throw e;
                            }finally{
                                button.disabled =false;
                            };
                        },
                    },
                });
            },
            onClose: function(){
                if(mode ==='new'){
                    reject();
                }else if(mode ==='edit'){
                    resolve();
                };
            },
        });
        modal.setContent('<div id="app"></div>');

        if(mode ==='new'){
            modal.addFooterBtn(
                browser.i18n.getMessage('options__addQuickLaunchItem'),
                'tingle-btn tingle-btn--pull-right tingle-btn--primary',
                function() {
                    resolve(item);
                    modal.close();
                }
            );
            modal.addFooterBtn(
                browser.i18n.getMessage('options__cancelAddQuickLaunchItem'),
                'tingle-btn tingle-btn--pull-right tingle-btn--default',
                function() {
                    reject();
                    modal.close();
                }
            );
        };
        modal.open();
    });
};