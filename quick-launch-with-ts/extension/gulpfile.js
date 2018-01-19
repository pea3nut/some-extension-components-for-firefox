const Gulp = require('gulp');
const GulpTypescript = require('gulp-typescript');
const GulpSass = require('gulp-sass');
const tsProject = GulpTypescript.createProject('tsconfig.json');
const Through2 =require('through2');
const Path =require('path');
const Fse =require('fs-extra');

const Root =Path.join(__dirname);
const StaticRoot =Path.join(Root ,'static');
const DistRoot =Path.join(Root ,'dist');
const SourceRoot =Path.join(Root ,'src');


Gulp.task('build',[
    'refresh-dist',
    'build-ts',
    'build-sass',
    'build-manifest.json',
    'copy-static',
    'copy-css-html-js',
]);
Gulp.task('dev',['build'],function(){
    var timer =null;
    var semaphore =true;
    var again =false;
    Gulp.watch([`${SourceRoot}/**/*`,`${StaticRoot}/**/*`],function(){
        clearTimeout(timer);
        timer=setTimeout(function _self(){
            if(!semaphore){
                again =true;
                return;
            };
            semaphore =false;
            Gulp.start('build',function(){
                semaphore =true;
                if(again){
                    again =false;
                    _self();
                };
            });
        });
    });
});


Gulp.task('refresh-dist' ,function(){
    if(Fse.pathExistsSync(DistRoot)){
        let pathsStack =Fse.readdirSync(DistRoot).map(i=>Path.join(DistRoot,i));
        while(pathsStack.length){
            let path =pathsStack.shift();
            if(Fse.statSync(path).isDirectory()){
                pathsStack.unshift(...Fse.readdirSync(path).map(i=>Path.join(path,i)))
            }else{
                Fse.removeSync(path);
            };
        };
    }else{
        Fes.makedirSync(DistRoot);
    };
});
Gulp.task('build-ts', function() {
    return Gulp.src(SourceRoot+'/**/*.ts')
        .pipe(tsProject())
        .js.pipe(Gulp.dest(DistRoot))
    ;
});
Gulp.task('build-sass', function() {
    return Gulp.src(SourceRoot+'/**/*.+(scss|sass)')
        .pipe(GulpSass())
        .pipe(Gulp.dest(DistRoot))
    ;
});
Gulp.task('build-manifest.json', function(){
    return Gulp.src(Path.join(SourceRoot,'manifest.json'))
        .pipe(Through2.obj(function(file ,enc ,callback){
            var originJson =JSON.parse(file.contents.toString());
            var newJson =formatJson(originJson);
            file.contents =new Buffer(JSON.stringify(newJson,null,'  '));
            callback(null ,file);
        }))
        .pipe(Gulp.dest(DistRoot))
        ;
});
Gulp.task('copy-static' ,function(){
    return Gulp.src(StaticRoot+'/**/*')
        .pipe(Gulp.dest(DistRoot))
    ;
});
Gulp.task('copy-css-html-js' ,function(){
    return Gulp.src(SourceRoot+'/**/*.+(css|html|js)')
        .pipe(Gulp.dest(DistRoot))
    ;
});


function formatJson(originJson){
    var newJson ={};
    var originJsonKeys =Object.keys(originJson).sort();
    var arrayMark =[];//{keys,length}
    while(originJsonKeys.length){
        let keys =function(key){
            return Array.isArray(key)?key:[key];
        }(originJsonKeys.shift());
        let value =function(obj,keys){
            for(let key of keys){
                obj =obj[key];
            };
            return obj;
        }(originJson ,keys);

        if(typeof value ==='object'){
            let additionalKeys =Object.keys(value).sort().map(i=>[...keys,i]);
            originJsonKeys =[...additionalKeys,...originJsonKeys];
            if(Array.isArray(value))arrayMark.push({keys,length:value.length});
            continue;
        };

        {
            let obj =newJson;
            for(let i=0 ;i<keys.length-1 ;i++){
                if(!obj[keys[i]])obj[keys[i]]={};
                obj =obj[keys[i]];
            };
            obj[keys[keys.length-1]] =value;
        }

        for(let {keys,length} of arrayMark){
            let obj =newJson;
            for(let i=0 ;i<keys.length-1 ;i++){
                if(!obj[keys[i]])obj[keys[i]]={};
                obj =obj[keys[i]];
            };
            if(!obj[keys[keys.length-1]])obj[keys[keys.length-1]]={};
            obj[keys[keys.length-1]].length =length;
            obj[keys[keys.length-1]] =Array.from(obj[keys[keys.length-1]]);
        };

    };
    return newJson;
}