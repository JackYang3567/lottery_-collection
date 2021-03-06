﻿var http = require("http"),
    colors = require('colors'),
    fs = require('fs'),
    ini = require('ini'),
    path = require('path'),
    Info = ini.parse(fs.readFileSync(path.resolve(__dirname, '../../') + '/config.ini','UTF-8' )).system;

Date.prototype.Format = function(fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function Main() {
    this.data = '';
    this.project = '';
    this.type = '';
    this.expect = '';
    this.name = '';
    this.url = '';
};
Main.fn = Main.prototype;
Main.fn.getData = function() {
   
    var _this = this,
        req = http.get(_this.url, function(res) {
          
            res.on('data', function(data) {
               
               
                _this.data += data.toString();
               
            });
           
            res.on('timeout', function() {
             
                if(Info.tips == 0){
                    console.log(_this.url);
                    console.log(colors.red('--> [ ' + _this.name + ' ] 请求超时 [' + new Date().Format('yyyy-MM-dd hh:mm:ss') + ']'));
                }
            });
            res.on("end", function() {
            
                clearTimeout(request_timer);
                try {
                  
                    _this.data = eval('(' + _this.data + ')');
                        if(_this.data.code){
                            _this.data = _this.data.data;
                        
                        if (_this.data.length > 0) {
                            for (var i = 0, j = _this.data.length; i < j; i++) {
                                console.log(colors.green('--> [ ' + _this.name + ' ] [ ' + _this.data[i].expect + ' ] 开奖采集成功 [' + new Date().Format('yyyy-MM-dd hh:mm:ss') + ']'));
                            }
                        } else {
                            if(Info.tips == 0){
                                console.log(_this.url);
                                console.log('--> [ ' + _this.name + ' ] [ ' + _this.expect + ' ] ' + Info.time + '秒后重新发起采集 [' + new Date().Format('yyyy-MM-dd hh:mm:ss') + ']');
                            }
                        }
                    }else{
                        if(Info.tips == 0){
                            console.log(_this.url);
                            console.log(colors.red('--> [ ' + _this.name + ' ] ' + _this.data.msg + ' [' + new Date().Format('yyyy-MM-dd hh:mm:ss') + ']'));
                        }
                    }
                } catch (error) {
                    if(Info.tips == 0){
                        console.log(_this.url);
                        console.log(colors.red('--> [ ' + _this.name + ' ] 请查看采集源或者采集规则是否有误 [' + new Date().Format('yyyy-MM-dd hh:mm:ss') + ']'));
                    }
                }
            });
        }).on('error', function(e) {
            if(Info.tips == 0){
               
                console.log('--> [ ' + _this.name + ' ] 采集出错：' + e + ' [' + new Date().Format('yyyy-MM-dd hh:mm:ss') + ']');
            }
        });
    var request_timer = setTimeout(function() {
        req.abort();
    }, Info.abort_time * 1000);
    req.on("abort", function() {
        if(Info.tips == 0){
            console.log(_this.url);
            console.log(colors.red('--> [ ' + _this.name + ' ] 超过预定时间,终止了任务并再次执行 [' + new Date().Format('yyyy-MM-dd hh:mm:ss') + ']'));
        }
    });
};
Main.fn.main = function() {
    var _this = this;
    _this.url = 'http://' + Info.host + '/?action=grab&project=' + _this.project + '&type=' + _this.type;
    // console.log(_this.url);
    if (_this.auto) {
        _this.url += '&expect=' + (_this.now_expect ? _this.now_expect : _this.expect);
    }
    _this.getData();
};
exports.Main = Main;