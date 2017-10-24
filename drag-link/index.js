document.addEventListener("dragstart",function(e){
    var dragElt =e.target;
    if(dragElt.tagName.toLowerCase()!=='a')return;

    
    var elt =createChooseModal();
    document.body.appendChild(elt);

    var temp =elt.querySelectorAll('div');
    var openActive =temp[1];
    var openBackground =temp[0];

    openActive.addEventListener('dragover',preventDefault);
    openBackground.addEventListener('dragover',preventDefault);

    openActive.addEventListener('drop',openTab(false));
    openBackground.addEventListener('drop',openTab(true));
    
    
    function openTab(isBackground){
        return function (e){
            e.preventDefault();
            browser.runtime.sendMessage({
                url :dragElt.href,
                isBackground,
            });
            document.body.removeChild(elt);
        }
    };
    function createChooseModal(){
        var elt =document.createElement('div');
        elt.setAttribute('style',`
            width :100%;
            height :100%;
            position :fixed;
            top :0;
            left :0;
            background-color :#666;
            color :#fff;
            box-sizing:border-box;
            font-size:30px;
            opacity:0.8
        `);
        elt.innerHTML =`
            <div style="box-sizing:border-box;width:50%;height:100%;float:left;padding-right:1em;display:flex;justify-content:flex-end;align-items:center;border-right:3px solid #000;">
                <p>后台标签打开</p>
            </div>
            <div style="box-sizing:border-box;width:50%;height:100%;float:left;padding-left:1em;display:flex;justify-content:flex-start;align-items:center;border-left:3px solid #000;">
                <p>新标签打开</p>
            </div>
        `;
        return elt
    };
    function preventDefault(e){
        e.preventDefault();
    };
});





