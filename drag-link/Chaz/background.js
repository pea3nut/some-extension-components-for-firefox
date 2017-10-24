console.log('background.js');
const Content =new Chaz('background','content');
const Popup   =new Chaz('background','popup');


Content.on('hello',function(data ,sender ,callback){
    console.log(`background.js: receive content.js's hello "${data}"`);
    Content.send('hello','hello content.js, this is background.js').then(function(data){
        console.log(`background.js say "hello" ,content.js response "${data}"`);
    });
    return new Promise(function(resolve){
        setTimeout(function(){
            resolve('hi');
        },100);
    });
});

Popup.on('hello',function(data ,sender ,callback){
    console.log(`background.js: receive popup.js's hello "${data}"`);
    Popup.send('hello','hello popup.js, this is background.js').then(function(data){
        console.log(`background.js say "hello" ,popup.js response "${data}"`);
    });
    setTimeout(function(){
        callback('hi');
    },100);
    return true;
});

// Content.on('hello',function(data ,sender ,callback){
//     console.log('receive content.js\'s hello: '+data);
//     callback('ok');
//     Content.send('hello',+new Date);
// });


// Popup.on('hello',function(data ,sender ,callback){
//     console.log('receive Popup.js\'s hello: '+data);
//     callback('ok');
//     Popup.send('hello','汪汪汪！');
// });