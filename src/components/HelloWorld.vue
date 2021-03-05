<template>
  <div class="hello">
    <video id="yours" autoplay></video>
    <video id="theirs" autoplay></video>
    <canvas></canvas>
    <button @click="btncapture">截图</button>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      yourConnection:null,
      theirconnection:null
    }
  },
  mounted(){
    if (this.hasUserMedia()){
      let _this =this;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.mozGetUserMedia;
      navigator.getUserMedia({video:true,audio:true},function(stream){
        
        let video = document.querySelector("#yours");
   
        try {
          video.src = window.URL.createObjectURL(stream);
          theirvideo.src = window.URL.createObjectURL(stream);
        } catch (error) {
          console.log(stream);
          video.srcObject = stream;
        
          if (_this.hasRTCPeerConnection()){
            _this.startPeerConnection(stream);
          }
          else{
            alert("抱歉不支持WebRTC");
          }
        }
        
      },function(err){
        console.log(err)
      })

    }else{
      alert("抱歉，你的浏览器不支持getUserMedia");
    }
  },
  methods:{ 
    hasUserMedia(){
      return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.mozGetUserMedia);
    },
    hasRTCPeerConnection(){
      return !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
    },
    btncapture(){
      let filters = ["","grayscale","sepia","invert"];
      let currentfilters = 0;
      let video =document.querySelector("video");
      let canves = document.querySelector("canvas");
      canves.width = video.clientWidth;
      canves.height = video.clientHeight;

      let context = canves.getContext("2d");
    
      context.drawImage(document.querySelector("video"),0,0);
      context.fillStyle = "white";
      context.fillText("Hello World",10,10)
      currentfilters++;
      if (currentfilters>filters-1) currentfilters=0;
      canves.className = filters[currentfilters];
    },
    startPeerConnection(stream){
      let configuration ={
        //开放这段注释来增加ICEservers
        //"iceServers":{{"url":"stun:127.0.0.1:9876"}}
      }
      this.yourConnection = new RTCPeerConnection(configuration);
      this.theirconnection = new RTCPeerConnection(configuration);

      //this.yourConnection = new webkitRTCPeerConnection(configuration);
     // this.theirconnection = new webkitRTCPeerConnection(configuration);
      let _this = this;
      //创建ICE处理
      this.yourConnection.onicecandidate = function(event){
        if (event.candidate){
          _this.theirconnection.addIceCandidate(new RTCIceCandidate(event.candidate));
        }
      };
   

      this.theirconnection.onicecandidate = function(event){
        if (event.candidate){
          _this.yourConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
        }
      };
      
     // this.yourConnection.ontrack 
     this.yourConnection.addStream(stream);
     this.theirconnection.onaddstream = function(e){
          let theirsvideo = document.querySelector("#theirs");
          theirsvideo.srcObject = e.stream;
     }

     
     this.theirconnection.addStream(stream);
     this.yourConnection.onaddstream = function(e){
          let theirsvideo = document.querySelector("#theirs");
          theirsvideo.srcObject = e.stream;
     }



      this.yourConnection.createOffer(function(offer){
        _this.yourConnection.setLocalDescription(offer);
        _this.theirconnection.setRemoteDescription(offer);

        this.theirconnection.createAnswer(function(offer){
           _this.theirconnection.setLocalDescription(offer);
           _this.yourConnection.setRemoteDescription(offer);
        });



      });
    },
    
 getRemoteStream(e) {
 
 }


  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
video,canvas{
  border: 1px solid gray;
  width: 480px;
  height: 320px;
}
.grayscale{
  -webkit-filter: grayscale(1);
  -moz-filter:grayscale(1);
  -ms-filter:grayscale(1);
  -o-filter:grayscale(1);
  filter: grayscale(1);
}
.sepia{
    -webkit-filter: sepia(1);
  -moz-filter:sepia(1);
  -ms-filter:sepia(1);
  -o-filter:sepia(1);
  filter: sepia(1);
}
.invert{
    -webkit-filter: invert(1);
  -moz-filter:invert(1);
  -ms-filter:invert(1);
  -o-filter:invert(1);
  filter: invert(1);
}
</style>
