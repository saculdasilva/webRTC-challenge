<template>
  <div>
    <span>{{ $socket.connected ? "Connected" : "Disconnected" }}</span>
    <video
      style="box-shadow: 2px 2px 10px #eee; max-height: 350px"
      ref="localVideo"
      autoplay
      width="35%"
    />
    <video
      style="box-shadow: 2px 2px 10px #eee; max-height: 350px"
      ref="remoteVideo"
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
  sockets: {
    connect() {
      console.log("socket connected");
    },
    offer(data) {
      console.log(
        'offer:', data
      );
    },
  },
  mounted() {
    this.start();
  },
  methods: {
    start() {
      const me = this;
      const servers = null;
      this.pc = new RTCPeerConnection(servers);
      //console.log(navigator);
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
              me.$socket.client.emit('message', me.pc.localDescription);
            });
        });
    },
    // binding the second video element to the "remote" stream. "e" should be the stream sent by the remote peer.
    gotRemoteStream(remoteStream) {
      this.$refs.remoteVideo.srcObject = remoteStream.stream;
    },
  }
};
</script>
