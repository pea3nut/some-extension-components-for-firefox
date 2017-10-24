const ActionMap ={
    openNotepad(){
        alert('openNotepad');
    },
};
~function(el){
    const i18nKey ='chaz-i18n';
    const actionKey ='chaz-action';
    Array.from(el.getElementsByTagName('*')).forEach(function(tag){
        if(tag.hasAttribute(i18nKey)){
            tag.textContent =browser.i18n.getMessage(tag.getAttribute(i18nKey));
        };
    });
    el.addEventListener('click',function(event){
        var elt =event.target;
        while(
            !elt.hasAttribute(actionKey)
            && elt.tagName.toLocaleLowerCase()!=='body'
        )elt =elt.parentNode;

        if(elt.hasAttribute(actionKey)){
            var returnValue =ActionMap[elt.getAttribute(actionKey)].call(elt);
            if(returnValue!==false)window.close();
        };

    });
}(document.querySelector('body > .panel'));

//todo: can I use vue.js?
//todo: should only has 48x48 and 96x96 icons
//todo: miss 64x64 browser_action icon
//todo: test release
//todo: default_locale