<template>
  <div>
    <p>sandbox</p>
    <video
      style="box-shadow: 2px 2px 10px #eee; max-height: 350px"
      ref="localVideo"
      autoplay
      width="35%"
    />
  </div>
</template>

<script>
export default {
  name: "sandbox",
  data: () => ({
    localStream: "",
    pc: ""
  }),
  mounted() {
    this.start();
  },
  methods: {
    start() {
      const me = this;
      const servers = null;
      this.pc = new RTCPeerConnection(servers);
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: true
        })
        .then(function(stream) {
          me.$refs.localVideo.srcObject = stream;
          me.pc.addStream(stream);
          me.pc
            .createOffer()
            .then(sdp => me.pc.setLocalDescription(sdp))
            .then(function() {
              this.$socket.emit('message', me.pc.localDescription.sdp)
            });
        });
    }
  }
};
</script>
