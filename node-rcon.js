var net = require('net');

module.exports.newHandle = function(){
this.socket=null;
this.reqID=1;
this.authed = false;
this.online = false;
this.isOnline = function() {return this.online;}
this.onResponse = function(data){console.log(data)};
this.onAuthFail = function(){console.log("AUTH FAIL");};
this.connect = function(ip,port,password){
        //TODO: CONNECT HERE//
        this.socket = net.createConnection(port,ip);
        this.socket.rcon = this;
        this.socket.on('close',function(){this.rcon.authed=false;this.rcon.online=false});
        this.socket.on('connect',function(){
          this.rcon.online=true;
          this.write(this.rcon.makePacket(0,3,password));
        });	
        this.socket.on('data',function(data){
          response = this.rcon.readPacket(data);
          if(response.type==2){
            if(response.reqID == -1){
              this.rcon.onAuthFail();
              this.destroy();
              return;
            }else{this.rcon.authed=true;return;}
          }
          this.rcon.onResponse(response);
        });
      };
this.sendCommand = function(command) {
        if(!this.authed){return;}
        this.socket.write(this.makePacket(this.reqID,2,command));
        this.reqID +=1;
        return this.reqID-1;
       };
this.makePacket = function(req,type,S1){

        var b = new Buffer(14+S1.length);
        b.writeInt32LE(10+S1.length,0);
        b.writeInt32LE(req,4);
        b.writeInt32LE(type,8);
        b.write(S1,12);
        b.writeInt16LE(0,(12+S1.length));
        return b;      
      }
this.readPacket = function(packet){
return {
reqID: packet.readInt32LE(4),
type: packet.readInt32LE(8),
data:packet.toString('utf8',12,packet.length-2)};
};
return this;
    };

