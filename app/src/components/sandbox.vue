<template>
  <div id="container">
    <h1>
      <span>Fuze Challenge</span>
    </h1>
    <span>{{ $socket.connected ? "Connected" : "Disconnected" }}</span>
    <video
      style="box-shadow: 2px 2px 10px #eee; max-height: 350px"
      ref="localVideo"
      autoplay
      width="35%"
    />
    <canvas ref="audio1" width="150" height="300"></canvas>
    <video
      style="box-shadow: 2px 2px 10px #eee; max-height: 350px"
      ref="remoteVideo"
      autoplay
      width="35%"
    />
    <canvas ref="audio2" width="150" height="300"></canvas>

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
    peer: {},
    servers: null,
    health: 200
  }),
  sockets: {
    connect() {
      console.log("socket connected");
    },
    offer(data) {
      //little cheat, I should really study arrow functions
      const me = this;
      const id = this.$socket.client.id

      //makes the peer a RTCPeerConnection
      this.peer[id] = new RTCPeerConnection(this.servers);

      //socket id
      console.log(console.log('socket id on offer: ', this.$socket.client.id))

      //grabs the browser media, since we cleaned up the peer - and binds the local media to the first video element
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then(function(stream) {
          me.$refs.localVideo.srcObject = stream;
          me.peer[id].addStream(stream);
        });

      //sets the remote description of the local peer with the local description of the remote peer - that was sent trough the signaling server
      this.peer[id]
        .setRemoteDescription(data)
        .then(() => me.peer[id].createAnswer()) //creates answer
        .then(sdp => me.peer[id].setLocalDescription(sdp)) // sets up the local description to send back
        .then(function() {
          me.$socket.client.emit("answer", me.peer[id].localDescription, id); // replies back with the local description trough the signaling server
        });
      this.peer[id].onaddstream = (
        remoteStream //watches for new streams
      ) => this.gotRemoteStream(remoteStream.stream); //binds found stream to the second video element
      this.peer[id].onicecandidate = function(event) {
        // watches ICE and adds sends found candidates to the signaling server
        if (event.candidate) {
          me.$socket.client.emit("candidate", (event.candidate, id));
        }
      };
    },

    answer(data, id) {
      console.log('peer on answer: ', this.peer)
      const me = this;
      this.peer[id] = new RTCPeerConnection(this.servers)
      this.peer[id].setRemoteDescription(data);
      this.peer[id].onaddstream = function(event) {
        me.$refs.remoteVideo.srcObject = event.stream;
      };
      this.peer[id].onicecandidate = function(event) {
        if (event.candidate) {
          me.$socket.client.emit("candidate", (event.candidate, id));
        }
      };
    },

    //add found candidates to the peerconnection
    candidate(candidate, id) {
      this.peer[id]
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.error(e));
    }
  },
  methods: {
    // the healthbar damaged by sound - the "stream" should be the remote stream, not the local one.
    healthBar(stream) {
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
        if (me.health > 0 && damage > 80) {
          me.health = me.health - damage / 100;
        }
        canvasContext1.clearRect(0, 0, 150, 300);
        canvasContext1.fillStyle = "#BadA55";
        canvasContext1.fillRect(0, 200 - me.health, 150, 300);
        canvasContext1.fillStyle = "#262626";
        canvasContext1.font = "36px arial";
        canvasContext1.fillText(Math.round(me.health), 0, 300);
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

        this.healthBar(this.localStream);
        this.$refs.callButton.disabled = false;
      } catch (e) {
        alert(`getUserMedia() error: ${e.name}`);
      }
    },

    // tries to connect
    async call() {
      const me = this;
      const id = this.$socket.client.id
      this.$refs.callButton.disabled = true;
      this.$refs.hangupButton.disabled = false;

      //sets up local peer connection
      this.peer[id] = new RTCPeerConnection(this.servers);
      console.log(this.peer[id])

      // watches ICE and adds sends found candidates to the signaling server
      this.peer[id].onicecandidate = function(event) {
        if (event.candidate) {
          me.$socket.client.emit("candidate", event.candidate);
        }
      };

      //watches if a stream was added and sets the second video srcObject as the found stream
      this.peer[id].onaddstream = this.gotRemoteStream;

      //binds the local stream to the local peerConnection
      this.peer[id].addStream(this.localStream);

      //creates an offer, generates the local description (sdp), and sends it to a signaling server
      this.peer[id]
        .createOffer()
        .then(sdp => this.peer[id].setLocalDescription(sdp))
        .then(function() {
          console.log('emitting offer: ', me.peer[id].localDescription)
          me.$socket.client.emit("offer", me.peer[id].localDescription);
        });
    },

    // error catch
    onCreateSessionDescriptionError(error) {
      console.log(`Failed to create session description: ${error.toString()}`);
    },

    // binding the second video element to the "remote" stream. "remoteStream" should be the stream sent by the remote peer.
    gotRemoteStream(remoteStream) {
      this.$refs.remoteVideo.srcObject = remoteStream.stream;
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
