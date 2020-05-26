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
    servers: null,
    peer: ""
  }),
  sockets: {
    connect() {
      console.log("socket connected");
    },
    offer(data) {
      const pc = new RTCPeerConnection(this.servers);
      const me = this;
      pc.setRemoteDescription(data)
        .then(() => pc.createAnswer())
        .then(sdp => pc.setLocalDescription(sdp))
        .then(function() {
          console.log("offer pc:", pc);
          console.log("peer :", me.peer);
          me.$socket.client.emit("answer", me.peer.localDescription);
        });
      pc.onaddstream = remoteStream =>
        this.gotRemoteStream(remoteStream.stream);
      pc.onicecandidate = function(event) {
        if (event.candidate) {
          me.$socket.client.emit("candidate", event.candidate);
        }
      };
      // this.pc.onicecandidate = function(event) {
      //   if (event.candidate) {
      //     me.$socket.client.emit("candidate", event.candidate);
      //   }
      // };
    },
    answer(data) {
      const me = this;
      console.log("answer: ", data);
      this.peer.setRemoteDescription(data);
      this.peer.onaddstream = function(event) {
        console.log("there is stream", event.stream);
        me.$refs.remoteVideo.srcObject = event.stream;
        console.log(me.$refs.remoteVideo.srcObject);
      };
      this.peer.onicecandidate = function(event) {
        if (event.candidate) {
          me.$socket.client.emit("candidate", event.candidate);
        }
      };
    },
    candidate(candidate) {
      console.log("candidate:", candidate);
      console.log(this.peer);
      this.peer
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.error(e));
      console.log("peer candidates: ", this.peer);
    }
  },
  mounted() {
    this.start();
  },
  methods: {
    start() {
      const me = this;
      if (navigator.mediaDevices) {
        navigator.mediaDevices
          .getUserMedia({
            audio: true,
            video: true
          })
          .then(function(stream) {
            me.$refs.localVideo.srcObject = stream;
            me.peer = new RTCPeerConnection(me.servers);
            me.peer.addStream(stream);
            me.peer
              .createOffer()
              .then(sdp => me.peer.setLocalDescription(sdp))
              .then(function() {
                me.$socket.client.emit("offer", me.peer.localDescription);
              });
          });
      } else {
        alert(" no access to media devices ");
      }
    },
    // binding the second video element to the "remote" stream. "remoteStream" should be the stream sent by the remote peer.
    gotRemoteStream(remoteStream) {
      this.$refs.remoteVideo.srcObject = remoteStream.stream;
    }
  }
};
</script>
