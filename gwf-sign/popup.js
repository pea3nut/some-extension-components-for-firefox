document.querySelector('#openInBaidu').addEventListener('click',function(){
    browser.runtime.sendMessage({
        type :'google2baidu'
    });
});