chrome.tts.speak('奥松小车插件开始启动');

//html ->background.js //单次被动连接.



chrome.runtime.onMessageExternal.addListener(
                                             function(request, sender, sendResponse) {
                                             console.log("sender" + sender.url + "openUrlInEditor" + request.openUrlInEditor);
                                            //  sendResponse("send response");
                                            // chrome.app.window.create("popup.html",{id:"blank", frame: 'none'});
                                             if(request.query == "hasExtension"){
                                                sendResponse(true);
                                             }
                                             
                                             if(request.cmd=="getDevices"){
                                                getDevices(function(portList){
                                                        sendResponse(portList);
                                                        });
                                             }
                                             if(request.choice){
                                                connectionDevices(msg.choice);
                                             }
                                             if(request.msg){
                                                chrome.tts.speak("收到网页端消息数据",{enqueue:true});
                                                chrome.serial.send(connectionId,str2ab(request.msg),function(info){
                                                                   console.log(info);
                                                                   sendResponse(info);
                                                                   
                                                                   });
                                             }
                                             });



function msg(){

}



//html -> background.js 长连接


var serial= new Serial();
serial.options = {bitrate: 115200};

//serial.getdevices(function(portList){
//                  
//                  console.log(portList);
//                  serial.connect(portList[2],function(result){
//                                 
//                                 console.log(result);
//                                 //serial.send("bn ad 010 end");
//                                 
//                                 setInterval(function() {}, 2000);
//                                 setTimeout(function() {serial.send("bn ad 010 end",function(){
//                                                                    console.log("已经发送");
//                                                                    });
//                                            
//                                            }, 2000);
//                                 });
//                  
//                  
//                  
//                  });
//
//serial.addListener(function(info){
//                   console.log(info);
//                   });






var portExtension = null;
chrome.runtime.onConnectExternal.addListener(function (port){
                                             portExtension = port;
                                             console.log(port.name);
                                             // port.postMessage({answer:"background send message to html"});
                                             
                                             port.onMessage.addListener(function(msg)
                                                                        {
                                                                        console.log(msg);
                                                                        //chrome.tts.speak(msg.query);
                                                                        
                                                                       // port.postMessage({test:"test "});
                                                                        if(msg.query == "hasExtension")
                                                                        {
                                                                        port.postMessage({hasExtension:true});
                                                                        
                                                                        }
                                                                        if(msg.cmd == "start burner!"){
                                                                        console.log("start burner");
                                                                        startBurner();
                                                                        }
                                                                        if(msg.cmd =="getDevices"){
                                                                        
                                                                        serial.getdevices(function(portList){
                                                                                          port.postMessage({device:portList});
                                                                                          });
                                                                        
                                                                        }
                                                                        if(msg.choice)
                                                                        {
                                                                        
                                                                        serial.connect(msg.choice,function(result){
                                                                                       console.log(result);
                                                                                       if(result){
                                                                                            port.postMessage({status:"ok"});
                                                                                       }else{
                                                                                       port.postMessage({status:"error"});
                                                                                       }

                                                                                       });
//                                                                        console.log(msg.choice);
//                                                                        connectionDevices(msg.choice,function(){
//                                                                                          port.postMessage({status:"ok"});
//                                                                                          });
                                                                        }
                                                                        if(msg.status == "ok"){
                                                                            console.log("指令发送中");
                                                                        }if(msg.status == "over"){
                                                                            console.log("发送数据完成");
                                                                        }
                                                                        if(msg.msg == "pause"){
                                                                        console.log("收到暂停信号");
                                                                        }
                                                                        if(msg.msg =="contunue"){
                                                                        console.log("收到继续信号");
                                                                
                                                                        }if(msg.msg == "cancel"){
                                                                        console.log("收到取消信号");
                                                                        }
                                                                        
                                                                        if(msg.code){
                                                                        //serial.send(msg.code,function(){
                                                                                  //  console.log("发送Code "+ msg.code);
                                                                                    setTimeout(function() {serial.send(msg.code,function(result){
                                                                                                                       console.log(result);
                                                                                                                       if(result){
                                                                                                                            console.log("已经发送");
                                                                                                                       
                                                                                                                            port.postMessage({status:"over"});
                                                                                                                       }
                                                                                                                        port.postMessage({status:"off"});

                                                                                                                        serial.close();
                                                                                                                       
                                                                                                                    });
                                                                                               
                                                                                               }, 1000);
                                                                                   // });
                                                                                   
                                                                                  //  });
                                                                        }
                                                                        if(msg.cmd == "run"){
                                                                        
                                                                        }
                                                                        
                                                                        console.log(msg);
                                                                        
                                                                        });
                                             });

function matchPort(portsList,path,callback)
{
    var foundPort = null;
    if(typeof portsList == "undefine" || portsList == null)
    {
        return;
    }
    for(var i = 0; i < portsList.length; i++)
    {   var port = portsList[i];
        console.log(port.path);
        var path = port.path;
        var regex_mac = "/dev/tty.*-?[1-9]\d*";
        var regex_win = "com[1-9]\d*";
        var isfound = path.match(regex_mac)||path.match(regex_win);
        if(isfound != null &&path.match(regex_mac) ==path)
        {
            foundPort = port;
            break;
        }
    }
    callback(foundPort);
    return null;
}



//字符串转arraybufer
function str2ab(str){
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    
    for(var i=0 ; i<str.length; i++){
        bufView[i]= str.charCodeAt(i);
    }
    return bufView.buffer; //return buf;
}

//arraybuffer 转字符串
function ab2str(buf){
    
    return String.fromCharCode.apply(null,new Uint8Array(buf));
}
console.log(ab2str(str2ab("134")));




var connectionId = 0;
//var portList=[];
function Serial(){
    
    this.options = {};
    this.activePort;
    this.portsArray = [];
    this.connectionId;
    this.receive;
    this._listener;
    
    var _serialport = chrome.serial;
    this.getdevices=function(callback){
          var portList = [];
        _serialport.getDevices(function(portsList){
                               console.log(portsList);
                               
                               for(var i=0; i< portsList.length; i++){
                                    portList.push(portsList[i].path);
                               if(this.portsArray.indexOf(portsList[i])<0){
                                    this.portsArray.push(portsList[i]);
                               }
                               
                               
                               }
                               console.log(portList);
                               callback(portList);
                               //_port.postMessage({answer:portList});
                               
                               }.bind(this));
    }.bind(this),
    
    this.connect= function(path,options,callback){
        
        if(typeof arguments[1] == "function"){
            callback = arguments[1];
            options = this.options;

        }
        if(typeof arguments[0] == "function"){
            callback = arguments[0];
            path = this.activePort;
            options = this.options;
        }
        if(typeof arguments[0] == "object"){
            options = arguments[0];
            path = this.activePort;
        }
        
        if(path){
            _serialport.connect(path,options,function(result){
                                    console.log("start connect",this.portsArray);
                                
                                    for(var i=0; i< this.portsArray.length; i++){
                                        if(this.portsArray[i].path == path){
                                            this.activePort = path;
                                        }
                                
                                    }
                                    if(this.activePort){
                                
                                    }else{
                                        console.log("串口不匹配");
                                        return;
                                    }
                                if(typeof result != "undefined"){
                                    this.connectionId = result.connectionId;
                                    _serialport.onReceive.addListener(function(info){
                                                                  //console.log("recive data !!!");
                                                                  //console.log(ab2str(info.data));
                                                                  typeof this._listener == "function"? this._listener(info):null;
                                                                  
                                                                  typeof this.receive=="function"? this.receive(info):null;
                                                                  }.bind(this));
                                    if(callback){
                                        typeof callback == "function"? callback(result):null;
                                    }
                                }else{
                                    if(callback){
                                        typeof callback == "function"? callback(null):null;
                                    }
                                }
                                
                                  
                                
                                  }.bind(this));
        }
    }.bind(this),
    
    
    this.receive = function(info){
        console.log("receive data --->"+ ab2str(info.data));
    },
    this.send = function(str,callback){
        if(!(arguments[1] && typeof arguments[1] == "function")){
            callback = function(info){
            };
        }
        _serialport.send(this.connectionId,str2ab(str),callback);
        
    }.bind(this),
    this.close = function(callback){
        
        if(typeof arguments[1] == 'undefined'){
            callback = function(){};
        }
        _serialport.disconnect(this.connectionId,callback);
    }.bind(this);
    
    this.addListener = function(callback){
        this._listener = callback;
    }.bind(this);
}

//------------------------eg---------------------
//function getDevices(callback)
//{
//   var portList = [];
//    chrome.serial.getDevices(function(portsList){
//                             console.log(portsList);
//                             for(var i=0; i< portsList.length; i++){
//                             portList.push(portsList[i].path);
//                             }
//                             console.log(portList);
//                             callback(portList);
//                             //_port.postMessage({answer:portList});
//                             });
//}
//
//function connectionDevices(path,callback){
//    if(path){
//        chrome.serial.connect(path, {bitrate: 115200
//                              },function(result){
//                              console.log("连接串口");
//                              console.log(result);
//                              connectionId = result.connectionId;
//                              chrome.serial.onReceive.addListener(function(info){
//                                                                  console.log("recive data !!!");
//                                                                  console.log(ab2str(info.data));
//                                                                  });
//                              if(result){
//                                    typeof result == "function"? callback():null;
//                              }
//                              });
//    }
//};

/*
getDevices(function(portList){
           console.log(portList);
           });



sendData("test",function(info){
         console.log(info);
         });


function sendData(str,callback){
   chrome.serial.send(connectionId,str2ab(str),function(info){
//                       console.log(info);
//                       sendResponse(info);
                      
                      typeof callback == "function"? callback(info):null;
                      
                       });
}
*/

/************************ socket ***********************/

function tcpSocket(){
    
    var _tcp = chrome.sockets.tcp;
    this.option = {};
    this.socketId = 0;
    
    this._addreceive;
    
    this.create = function(callback){
        _tcp.create(this.option,function(socketInfo){
                    this.socketId = socketInfo.socketId;
                    callback();
                    }.bind(this));
        
    }.bind(this),
    
    
    this.connect = function(address,port,callback){
        _tcp.connect(this.socketId,address,port,function(code){
                     if(code<0){
                     console.log("tcp connect error");
                     }else{
                     _tcp.onReceive.addListener(function(info){
                                                if(info.socketId == this.socketId){
                                                    typeof this._addreceive == "function"? this._addreceive(info) : null;
                                                    this.receive(info);
                                                }
                                                }.bind(this));
                     
                     _tcp.onReceiveError.addListener(function(info){
                                                     if(info.socketId == this.socketId){
                                                     this.error(info.resultCode);
                                                     }
                                                     }.bind(this));
                     }
                     }.bind(this));
    }.bind(this),
    
    this.addreceive = function(callback){
        this._addreceive = callback;
        console.log("-----"+ typeof this._addreceive);
    }.bind(this),
    
    this.listen = function(callback){
        _tcp.onReceive.addListener(function(info){
                                   if(info.socketId == this.socketId){
                                   this.receive(info);
                                   callback(info);
                                   }
                                   }.bind(this));
        _tcp.onReceiveError.addListener(function(info){
                                        if(info.socketId == this.socketId){
                                        this.error(info.resultCode);
                                        }
                                        }.bind(this));
        
        
    }.bind(this),
    
    this.setPaused = function(isPaused,callback){
        _tcp.setPaused(this.socketId,isPaused,callback);
    }.bind(this),
    
    
    this.send = function(data,callback){
        _tcp.send(this.socketId,data,callback);
    }.bind(this),
    
    this.receive = function(info){
        console.log(info);
    },
    
    this.getInfo = function(callback){
        _tcp.getInfo(this.socketId,callback);
    }.bind(this),
    
    this.getSockets = function(callback){
        _tcp.getSockets(callback);
    }.bind(this),
    
    this.init = function(callback){
        this.create(callback);
    }.bind(this)
    
}

function tcpServer(){
    
    var _tcpServer = chrome.sockets.tcpServer;
    this.option = {};
    this.socketId = 0;
    
    this.create =function(callback){
        _tcpServer.create(this.option,function(socketInfo){
                          this.socketId = socketInfo.socketId;
                          
                          console.log(this.socketId);
                          callback();
                          }.bind(this));
    }.bind(this),
    
    this.init = function(callback){
        this.create(callback);
    }.bind(this),
    
    
    this.listen = function(address,port,callback){
        _tcpServer.listen(this.socketId,address,port,function(code){
                          if(code<0){
                          this.error(code);
                          console.log("listen feald");
                          return false;
                          }else{
                          _tcpServer.onAccept.addListener(function(info){
                                                          console.log(info);
                                                          if(this.socketId==info.socketId){
                                                          this.accept(info);
                                                          }
                                                          }.bind(this));
                          
                          _tcpServer.onAcceptError.addListener(function(info){
                                                               if(this.socketId==info.socketId){
                                                               this.error(info.resultCode);
                                                               }
                                                               }.bind(this));
                          
                          callback();
                          }
                          
                          
                          }.bind(this));
        
    }.bind(this),
    this.error = function(code){
        console.log("an error ocurred with code " +code);
    },
    this.accept = function(info){
        console.log("new connect");
        console.log(info);
    },
    
    this.getInfo = function(callback){
        _tcpServer.getInfo(this.socketId,callback);
    }.bind(this),
    
    this.getSockets = function(callback){
        _tcpServer.getSockets(callback);
    }.bind(this)
    
}


function handleAccept(info){
    console.log(info);
    if(info.socketId == this.socketId){
        
        var _tcp = chrome.sockets.tcp;
        _tcp.setKeepAlive(info.clientSocketId,true,5,function(code){
                          
                          console.log(code);
                          
                          var _tcpSocket = new tcpSocket();
                          
                          _tcpSocket.socketId = info.clientSocketId;
                          
                          _tcpSocket.setPaused(false,function(){
                                               console.log("enable recv data");
                                               });
                          
                          _tcpSocket.listen(function(){
                                            console.log("start listen");
                                            });
                          
                          _tcpSocket.receive = function(info){
                          console.log(ab2str(info.data));
                          };
                          _tcpSocket.send(str2ab("test"),function(){
                                          console.log("send");
                                          });
                          
                          });
    }
}

/*
var tcps = new tcpServer();
tcps.option={
persistent:true
};

tcps.accept = handleAccept.bind(tcps);

tcps.init(function(){
          
          tcps.listen("192.168.4.3",8888,function(){
                      console.log("start listen");
                      tcps.getSockets(function(infoarray){
                                      console.log(infoarray);
                                      });
                      
                      });
    
          });
*/


//function fn(callback){
//
//    typeof callback=="function"? callback():{};
//}
//
//fn();



































