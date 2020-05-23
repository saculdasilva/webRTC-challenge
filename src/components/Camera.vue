<template>
  <div>
    <h1>fuze challenge</h1>
    <canvas ref="audio1" width="150" height="300"></canvas>
    <video ref="video1" autoplay width="600" />
    <canvas ref="audio2" width="150" height="300"></canvas>
    <video ref="video2" autoplay width="600" />
  </div>
</template>

<script>
export default {
  name: "Camera",
  data: () => ({
    browser: {}
  }),
  mounted() {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    if (navigator.getUserMedia) {
      let me = this
      navigator.getUserMedia(
        {
          audio: true,
          video: true
        },
        function(stream) {
          const video1 = me.$refs.video1;
          video1.srcObject = stream;
          const video2 = me.$refs.video2;
          video2.srcObject = stream;
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

            var average = values / length; 

            canvasContext1.clearRect(0, 0, 150, 300);
            canvasContext1.fillStyle = "#BadA55";
            canvasContext1.fillRect(0, 300 - average, 150, 300);
            canvasContext1.fillStyle = "#262626";
            canvasContext1.font = "48px impact";
            canvasContext1.fillText(Math.round(average - 40), -2, 300);

            canvasContext2.clearRect(0, 0, 150, 300);
            canvasContext2.fillStyle = "#BadA55";
            canvasContext2.fillRect(0, 300 - average, 150, 300);
            canvasContext2.fillStyle = "#262626";
            canvasContext2.font = "48px impact";
            canvasContext2.fillText(Math.round(average - 40), -2, 300);
          };
        },
        function(err) {
          console.log("The following error occured: " + err.name);
        }
      );
    } else {
      console.log("getUserMedia not supported, please use Firefox or IE Edge - Chrome requires HTTPS");
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

#audio1 {
  width: 150px;
  height: 300px;
  position: absolute;
  top: 150px;
  left: 45%;
  text-align: center;
}
</style>
