<template>
  <div id="container">
    <h1>
      <span>Fuze Challenge</span>
    </h1>

    <video ref="localVideo" playsinline autoplay muted></video>
    <video ref="remoteVideo" playsinline autoplay></video>

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
    pc1: "",
    pc2: "",
    startTime: "",
    offerOptions: {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    }
  }),
  methods: {
    getName(pc) {
      return pc === this.pc1 ? "pc1" : "pc2";
    },

    getOtherPc(pc) {
      return pc === this.pc1 ? this.pc2 : this.pc1;
    },

    async start() {
      console.log("Requesting local stream");
      this.$refs.startButton.disabled = true;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });
        console.log("Received local stream");
        this.$refs.localVideo.srcObject = stream;
        this.localStream = stream;
        this.$refs.callButton.disabled = false;
      } catch (e) {
        alert(`getUserMedia() error: ${e.name}`);
      }
    },

    async call() {
      this.$refs.callButton.disabled = true;
      this.$refs.hangupButton.disabled = false;
      console.log("Starting call");
      const videoTracks = this.localStream.getVideoTracks();
      const audioTracks = this.localStream.getAudioTracks();
      if (videoTracks.length > 0) {
        console.log(`Using video device: ${videoTracks[0].label}`);
      }
      if (audioTracks.length > 0) {
        console.log(`Using audio device: ${audioTracks[0].label}`);
      }
      var servers = null;
      this.pc1 = new RTCPeerConnection(servers);
      console.log("Created local peer connection object pc1");
      this.pc1.addEventListener("icecandidate", e =>
        this.onIceCandidate(this.pc1, e)
      );
      this.pc2 = new RTCPeerConnection(servers);
      console.log("Created remote peer connection object pc2");
      this.pc2.addEventListener("icecandidate", e =>
        this.onIceCandidate(this.pc2, e)
      );
      this.pc1.addEventListener("iceconnectionstatechange", e =>
        this.onIceStateChange(this.pc1, e)
      );
      this.pc2.addEventListener("iceconnectionstatechange", e =>
        this.onIceStateChange(this.pc2, e)
      );
      this.pc2.onaddstream = this.gotRemoteStream;

      this.pc1.addStream(this.localStream);
      console.log("Added local stream to pc1");

      console.log("pc1 createOffer start");
      this.pc1
        .createOffer(this.offerOptions)
        .then(this.onCreateOfferSuccess, this.onCreateSessionDescriptionError);
    },

    onCreateSessionDescriptionError(error) {
      console.log(`Failed to create session description: ${error.toString()}`);
    },

    async onCreateOfferSuccess(desc) {
      console.log("Offer from pc1\n" + desc.sdp);
      console.log("pc1 setLocalDescription start");
      try {
        await this.pc1.setLocalDescription(desc);
        this.onSetLocalSuccess(this.pc1);
      } catch (e) {
        this.onSetSessionDescriptionError();
      }

      console.log("pc2 setRemoteDescription start");
      try {
        await this.pc2.setRemoteDescription(desc);
        this.onSetRemoteSuccess(this.pc2);
      } catch (e) {
        this.onSetSessionDescriptionError();
      }

      console.log("pc2 createAnswer start");
      try {
        const answer = await this.pc2.createAnswer();
        await this.onCreateAnswerSuccess(answer);
      } catch (e) {
        this.onCreateSessionDescriptionError(e);
      }
    },

    onSetLocalSuccess(pc) {
      console.log(`${this.getName(pc)} setLocalDescription complete`);
    },

    onSetRemoteSuccess(pc) {
      console.log(`${this.getName(pc)} setRemoteDescription complete`);
    },

    onSetSessionDescriptionError(error) {
      console.log(`Failed to set session description: ${error.toString()}`);
    },

    gotRemoteStream(e) {
      this.$refs.remoteVideo.srcObject = e.stream;
      console.log("pc2 received remote stream");
    },

    onCreateAnswerSuccess(desc) {
      console.log(`Answer from pc2:\n${desc.sdp}`);
      console.log("pc2 setLocalDescription start");
      try {
        this.pc2.setLocalDescription(desc);
        this.onSetLocalSuccess(this.pc2);
      } catch (e) {
        this.onSetSessionDescriptionError(e);
      }
      console.log("pc1 setRemoteDescription start");
      try {
        this.pc1.setRemoteDescription(desc);
        this.onSetRemoteSuccess(this.pc1);
      } catch (e) {
        this.onSetSessionDescriptionError(e);
      }
    },

    async onIceCandidate(pc, event) {
      try {
        await this.getOtherPc(pc).addIceCandidate(event.candidate);
        this.onAddIceCandidateSuccess(pc);
      } catch (e) {
        this.onAddIceCandidateError(pc, e);
      }
      console.log(
        `${this.getName(pc)} ICE candidate:\n${
          event.candidate ? event.candidate.candidate : "(null)"
        }`
      );
    },

    onAddIceCandidateSuccess(pc) {
      console.log(`${this.getName(pc)} addIceCandidate success`);
    },

    onAddIceCandidateError(pc, error) {
      console.log(
        `${this.getName(pc)} failed to add ICE Candidate: ${error.toString()}`
      );
    },

    onIceStateChange(pc, event) {
      if (pc) {
        console.log(`${this.getName(pc)} ICE state: ${pc.iceConnectionState}`);
        console.log("ICE state change event: ", event);
      }
    },

    hangup() {
      console.log("Ending call");
      this.pc1.close();
      this.pc2.close();
      this.pc1 = null;
      this.pc2 = null;
      this.$refs.hangupButton.disabled = true;
      this.$refs.callButton.disabled = false;
    }
  }
};
</script>
