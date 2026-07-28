<template>
  <footer class="footer glossy-panel">
    <p>Designed by <strong>Rayudu Bhanuteja Sai</strong> @ <span>LilHomiesStudios</span></p>
    <p class="copy">All rights reserved &copy; {{ new Date().getFullYear() }}</p>
  </footer>
</template>

<style scoped>
.footer { margin: 40px 12px 12px; padding: 24px; text-align: center; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }
.footer strong { color: var(--neon-cyan); }
.footer span { color: var(--neon-purple); }
.copy { margin-top: 6px; opacity: 0.6; }
</style>