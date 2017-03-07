/**
桌面应用程序处理类。
展示显示对应前端、频道和时间进行设定，默认时间为最近一天
*/

(function(win){


  // 日期格式 yyyy-MM-dd h:mm:ss
  Date.prototype.format = function(format, args) {
  	var args = args || {};
  	var o = {
  		"M+" : args.month || this.getMonth() + 1, // month
  		"d+" : args.date || this.getDate(), // day
  		"h+" : args.hour || this.getHours(), // hour
  		"m+" : args.minu || this.getMinutes(), // minute
  		"s+" : args.second || this.getSeconds(), // second
  		"q+" : Math.floor((this.getMonth() + 3) / 3), // quarter
  		"S" : this.getMilliseconds()
  	// millisecond
  	};
  	if (/(y+)/.test(format))
  		format = format.replace(RegExp.$1, (this.getFullYear() + "")
  				.substr(4 - RegExp.$1.length));
  	for ( var k in o)
  		if (new RegExp("(" + k + ")").test(format))
  			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
  					: ("00" + o[k]).substr(("" + o[k]).length));
  	return format;
  };


    //查询bean.
   var SearchBean = function(obj){
       var date = new Date();
       var defObj = {
           text: {
               tempName: "",
               moniterIds: "",
               serviceIds: "",
               alarmTypeIds: "",
               startTime: date.format('yyyy-MM-dd')+" 00:00:00",
               endTime: date.format('yyyy-MM-dd h:mm:ss'),
               filePath:"E:\\"
           },
           html: {
               alarmType: "",
               service: "",
               monitor: ""
           }
       } ;
       $.extend(defObj,obj);

       $("#startTime").val();
       $("#endTime").val();
       this.text = defObj.text;

       this.html = defObj.html;
   };

    //进行点击保存时自动设定数据；
   SearchBean.prototype.initData = function(){
       var text = this.text;
       for(var name in text){
           text[name] = $("#"+name).val();
       }
       var html = this.html;
       for(var name in html){
           html[name] = $("#"+name).html();
       }
   };

   //Dom上进行回显
   SearchBean.prototype.render = function(){
       var text = this.text;
       for(var name in text){
           $("#"+name).val(text[name]);
       }
       var html = this.html;
       for(var name in html){
           $("#"+name).html(html[name]);
       }
   };

  var Index = function(){
    var tf = require('../business/utils/tempFile.js');
    this.tempFile = new tf.tempFile();
    var date = new Date();
    $("#startTime").val(date.format('yyyy-MM-dd')+" 00:00:00");
    $("#endTime").val(date.format('yyyy-MM-dd h:mm:ss'));
    this._init();
  };

  Index.prototype._init = function(){
     this._bindEvent();
     this._loadTemp();
  };
  //加载对应模板数据
  Index.prototype._loadTemp = function(){
      var cache = this.tempFile.findAll();
      var tsVal = $("#tempSelect").val();

      //需要把对应模板数据进行设定上去
      //设定对应select
      var msg = "<option value=''>请选择</option>";
      for(var i= 0,len=cache.length;i<len;i++){

          var obj  = cache[i];
          var objText = obj.text;
          var checkedMsg = "";
          if(tsVal == objText.tempName){
              checkedMsg += " selected = 'selected' ";
          }
          msg += '<option value="'+objText.tempName+'">';
          msg += objText.tempName;
          msg += '</option>';
      }
      $("#tempSelect").html(msg)
  };
  Index.prototype._bindEvent = function(){
        var self = this;
        $(".position-abs").on("click",function(){
             //根据类型不同进行选择不同类型数据内容。可以选择
             var type = $(this).attr("data-val");
             console.log(type);
             if("server" == type){
               //表明服务
               new Boxy(
                            "<iframe style='width:730px;height:300px;'  id='Iframe_Edit' src='../ui/select.html?ids="+$("#serviceIds").val() +"&url="+$("#url").val()+"&type=server&Rnd=" + Math.random()+"' frameborder='no' border='0' marginwidth='0' marginheight='0' scrolling='no' allowtransparency='yes'></iframe>", {
                            title:"频道选择",
                            modal:true,
                            height:"200",
                            behaviours: function(c) {
                            },
                            afterHide: function() {
                            }
                        }
                    );
             }else if("alarmType" == type){
               //表明为告警类型
               new Boxy("<iframe style='width:730px;height:300px;'  id='Iframe_Edit' src='../ui/select.html?ids="+$("#alarmTypeIds").val() +"&url="+$("#url").val()+"&type=alarmType&Rnd=" + Math.random()+"' frameborder='no' border='0' marginwidth='0' marginheight='0' scrolling='no' allowtransparency='yes'></iframe>", {
               title:"故障类型",
               modal:true,
               height:"200",
               behaviours: function(c) {
               },
               afterHide: function() {
               }
             });
             }else{
               //表明分前端
               new Boxy(
                            "<iframe style='width:730px;height:300px;'  id='Iframe_Edit' src='../ui/select.html?ids="+$('#moniterIds').val()+"&url="+$("#url").val()+"&type=monitor"+"&Rnd=" + Math.random()+"' frameborder='no' border='0' marginwidth='0' marginheight='0' scrolling='no' allowtransparency='yes'></iframe>", {
                            title:"前端选择",
                            modal:true,
                            height:"200",
                            behaviours: function(c) {
                            },
                            afterHide: function() {
                            }
                        }
                    );
             }
        });
        //应用为模板事件
        $(".saveTemp").on("click",function(){
            try {
                var searchBean = new SearchBean();
                searchBean.initData();
                self.tempFile.save(searchBean);
            } catch (e) {
                alert(e);
            }
            //成功后进行刷新对应内容
            self._loadTemp();
            alert("success");
        });
        $(".export").on("click",function(){
           //开始执行对应导出功能
          //  moniterIds=1013&serverIds=670,690,710&startTime=2016-02-01&endTime=2016-02-02
          var moniterIds =$("#moniterIds").val();
          if(moniterIds == "") {
            alert("请先选择前端");
            return;
          }
          var serverIds = $("#serviceIds").val();
          if(serverIds == ""){
            alert("请先选择对应频道");
            return;
          }
            var alarmTypeIds = $("#alarmTypeIds").val();
            if(alarmTypeIds == ""){
                alert("请先选择对应告警类型");
                return;
            }
           var data = {
             moniterIds: moniterIds,
             serverIds:serverIds,
             alarmTypeIds: alarmTypeIds,
             startTime: $("#startTime").val(),
             endTime: $("#endTime").val(),
             filePath: $("#filePath").val()
           };
           var url = $("#url").val();
           if(url == ""){
             url = "http://127.0.0.1/";
           }else{
              var indexOf = url.indexOf("http://");
              if(indexOf == -1){
                url  = "http://"+url;
              }
           }
           try{
             $.post(url+"/export",data,function(obj){
               if(obj.flag == 'true'){
                 alert("导出成功");
               }else{
                 alert(obj.msg);
               }
             })
           }catch(e){
             alert(e);
           }
        });
        //下拉框发生改变时自动设定上

        $("#tempSelect").on("change",function(){
            var name = $(this).val();
            var searchBean = {};
            if(name == ""){
                //需要把页面上各项都进行清空;
                searchBean = new SearchBean();
            }else{
                //进行从缓存中匹配最新内容数据
                try {
                    var  obj = self.tempFile.findByName(name);
                    if (obj == null) {
                        searchBean = new SearchBean();
                    }else{
                        //根据对应对象进行组装实体bean
                        searchBean = new SearchBean(obj);
                    }
                } catch (e) {
                    alert(e);
                }
            }
            //内容进行回显
            searchBean.render();

        });
  };
  $(function(){
      //初始化，通过对应NodeJS进行获取是否已经设定对应模板信息
     var index = new Index();
  });
})(window)
