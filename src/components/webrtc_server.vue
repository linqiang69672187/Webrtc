<template>
  <div class="hello">
    <video id="yours" autoplay  controls="controls"></video>
    <video id="theirs" autoplay  controls="controls"></video>
    <canvas></canvas>
    <button id="start" @click="createOffer">开始</button>
  

    
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      websocket:null,
      userid:null,
      Connection:null,
      yourVideo:null,
      theirVideo:null
    }
  },
  mounted(){
      this.theirVideo = document.querySelector('video#theirs');
      this.yourVideo = document.querySelector('video#yours');
      this.userid = 'user' + this.randomNum(0, 100000);
      console.log(this.userid);
      this.createSocket();
      this.startPeerConnection();
      if (this.hasUserMedia()) {
            navigator.getUserMedia({ video: true, audio: true },
                stream => {
                     
                    this.yourVideo.srcObject = stream;
                    window.stream = stream;
                    this.yourVideo.muted = true;
                    this.Connection.addStream(stream)
                },
                err => {
                    console.log(err);
                })
        }



  },
  methods:{
      randomNum(minNum, maxNum) {
                switch (arguments.length) {
                    case 1:
                        return parseInt(Math.random() * minNum + 1, 10);
                        break;
                    case 2:
                        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
                        break;
                    default:
                        return 0;
                        break;
                }
            },
      hasUserMedia() {
            navigator.getUserMedia = navigator.getUserMedia || navigator.msGetUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            return !!navigator.getUserMedia;
      },
       hasRTCPeerConnection() {
        window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.msRTCPeerConnection;
        return !!window.RTCPeerConnection;
        },
        startPeerConnection() {
                //return;
                let _this =this;
                var config = {
                    'iceServers': [
                        //{ 'urls': 'stun:stun.xten.com:3478' },
                        //{ 'urls': 'stun:stun.voxgratia.org:3478' },

                        //{ 'url': 'stun:stun.l.google.com:19302' }
                    ]
                };
                config = {
                    iceServers: [
                        //{ urls: 'stun:stun.l.google.com:19302' },
                        //{ urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
                    ]
                    //sdpSemantics: 'unified-plan'
                };
                // {
                //     "iceServers": [{
                //         "url": "stun:stun.1.google.com:19302"
                //     }]
                // };
                this.Connection = new RTCPeerConnection(config);
                this.Connection.onicecandidate = function (e) {
                    console.log('onicecandidate');
                    if (e.candidate) {
                        _this.websocket.send(JSON.stringify({
                            "userid": _this.userid,
                            "event": "_ice_candidate",
                            "data": {
                                "candidate": e.candidate
                            }
                        }));
                    }
                };
                this.Connection.onaddstream = function (e) {
                    console.log('onaddstream');
                    //theirVideo.src = window.URL.createObjectURL(e.stream);
                    
                    _this.theirVideo.srcObject = e.stream;
                };
                this.Connection.onclose = function (e) {
                    console.log('RTCPeerConnection close'+e);
                };
            },
            createOffer() {
                //发送offer和answer的函数，发送本地session描述
                this.Connection.createOffer().then(offer => {
                    this.Connection.setLocalDescription(offer);
                    this.websocket.send(JSON.stringify({            
                        "userid": this.userid,
                        "event": "offer",
                        "data": {
                            "sdp": offer
                        }
                    }));
                });
            },
         createSocket() {
            //websocket = null;
            this.websocket = new WebSocket('ws://10.8.59.253:8077/Handler1.ashx?user='+this.userid);//('wss://www.ecoblog.online/wss');
            this.eventBind();
        },
        eventBind() {
                //连接成功
                this.websocket.onopen = function (e) {
                    console.log('open:' + e);
                };
                //server端请求关闭
                this.websocket.onclose = function (e) {
                    console.log('close:' + e);
                };
                //error
                this.websocket.onerror = function (e) {
                    console.log('error:' + e.data);
                };
                //收到消息
                this.websocket.onmessage = (event) => {
                    if (event.data == "new user") {
                        location.reload();
                    } else {
                        var js = event.data.replace(/[\u0000-\u0019]+/g, ""); 
                        var json = JSON.parse(js);
                        
                        if (json.userid != this.userid) {
                            //如果是一个ICE的候选，则将其加入到PeerConnection中，否则设定对方的session描述为传递过来的描述
                            if (json.event === "_ice_candidate" && json.data.candidate) {
                                this.Connection.addIceCandidate(new RTCIceCandidate(json.data.candidate));
                            }
                            else if (json.event === 'offer') {
                                this.Connection.setRemoteDescription(json.data.sdp);
                                this.Connection.createAnswer().then(answer => {
                                    this.Connection.setLocalDescription(answer);
                                    //console.log(window.stream)
                                    this.websocket.send(JSON.stringify({                            
                                        "userid": this.userid,
                                        "event": "answer",
                                        "data": {
                                            "sdp": answer
                                        }
                                    }));
                                })
                            }
                            else if (json.event === 'answer') {
                                this.Connection.setRemoteDescription(json.data.sdp);
                                //console.log(window.stream)
                            }
                        }
                    }
                }
        },


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
