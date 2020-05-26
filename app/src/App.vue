<template>
  <div>
    <webrtc />
  </div>
</template>

<script>
import WebRTC from "@/components/WebRTC.vue";
export default {
  name: "Home",
  components: {
    webrtc: WebRTC
  }
};
</script>
