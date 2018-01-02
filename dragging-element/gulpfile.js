var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');
var through2 =require('through2');

gulp.task('build',['build-ts','build-manifest.json']);
gulp.task('dev',['build'],function(){
    gulp.watch('src/*',['build']);
});

gulp.task('build-ts', function() {
    return gulp.src('src/**/*.ts')
        .pipe(tsProject())
        .js.pipe(gulp.dest('extension'))
    ;
});

gulp.task('build-manifest.json', function(){
    return gulp.src('src/manifest.json')
        .pipe(through2.obj(function(file ,enc ,callback){
            var originJson =JSON.parse(file.contents.toString());
            var newJson =formatJson(originJson);
            file.contents =new Buffer(JSON.stringify(newJson,null,'  '));
            callback(null ,file);
        }))
        .pipe(gulp.dest('extension'))
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

