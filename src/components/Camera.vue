<template>
  <div>
    <h1 style="text-align: center; margin: 5rem 5rem">{{ message }}</h1>
    <canvas ref="audio1" width="150" height="300"></canvas>
    <video
      style="box-shadow: 2px 2px 10px #eee"
      ref="video1"
      autoplay
      width="35%"
    />
    <canvas ref="audio2" width="150" height="300"></canvas>
    <video
      style="box-shadow: 2px 2px 10px #eee"
      ref="video2"
      autoplay
      width="35%"
    />
  </div>
</template>

<script>
export default {
  name: "Camera",
  data: () => ({
    message: "fuze challenge",
    health: 200
  }),
  mounted() {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    if (navigator.getUserMedia) {
      let me = this;
      navigator.getUserMedia(
        {
          audio: true,
          video: true
        },
        function(stream) {
          const video1 = me.$refs.video1;
          video1.srcObject = stream;
          me.PeerConnection(stream);
          let audioContext = new AudioContext();
          let analyser = audioContext.createAnalyser();
          let microphone = audioContext.createMediaStreamSource(stream);
          let javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

          analyser.smoothingTimeConstant = 0.8;
          analyser.fftSize = 1024;

          microphone.connect(analyser);
          analyser.connect(javascriptNode);
          javascriptNode.connect(audioContext.destination);

          const canvasContext1 = me.$refs.audio1.getContext("2d");
          const canvasContext2 = me.$refs.audio2.getContext("2d");

          javascriptNode.onaudioprocess = function() {
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            var values = 0;

            var length = array.length;
            for (var i = 0; i < length; i++) {
              values += array[i];
            }

            var damage = values / length;
            if (me.health > 0 && damage > 80) {
              me.health = me.health - damage / 100;
            }
            canvasContext1.clearRect(0, 0, 150, 300);
            canvasContext1.fillStyle = "#BadA55";
            canvasContext1.fillRect(0, 200 - me.health, 150, 300);
            canvasContext1.fillStyle = "#262626";
            canvasContext1.font = "48px impact";
            canvasContext1.fillText(Math.round(me.health), 0, 300);

            canvasContext2.clearRect(0, 0, 150, 300);
            canvasContext2.fillStyle = "#BadA55";
            canvasContext2.fillRect(0, 200 - me.health, 150, 300);
            canvasContext2.fillStyle = "#262626";
            canvasContext2.font = "48px impact";
            canvasContext2.fillText(Math.round(me.health), 0, 300);
          };
        },
        function(err) {
          me.message = "The following error occured: " + err.name;
        }
      );
    } else {
      this.message =
        "getUserMedia not supported, please use Firefox or IE Edge - Chrome requires HTTPS";
    }
  },
  methods: {
    PeerConnection() {
      let pc1 = new RTCPeerConnection("");
      pc1.addEventListener("icecandidate", e => this.onIceCandidate(pc1, e));
      // let pc2 = new RTCPeerConnection();
      // pc2.addEventListener("icecandidate", e => this.onIceCandidate(pc2, e));
      // pc2.addEventListener("track", this.gotRemoteStream);

      // stream.getTracks().forEach(track => pc1.addTrack(track, stream));

      // const offerOptions = {
      //   offerToReceiveAudio: 1,
      //   offerToReceiveVideo: 1
      // };

      // try {
      //   console.log("pc1 createOffer start");
      //   const offer = pc1.createOffer(offerOptions);
      //   this.onCreateOfferSuccess(offer);
      // } catch (e) {
      //   console.log(e);
      // }
    },

    getOtherPc(pc) {
      return pc === this.pc1 ? this.pc2 : this.pc1;
    },

    async onCreateOfferSuccess(desc) {
      console.log("pc1 setRemoteDescription start");
      try {
        await this.pc1.setLocalDescription(desc);
      } catch (e) {
        console.log(e);
      }

      console.log("pc2 setRemoteDescription start");
      try {
        await this.pc2.setRemoteDescription(desc);
      } catch (e) {
        console.log(e);
      }

      console.log("pc2 createAnswer start");
      // Since the 'remote' side has no media stream we need
      // to pass in the right constraints in order for it to
      // accept the incoming offer of audio and video.
      try {
        const answer = await this.pc2.createAnswer();
        await this.onCreateAnswerSuccess(answer);
      } catch (e) {
        console.log(e);
      }
    },

    async onCreateAnswerSuccess(desc) {
      try {
        await this.pc2.setLocalDescription(desc);
      } catch (e) {
        console.log(e);
      }
      try {
        await this.pc1.setRemoteDescription(desc);
      } catch (e) {
        console.log(e);
      }
    },

    async onIceCandidate(pc, event) {
      try {
        await this.getOtherPc(pc).addIceCandidate(event.candidate);
      } catch (e) {
        console.log(e);
      }
    },

    gotRemoteStream(e) {
      if (this.remoteVideo.srcObject !== e.streams[0]) {
        this.$refs.video2.srcObject = e.streams[0];
      }
    }
  }
};
</script>

<style scoped>
body {
  color: #888;
  background: #262626;
  margin: 0;
  padding: 40px;
  text-align: center;
  font-family: "Arial", sans-serif;
}

canvas {
  margin: 2rem 0rem 0rem 2rem;
}
</style>
