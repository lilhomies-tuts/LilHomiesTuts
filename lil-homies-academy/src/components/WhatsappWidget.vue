<template>
  <a :href="`https://wa.me/${cleanNumber}`" target="_blank" class="whatsapp-btn glossy-panel">
    <span class="icon">💬</span>
    <span class="text">Help Desk</span>
  </a>
</template>

<script setup>
const number = "+91 9182594663";
const cleanNumber = number.replace(/[^0-9]/g, '');
</script>

<style scoped>
.whatsapp-btn {
  position: fixed; bottom: 20px; right: 20px; z-index: 999;
  display: flex; align-items: center; gap: 8px; padding: 12px 18px;
  background: rgba(37, 211, 102, 0.2); border: 1px solid rgba(37, 211, 102, 0.5);
  color: #fff; text-decoration: none; border-radius: 99px; font-weight: bold; font-size: 13px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); transition: transform 0.2s;
}
.whatsapp-btn:hover { transform: scale(1.05); }
</style>