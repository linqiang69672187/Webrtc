<template>
  <div class="hello">
    <video id="localvideo" autoplay></video>
    <video id="remotevideo" autoplay></video>
    <canvas></canvas>
    <button id="start" @click="start">开始</button>
    <button id="call" @click="call">呼叫</button>  
    <button id="hangup">挂断</button> 
    <textarea id="offer"></textarea>
    <textarea id="answer"></textarea>
    
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      localStream:null,
      pc1:null,
      pc2:null
    }
  },
  mounted(){
  },
  methods:{ 
      /**
         * 点击start按钮开始获取视频流并显示
         * @param context
        */
    start(){  
            if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
                console.error('the getUserMedia is not supported!');
                return;
            }else {
                let constraints = {
                    video:true,
                    audio:false
                }

                navigator.mediaDevices.getUserMedia(constraints)
                .then(this.getMediaStream)
                .catch(this.handleError);
                 let btnStart = document.querySelector('button#start');
                 let btnCall = document.querySelector('button#call');
                 let btnHangup = document.querySelector('button#hangup');

                btnStart.disabled = true;
                btnCall.disabled = false;
                btnHangup.disabled = true;
            }
    },
    //获取到视频流则赋值给显示控件，获取失败则打印日志

    getMediaStream(stream){
     let localVideo =  document.querySelector('video#localvideo');
      localVideo.srcObject = stream;
	  this.localStream = stream;
    },
    handleError(err){
            console.error('Failed to get Media Stream!', err);
        },
    call(){
            
            //1 首先创建本地和对端的RTCPeerConnection对象pc1和pc2，

            this.pc1 = new RTCPeerConnection();
            this.pc2 = new RTCPeerConnection();
            
            //2 然后给pc1和pc2添加接收ice的回调监听，当收到对端的ice后添加到各自的ice中
           this.pc1.onicecandidate = (e) =>{
                this.pc2.addIceCandidate(e.candidate);
            }

            this.pc2.onicecandidate = (e) =>{
                this.pc1.addIceCandidate(e.candidate);
            }
            
            //3 p2接收到视频流以后显示视频
            this.pc2.ontrack = this.getRemoteStream;

            //4 本地流遍历所有轨track，并添加到pc1的track中。
            this.localStream.getTracks().forEach((track)=>{
                this.pc1.addTrack(track, this.localStream);
            });

            //5 配置offer选项 
            let offerOptions = {
                offerToRecieveAudio:0,
                offerToRecieveVideo:1
            }

            //6 本地创建offer 并设置offer创建成功的回调
            this.pc1.createOffer(offerOptions)
                .then(this.createOfferSuc)
                .catch(this.handleOfferError);


            let btnCall = document.querySelector('button#call');
            let btnHangup = document.querySelector('button#hangup');
            btnCall.disabled = true;
            btnHangup.disabled = false;


    },
    //远端接收到视频流以后播放视频
    getRemoteStream(e){
              let remoteVideo =  document.querySelector('video#remotevideo');
                remoteVideo.srcObject = e.streams[0];
        },
        //pc1 offer创建成功的回调
    createOfferSuc(desc){
            //1 首先调用pc1的setLocalDescription
            this.pc1.setLocalDescription(desc);
            let offerSdpTextarea = document.querySelector('textarea#offer');
            offerSdpTextarea.value = desc.sdp;
            
            //2 调用pc2的setRemoteDescription 
            this.pc2.setRemoteDescription(desc);
            
            //3 远端创建answer， 并设置answer创建成功的回调
            this.pc2.createAnswer()
                .then(this.createAnswerSuc)
                .catch(this.handleAnswerError);
      },
    //pc2 answer创建成功的回调
      createAnswerSuc(desc){
	//1 首先调用pc2的setLocalDescription
        this.pc2.setLocalDescription(desc);
        let answerSdpTextarea = document.querySelector('textarea#answer');
        answerSdpTextarea.value = desc.sdp;

        //2 调用
        this.pc1.setRemoteDescription(desc);
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
