console.log('content.js');
const Popup      =new Chaz('content','popup');
const Background =new Chaz('content','background');

Popup.on('hello',function(data ,sender ,callback){
    console.log(`content.js: receive popup.js's hello "${data}"`);
    Popup.send('hello','hello popup.js, this is content.js').then(function(data){
        console.log(`content.js say "hello" ,popup.js response "${data}"`);
    });
    return new Promise(function(resolve){
        setTimeout(function(){
            resolve('hi');
        },100);
    });
});

Background.send('hello','hello background.js, this is content.js').then(function(data){
    console.log(`content.js say "hello" ,background.js response "${data}"`);
});
Background.on('hello',function(data ,sender ,callback){
    console.log(`content.js: receive background.js's hello "${data}"`);
    setTimeout(function(){
        callback('hi');
    },100);
    return true;
});

// const Popup =new Chaz('content','popup');
//
// Popup.on('hello',function(data,sender,callback){
//     console.log('receive popup.js\'s hello: '+data);
//     setTimeout(()=>callback(document.URL),100);
//     return true;
// });

// const Popup =new Chaz('content','popup');
// Popup.on('hello',function(data,sender,callback){
//     console.log('receive popup.js\'s hello: '+data);
//     return new Promise(function(resolve ,reject){
//         setTimeout(function(){
//             resolve(document.URL);
//         },100);
//     });
// });

// const Background =new Chaz('content','background');
// Background.send('hello' ,'hello background.js, this is content.js').then(function(...argn){
//     console.log('background response: ',...argn);
// });
//
// Background.on('hello',function(data,sender,callback){
//     console.log('receive baskground.js\'s hello: '+data);
// });
