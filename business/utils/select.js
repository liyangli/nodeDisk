
/**
根据不同类型进行渲染不同展示
type: monitor
表明为前端。前端展示还包含对应分中心，允许进行多选操作

type:server
表明为频道，频道支持多选。频道不归属具体前端。运行多选
*/

(function($,win){


    var Entry = function(key,value){
        this.key = key;
        this.value = value;
    };
    var Map = function(datas){
        if(datas){
            if(datas instanceof Array){
                this.datas = datas;
            }
        }else{
            this.datas = new Array();
        }
    };
    Map.prototype = {
        put: function(key,value){
            //数组中存放对应数据
            var flag = false;
            $.each(this.datas,function(i,data){
                if(data.key == key){
                    data.value = value;
                    flag = true;
                }
            });
            if(!flag){
                var entry = new Entry(key,value);
                this.datas.push(entry);
            }
        },
        find: function(key){
            //根据键获取对象
            var value = null;
            $.each(this.datas,function(i,data){
                if(data.key == key){
                    value = data.value;
                }
            });
            return value;
        },
        findKey: function(){
            //获取所有key
            var keys = [];
            $.each(this.datas,function(i,data){
                keys.push(data.key);
            });
            return keys;
        },
        sort: function(func){
            //排序方式
            this.datas.sort(func)
        }
    };
  function getRequest() {  //获取url的传值

      var url = location.search; //获取url中"?"符后的字串
      var theRequest = new Object();
      if (url.indexOf("?") != -1) {
          var str = url.substr(1);
          strs = str.split("&");
          for(var i = 0; i < strs.length; i ++) {
              theRequest[strs[i].split("=")[0]]=(strs[i].split("=")[1]);
          }
      }
      return theRequest;
  }
  var request = getRequest();
  var url = request.url;
  if(url == ""){
    url = "http://127.0.0.1/";
  }else{
     var indexOf = url.indexOf("http://");
     if(indexOf == -1){
       url  = "http://"+url;
     }
  }
//需要获取请求的数据，根据请求的类型进行区分不同功能类型
 //选择器对象
 var Select = function(){};
Select.prototype.doQuery = function(){
  //执行真正的查询操作
  var url = this.__findURL();
  if(!url){
    return ;
  }
  var self = this;
  try{
    $.getJSON(url,function(data){
       //表明获取了真实的数据，需要开始进行整理画对应页面布局展示了。。
       try{
         var msg = self.__makeData(data);
       }catch(e){
         alert(e);
       }
       $("#showContent").html(msg);
       //进行调用回调
        $(".checkAll").on("click",function(){
            var flag = $(this).is(":checked");
            $("[type=checkbox]").prop("checked",flag);
        });
       self.__callBack();
    })
  }catch(e){
    alert(e);
  }

}
Select.prototype.bindEvent = function(){
  var self = this;
  $("#saveBtn").on("click",function(){
     //真正的保存动作
     self.__saveBack();
     parent.$('.close').click();
  });
  $("#resetBtn").on("click",function(){
    parent.$('.close').click();
  });
}
Select.prototype.__makeData = function(data){
  //需要子类进行继承重写该方法，绘制具体展示内容数据
  return "";
};
Select.prototype.__findURL = function(){
  return "";
};
Select.prototype.__callBack = function(){

};
Select.prototype.__saveBack = function(){

}



var Monitior =  function(){};
Monitior.constructor = Select.constructor;
Monitior.prototype = new Select();
Monitior.prototype.__makeData = function(data){
  //开始执行对应显示内容

 var ids = request.ids;
 var monitorIds = ids.split(",");
 var haveLen = monitorIds.length;
  var msg = '';
    msg += '<div style="text-align: left;"><input  type="checkbox"   class="checkAll"/>';
    msg +='<label>全选</label></div> ';
  for(var i=0,len=data.length;i<len;i++){
     var device = data[i];
     var monitors = device.monitors;
     var mLen = monitors.length;
     if(mLen == 0){
       continue;
     }
      msg += "<div><fieldset><legend>";
      msg += '<input  type="checkbox" data-deviceId ="'+device.id+'" id ="'+device.id+'"  class="device"/>';
      msg +='<label for ="'+device.id+'" style = "cursor: pointer;">'+device.name+'</label></legend> ';
      msg +='<ul class="list_lr clear">';

      for(var k=0;k<mLen;k++){
        var monitor = monitors[k];
        msg += '<li data-li-name="'+monitor.name+'" title="'+monitor.name+'" class="autoHide textLeft" style="width:33%;">';
        var checkeFlag = "";
        for(var m=0;m<haveLen;m++){
           if(monitorIds[m] == monitor.id){
             checkeFlag += "checked=checked";
             break;
           }
        }

        msg += '<input type="checkbox" '+checkeFlag+' data-monitorName="'+monitor.name+'" name="monitor" value="'+monitor.id+'" class="monitor_'+device.id+'"/>';
            msg +='<label for ="monitor_'+device.id+'_'+monitor.id+'" style="cursor: pointer;">'+monitor.name+'</label>';
            msg += '</li>';
      }
      msg += '</ul>';
      msg += "</fieldset></div>";
  }


  return msg;
}
Monitior.prototype.__findURL = function(){
  return url+"/findAllMonitor";
}
Monitior.prototype.__callBack = function(){
  //回调方法；

   $(".device").on("click",function(){
      var deviceId = $(this).attr("data-deviceId");
      if($(this).is(":checked")){
        $(".monitor_"+deviceId).prop("checked","checked");
      }else{
        $(".monitor_"+deviceId).prop("checked",false);
      }
   });
};
Monitior.prototype.__saveBack = function(){
    //点击保存时进行触发的动作
      var flag = false;
      var msg = "";
      var monitorName = "";
      var monitors = $("[class*=monitor_]");
//      var radio = $("input[name='monitor']:checked");
//      msg = radio.val();
//      monitorName = radio.attr("data-monitorName");
      for(var i = 0,len=monitors.length;i<len;i++){
         var monitor = $(monitors[i]);
         if(monitor.is(":checked")){
             if(flag){
               msg += ",";
               monitorName += ",";
             }else{
               flag = true;
             }
             msg += monitor.val();
             monitorName += monitor.attr("data-monitorName");
         }
      }
      //组装好数据进行返回保存内容；
      parent.$("#moniterIds").val(msg);
      parent.$("#monitor").attr("title",monitorName);
      parent.$("#monitor").html(monitorName);
};

var AlarmType = function(){};
AlarmType.constructor = Select.constructor;
AlarmType.prototype = new Select();
AlarmType.prototype.__makeData = function(data){
  var msg = "";
  var ids = request.ids;
  var types = ids.split(",");

  var haveLen = types.length;

    msg += '<div style="text-align: left;"><input  type="checkbox"   class="checkAll"/>';
    msg +='<label>全选</label></div> ';
//  msg += "<fieldset><legend>";

//  msg +='<ul class="list_lr clear">';
  var len = data.length;
  for(var k=0;k<len;k++){
    var alarmType = data[k];
    var name = alarmType.name;
    var id = alarmType.id;
    var sunAlarmTypes = alarmType.list;
//    msg += '<li data-li-name="'+name+'" title="'+name+'" class="autoHide textLeft" style="width:100%;">';
    msg += '<fieldset><legend>';
    msg += '<input  type="checkbox" data-id="'+id+'"   class="firstType"/>';
    msg +='<label>'+name+'</label></legend> ';
      msg +='<ul class="list_lr clear">';
    var sunLen = sunAlarmTypes.length;
    for(var i =0 ;i<sunLen;i++){
      var sunAlarmType = sunAlarmTypes[i];
      var sunName = sunAlarmType.name;
      var sunId  = sunAlarmType.id;
      msg += '<li data-li-name="'+name+'" title="'+name+'" class="autoHide textLeft" style="width:33%;">';
      var checkeFlag = "";
      for(var m=0;m<haveLen;m++){
         if(types[m] == sunId){
           checkeFlag += "checked=checked";
           break;
         }
      }
      msg += '<input type="checkbox" '+checkeFlag+' data-name="'+sunName+'"  value="'+sunId+'" class="alarmType_'+id+'"/>';
          msg +='<label for ="alarmType_'+id+'_'+sunId+'" style="cursor: pointer;">'+sunName+'</label>';
          msg += '</li>';
    }


    msg += '</ul></fieldset>';
//        msg += '</li>';
  }
//  msg += '</ul>';
//  msg += "</fieldset>";
  return msg;
};
AlarmType.prototype.__callBack = function(){
  //对应设定成功后的回调方法

  $(".firstType").on("click",function(){
      var id = $(this).attr("data-id");
      var flag = $(this).is(":checked");
      $(".alarmType_"+id).prop("checked",flag);
  });
},
AlarmType.prototype.__findURL = function(){
  return url+"/findAlarmTypes";
};
AlarmType.prototype.__saveBack = function(){
    //点击保存时进行触发的动作
      var alarmTypes = $("[class*=alarmType_]");
      var flag = false;
      var msg = "";
      var name = "";
      for(var i = 0,len=alarmTypes.length;i<len;i++){
        var at = $(alarmTypes[i]);
        if(at.is(":checked")){
            if(flag){
              msg += ",";
              name += ",";
            }else{
              flag = true;
            }
            msg += at.val();
            name += at.attr("data-name");
        }
      }
      //组装好数据进行返回保存内容；
      parent.$("#alarmTypeIds").val(msg);
      parent.$("#alarmType").html(name);
      parent.$("#alarmType").attr("title",name);
};

var Server = function(){};
Server.constructor = Select.constructor;
Server.prototype = new Select();
Server.prototype.__makeData = function(data){
  var msg = "";
    var ids = request.ids;
    if(!ids){
        ids = "" ;
    }
    var types = ids.split(";");
    var map = new Map();
    for(var i= 0,len=types.length;i<len;i++){
        var str = types[i];
        var monitorAndServer = str.split(":");
        map.put(monitorAndServer[0],monitorAndServer[1]);
    }


    msg += '<div style="text-align: left;"><input  type="checkbox"   class="checkAll"/>';
    msg +='<label>全选</label></div> ';
   //进行遍历前端，进行展示出来
    var len = data.length;
    for(var k=0;k<len;k++){
        var monitor = data[k];
        var name = monitor.name;
        var id = monitor.id;
        var haveServer = map.find(id);
        if(!haveServer){
            haveServer = "";
        }
        var haveServers = haveServer.split(",");
        var haveLen = haveServers.length;
        var servers = monitor.servers;
        msg += '<fieldset><legend>';
        msg += '<input  type="checkbox" data-id="'+id+'"   class="monitor"/>';
        msg +='<label>'+name+'</label></legend> ';
        msg +='<ul class="list_lr clear">';
        var sLen = servers.length;
        for(var i =0 ;i<sLen;i++){
            var server = servers[i];
            var sunName = server.name;
            var sunId  = server.id;
            msg += '<li data-li-name="'+name+'" title="'+sunName+'" class="autoHide textLeft" style="width:33%;">';
            var checkeFlag = "";
            for(var m=0;m<haveLen;m++){
                if(haveServers[m] == sunId){
                    checkeFlag += "checked=checked";
                    break;
                }
            }
            msg += '<input type="checkbox" '+checkeFlag+' data-pName="'+name+'" data-pId="'+id+'" data-name="'+sunName+'"  value="'+sunId+'" class="monitor_'+id+'"/>';
            msg +='<label for ="monitor_'+id+'_'+sunId+'" style="cursor: pointer;">'+sunName+'</label>';
            msg += '</li>';
        }


        msg += '</ul></fieldset>';
//        msg += '</li>';
    }



  return msg;
};
Server.prototype.__callBack = function(){
    $(".monitor").on("click",function(){
        var id = $(this).attr("data-id");
        var flag = $(this).is(":checked");
        $("[class*=monitor_"+id+"]").prop("checked",flag);
    });
};
Server.prototype.__findURL = function(){
  return url+"/findServer?monitor="+parent.$("#moniterIds").val();
}
Server.prototype.__saveBack = function(){
    //点击保存时进行触发的动作
    //需要进行记录前端时那个组织格式为前端#频道,频道;前端#频道,频道
     var servers = $("[class*=monitor_]");
    var map = new Map();
    for(var i= 0,len=servers.length;i<len;i++){
        var server = $(servers[i]);
        if(server.is(":checked")){
//            var monitor = {};
//            monitor.id = server.attr("data-pId");
//            monitor.name = server.attr("data-pName");
            var monitor = server.attr("data-pId")+","+server.attr("data-pName");
            var value = map.find(monitor);
            if(!value){
                value = [];
            }
            value.push({id:server.val(),name: server.attr("data-name")});
            map.put(monitor,value);
        }

    }
    //把对应id和名称进行设定上去
    var monitors = map.findKey();
    var names = "";
    var ids = "";
    var flag = false;
    for(var i= 0,len=monitors.length;i<len;i++){
        var monitor = monitors[i];
        var monitorStr = monitor.split(",");
        var monitorId = monitorStr[0];
        var monitorName = monitorStr[1];
        if(flag){
            names += ";";
            ids += ";";
        }else{
            flag = true;
        }
        names += monitorName+"#";
        ids += monitorId+":";

        var servers  = map.find(monitor);
        var serverFlag = false;
        for(var j = 0,jlen = servers.length;j<jlen;j++){
            if(serverFlag){
                names += ",";
                ids += ",";
            }else{
                serverFlag = true;
            }
            var server = servers[j];
            var serverId = server.id;
            var serverName = server.name;
            names += serverName;
            ids += serverId;

        }

    }

      //组装好数据进行返回保存内容；
      parent.$("#serviceIds").val(ids);
      parent.$("#service").html(names);
      parent.$("#service").attr("title",names);
};



  $(function(){
      //初始化时进行加载。
      var type = request.type;
      if("monitor" == type){
        var select = new Monitior();
         select.bindEvent();
         select.doQuery();

      }else if ("alarmType" == type){
        var select = new AlarmType();
        select.bindEvent();
        select.doQuery();
      }else{
      var   select = new Server();
         select.bindEvent();
         select.doQuery();
      }

  });
})(jQuery,window)
