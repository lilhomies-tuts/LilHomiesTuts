<template>
  <header class="navbar glossy-panel">
    <div class="brand">
      <span class="logo-box">AE</span>
      <span class="title">LIL-HOMIES-TUTS</span>
    </div>

    <nav class="nav-links">
      <a href="#home">Home</a>
      <a href="#courses">Courses</a>
      <a href="#faculty">Faculty</a>
      <a href="#register">Reg Panel</a>
    </nav>

    <!-- Manual Display Override Controls -->
    <div class="device-override">
      <span class="label">VIEW:</span>
      <button :class="{ active: currentView === 'auto' }" @click="$emit('setView', 'auto')">Auto</button>
      <button :class="{ active: currentView === 'laptop' }" @click="$emit('setView', 'laptop')">Laptop</button>
      <button :class="{ active: currentView === 'tab' }" @click="$emit('setView', 'tab')">Tab</button>
      <button :class="{ active: currentView === 'mobile' }" @click="$emit('setView', 'mobile')">Mobile</button>
    </div>
  </header>
</template>

<script setup>
defineProps(['currentView']);
defineEmits(['setView']);
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 12px;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 28px;
  margin: 12px;
}
.brand { display: flex; align-items: center; gap: 10px; font-weight: 900; }
.logo-box {
  background: var(--neon-yellow);
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: var(--font-mono);
}
.title { font-size: 18px; letter-spacing: 0.1em; color: var(--text-main); }
.nav-links { display: flex; gap: 20px; }
.nav-links a { color: var(--text-muted); text-decoration: none; font-size: 14px; transition: 0.2s; }
.nav-links a:hover { color: var(--neon-purple); }

.device-override { display: flex; gap: 4px; align-items: center; font-size: 11px; font-family: var(--font-mono); }
.device-override button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-glass);
  color: var(--text-muted);
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.device-override button.active { background: var(--neon-purple); color: #fff; border-color: var(--neon-purple); }
</style>