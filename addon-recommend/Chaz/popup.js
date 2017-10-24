console.log('popup.js');
const Content    =new Chaz('popup','content');
const Background =new Chaz('popup','background');


Content.send('hello','hello content.js, this is popup.js').then(function(data){
    console.log(`popup.js say "hello" ,content.js response "${data}"`);
});
Content.on('hello',function(data ,sender ,callback){
    console.log(`popup.js: receive content.js's hello "${data}"`);
    return new Promise(function(resolve){
        setTimeout(function(){
            resolve('hi');
        },100);
    });
});

Background.send('hello','hello background.js, this is popup.js').then(function(data){
    console.log(`popup.js say "hello" ,background.js response "${data}"`);
});
Background.on('hello',function(data ,sender ,callback){
    console.log(`popup.js: receive background.js's hello "${data}"`);
    setTimeout(function(){
        callback('hi');
    },100);
    return true;
});
// const Content =new Chaz('popup','content');
//
// var tmp =Content.send('hello','hello content.js, this is popup.js').then(function(msg){
//     console.log(msg);
// });
// setInterval(console.log,100,tmp);


// const Background =new Chaz('popup','background');
// Background.send('hello' ,'hello background.js, this is popup.js').then(function(...argn){
//     console.log('background response: ',...argn);
// });
// Background.on('hello',function(data,sender,callback){
//     console.log('receive baskground.js\'s hello: '+data);
// });






