<template>
  <div id="container">
    <div v-if="health < 0" style="position:absolute; height:98%; width:99%; background:red; font-size:2rem; text-align:center">
      You Lost!
    </div>
    <h1>
      <span>Fuze Challenge</span>
    </h1>

    <video
      style="box-shadow: 2px 2px 10px #eee; max-height: 350px"
      ref="localVideo"
      autoplay
      width="35%"
    />
    <canvas ref="audio1" id="audio1" width="150" height="300"></canvas>
    <video
      style="box-shadow: 2px 2px 10px #eee; max-height: 350px"
      ref="remoteVideo"
      autoplay
      width="35%"
    />
    <canvas ref="audio2" id="audio2" width="150" height="300"></canvas>

    <div>
      <button ref="startButton" @click.prevent="start">Start</button>
      <button ref="callButton" @click.prevent="call" disabled>Call</button>
      <button ref="hangupButton" @click.prevent="hangup" disabled>
        Hang Up
      </button>
    </div>

    <p>
      For a fair fight, use earbuds with inline mic or a headset. View the
      console to see logging.
    </p>
  </div>
</template>

<script>
export default {
  name: "Web",
  data: () => ({
    localStream: "",
    peer: "",
    servers: null,
    health: 200,
    remoteHealth: 200,
  }),
  sockets: {
    connect() {
      console.log("socket connected");
    },
    offer(data) {
      console.log('---- offer triggered ----')

      //little cheat, I should really study arrow functions
      const me = this;

      //cleans up the peer, just to make sure
      this.peer = "";

      //makes the peer a RTCPeerConnection
      this.peer = new RTCPeerConnection(this.servers);

      //grabs the browser media, since we cleaned up the peer - and binds the local media to the first video element
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then(function(stream) {
          me.$refs.localVideo.srcObject = stream;
          me.peer.addStream(stream);
        });

      //watches if a stream was added and sets the second video srcObject as the found stream
      this.peer.onaddstream = this.gotRemoteStream;

      //sets the remote description of the local peer with the local description of the remote peer - that was sent trough the signaling server
      this.peer
        .setRemoteDescription(data)
        .then(() => me.peer.createAnswer()) //creates answer
        .then(sdp => me.peer.setLocalDescription(sdp)) // sets up the local description to send back
        .then(function() {
          console.log('remote peer: ', me.peer)
          me.$socket.client.emit("answer", me.peer.localDescription); // replies back with the local description trough the signaling server
        });

      // watches ICE and adds sends found candidates to the signaling server
      this.peer.onicecandidate = function(event) {
        if (event.candidate) {
          me.$socket.client.emit("candidate", event.candidate);
        }
      };
    },

    answer(data) {
      const me = this;
      this.peer.setRemoteDescription(data);

      this.peer.onicecandidate = function(event) {
        if (event.candidate) {
          me.$socket.client.emit("candidate", event.candidate);
        }
      };
    },

    //add found candidates to the peerconnection
    candidate(candidate, id) {
        if (this.peer.setRemoteDescription) {
          console.log('got a remote ice candidate: ', candidate)
          console.log('from : ', id)
          this.peer
            .addIceCandidate(new RTCIceCandidate(candidate))
            .catch(e => console.error(e));
        } else {
          console.log('BOOOOOOOOOOOOOOOOOOOOOM - remoteDescription is not set', this.peer)
        }
    }
  },
  methods: {
    // the healthbar damaged by sound - the "stream" should be the remote stream, not the local one.
    healthBar1(stream) {
      let me = this;
      let audioContext = new AudioContext();
      let analyser = audioContext.createAnalyser();
      let microphone = audioContext.createMediaStreamSource(stream);
      let javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);

      const canvasContext1 = me.$refs.audio2.getContext("2d");

      javascriptNode.onaudioprocess = function() {
        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var values = 0;

        var length = array.length;
        for (var i = 0; i < length; i++) {
          values += array[i];
        }

        var damage = values / length;
        if (me.health > 0 && damage > 50) {
          me.health = me.health - damage / 50;
        }
        canvasContext1.clearRect(0, 0, 150, 300);
        canvasContext1.fillStyle = "#BadA55";
        canvasContext1.fillRect(0, 200 - me.health, 150, 300);
        canvasContext1.fillStyle = "#262626";
        canvasContext1.font = "36px arial";
        canvasContext1.fillText(Math.round(me.health), 0, 300);
      };
    },
    healthBar2(stream) {
      let me = this;
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

      javascriptNode.onaudioprocess = function() {
        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var values = 0;

        var length = array.length;
        for (var i = 0; i < length; i++) {
          values += array[i];
        }

        var damage = values / length;
        if (me.remoteHealth > 0 && damage > 50) {
          me.remoteHealth = me.remoteHealth - damage / 50;
        }
        canvasContext1.clearRect(0, 0, 150, 300);
        canvasContext1.fillStyle = "#BadA55";
        canvasContext1.fillRect(0, 200 - me.remoteHealth, 150, 300);
        canvasContext1.fillStyle = "#262626";
        canvasContext1.font = "36px arial";
        canvasContext1.fillText(Math.round(me.remoteHealth), 0, 300);
      };
    },

    // starts the local video and sound, also brings up the healthbar
    async start() {
      this.$refs.startButton.disabled = true;
      try {
        //grabs the browser media - video and audio
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });

        //binds the stream object to the first video element
        this.$refs.localVideo.srcObject = stream;

        //binds the stream to the localStream variable
        this.localStream = stream;

        this.healthBar1(this.localStream);
        this.$refs.callButton.disabled = false;
      } catch (e) {
        alert(`getUserMedia() error: ${e.name}`);
      }
    },

    // tries to connect
    async call() {
      const me = this;
      this.$refs.callButton.disabled = true;
      this.$refs.hangupButton.disabled = false;

      //sets up local peer connection
      this.peer = new RTCPeerConnection(this.servers);

      // explodes because remoteDescription is not set
      // this.peer.onicecandidate = function(event) {
      //   if (event.candidate) {
      //     console.log('got a local candidate', event.candidate);
      //     me.$socket.client.emit("candidate", event.candidate);
      //   }
      // };
      

      //watches if a stream was added and sets the second video srcObject as the found stream
      this.peer.onaddstream = this.gotRemoteStream;

      //binds the local stream to the local peerConnection
      this.peer.addStream(this.localStream);

      //creates an offer, generates the local description (sdp), and sends it to a signaling server
      this.peer
        .createOffer()
        .then(sdp => this.peer.setLocalDescription(sdp))
        .then(function() {
          console.log('emitting offer: ', me.peer.localDescription)
          console.log('peer on call: ', me.peer)
          me.$socket.client.emit("offer", me.peer.localDescription);
          console.log('---------------------- End of call function ---------------------------')
        });
    },

    // binding the second video element to the "remote" stream. "remoteStream" should be the stream sent by the remote peer.
    gotRemoteStream(remoteStream) {
      this.$refs.remoteVideo.srcObject = remoteStream.stream;
      this.healthBar2(remoteStream.stream);
    },

    // shutdown the call
    hangup() {
      console.log("Ending call");
      this.peer.close();
      this.peer = null;
      this.$refs.hangupButton.disabled = true;
      this.$refs.callButton.disabled = false;
    }
  }
};
</script>
