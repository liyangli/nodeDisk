/**
 * 模板处理文件，相当于内存处理问题。每次进行匹配内存中是否含有对应数据
 * 如果不存在进行查询指定位置的文件tempFile文件中进行读取
 *
 * 在进行修改内存数据时进行同步到文件中
 * User: liyangli
 * Date: 2016/4/27
 * Time: 19:05
 */
var TempFile = (function(){

    //对应缓存数组
    var CACHES = [];
    var Response = function(flag,msg,data){
        this.flag = flag;
        this.msg = msg;
        this.data = data;
    };

    //文件处理类
    var FileDeal = function(){
        this.fs = require("fs");
        this.file = "demo.txt";
    };
    FileDeal.prototype = {
        read: function(){
            var self = this;
            self.fs.readFile(self.file,'utf-8',function(err,data){
                if(err){
                    alert("错误信息："+err+",内容数据："+data);
                }else{
                    CACHES = JSON.parse(data);
                }
            });
        },
        readSync: function(){
            var self = this;
            var jsonObj = "";
            try {
                jsonObj =self.fs.readFileSync(self.file, 'utf-8');
            } catch (e) {
                alert(e);
            }
            return jsonObj;
        },
        write: function(content){
            var self = this;
            self.fs.writeFile(self.file, content, function(err){
                if(err)
                    console.log("写入文件失败，错误码： " + err);
                else
                    console.log("写入文件ok");
            });
            console.info("我在appendFile 之后进行执行的。。。");
        }
    };

    /**
     * 缓存代理对象，主要进行处理缓存和对应缓存与文件内容进行同步处理
     * 对外提供对应访问缓存方式和缓存内容进行写入接口
     * 接口：
     * findAll
     * 说明：查询所有缓存对象，主要通过数组方式返回。数组中是具体对象 ；
     * 如果缓存内容为空会进行同步对应数据数据；有效处理修改文件的情况下能够查询到数据；（最好方式通过文件最后修改时间进行同步对照缓存数据。）
     * save
     * 说明：缓存保存接口。如果名称已经匹配了就自动覆盖原来对象
     *
     * 内部私有方法
     * _findByFile
     * 查询文件中对应设定内容；
     * _writeByFile:
     * 把缓存数据同步到文件中
     *
     * 初始化：
     * 在初始化时自动与文件内容进行匹配；主要进行方便后续操作。
     *
     *
     *
     * @constructor
     */
    var TempCacheAgent = function(){
        this.fileDeal = new FileDeal();
        console.log(this.fileDeal);
//        this._readFileSync();
    };
    //查询所有缓存数据
    TempCacheAgent.prototype.findAll = function(){
       if(CACHES.length == 0){
           //表明没有数据。需要进行查询对应文件进行同步数据了
           this._findByFile();
       }
        return CACHES.concat();
    };
    //缓存数据进行保存
    TempCacheAgent.prototype.save = function(obj){
        //1、遍历数组中是否含有该对象。如果含有则直接进行覆盖。否则进行追加上去
        if(typeof obj != 'object'){
            var msg = "对应保存对象不是" ;
            console.log(msg);
            return new Response(false,msg);
        }
        var flag = false;
        for(var i = 0,len=CACHES.length;i<len;i++){
            var cacheObj = CACHES[i];
            var objName = obj.text.tempName;
            var cacheName = cacheObj.text.tempName;
            if(cacheName == objName){
                flag = true;
                CACHES[i] = obj;
                break;
            }
        }
        var msg = "";
        if(!flag){
            msg += "对象追加到了内存中";
            CACHES.push(obj);
        }else{
            msg += "对象被覆盖到了内存中。。";
        }
        this._writeByFile();
        return new Response(true,msg);
    };

    //同步进行获取文件中对应数据。主要需要同步方式进行获取
    TempCacheAgent.prototype._findByFile = function(){
        var cacheData = this.fileDeal.readSync();
        if(cacheData){
            CACHES = JSON.parse(cacheData);
        }
    };
    //通过异步方式进行把内存中对应数据进行设定到文件中；
    TempCacheAgent.prototype._writeByFile = function(){
        this.fileDeal.write(JSON.stringify(CACHES));
    };
    TempCacheAgent.prototype._readFileSync = function(){
        this.fileDeal.read();
    };
    //根据名称进行匹配对象
    TempCacheAgent.prototype.findByName = function(name){
        var caches = CACHES.concat();
        var cache = null;
        for(var i = 0,len=caches.length;i<len;i++){
            var cacheObj = caches[i];
            if(cacheObj.text.tempName == name){
                cache = cacheObj;
                break;
            }
        }
        return cache;
    };




   return  TempCacheAgent;
})();

/*var tempFile = new TempFile();
//获取所有缓存数据
console.log(tempFile.findAll());
tempFile.save({name:'liyangli',age:"123",address:'bj'});
tempFile.save({name:'liyangli1',age:"123",address:'bj'});
tempFile.save({name:'liyangli2',age:"123",address:'bj'});
tempFile.save({name:'liyangli3',age:"123",address:'bj'});
tempFile.save({name:'liyangli4',age:"123",address:'bj'});
tempFile.save({name:'liyangli5',age:"123",address:'bj'});
console.log(tempFile.save({name:'liyangli7',age:"123",address:'bj'}));
console.log(tempFile.findAll());*/
module.exports.tempFile = TempFile;

