<template>
  <section id="faculty" class="section-padding">
    <h2 class="section-title">FACULTY // ROSTER</h2>

    <div class="faculty-grid">
      <div v-for="(fac, index) in faculties" :key="index" class="faculty-card glossy-panel">
        <div class="avatar-placeholder">{{ fac.name.charAt(0) }}</div>
        <h3>{{ fac.name }}</h3>
        <p class="qual">{{ fac.qualification }}</p>
        <span class="dept-tag">{{ fac.department }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue';

// Faculty Class Model
class Faculty {
  constructor(name, qualification, department) {
    this.name = name;
    this.qualification = qualification;
    this.department = department;
  }
}

// Add faculty members easily using the class instantiation
const faculties = reactive([
  new Faculty("R. Bhanuteja Sai", "M.Tech Computer Science", "Programming & Web Systems"),
  new Faculty("K. S. Rao", "M.Sc Physics", "Intermediate Science"),
  new Faculty("A. Vikram", "Diploma in Film Making", "Media & Creative Arts")
]);
</script>

<style scoped>
.section-padding { padding: 32px 12px; }
.section-title { font-family: var(--font-heading); font-size: 32px; color: var(--neon-yellow); margin-bottom: 24px; }
.faculty-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.faculty-card { padding: 20px; text-align: center; }
.avatar-placeholder { width: 50px; height: 50px; background: var(--neon-purple); color: #fff; font-weight: bold; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 20px; }
.faculty-card h3 { font-size: 18px; color: #fff; margin-bottom: 4px; }
.qual { font-size: 12px; color: var(--text-muted); margin-bottom: 10px; }
.dept-tag { font-family: var(--font-mono); font-size: 10px; background: rgba(56, 189, 248, 0.1); color: var(--neon-cyan); padding: 4px 8px; border-radius: 4px; }
</style>