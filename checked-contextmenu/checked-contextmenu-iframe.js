
var ulElt =document.getElementById('livemargins-toolset');
ulElt.addEventListener('click',function(e){
    if(!e.target.matches('li[id]'))return;
    window.parent.postMessage({
        type   :'do_action',
        action :e.target.id,
        token  :'checked-contextmenu',
    },'*');
});
window.addEventListener('load',function(){
    var style =getComputedStyle(ulElt,null);
    window.parent.postMessage({
        type   :'load',
        width  :style.width,
        height :style.height,
        token  :'checked-contextmenu',
    },'*');
});