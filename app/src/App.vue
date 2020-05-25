<template>
  <div>
    <webrtc />
  </div>
</template>

<script>
import WebRTC from "@/components/sandbox.vue";
export default {
  name: "Home",
  components: {
    webrtc: WebRTC
  }
};
</script>
