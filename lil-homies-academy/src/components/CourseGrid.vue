<template>
  <section id="courses" class="section-padding">
    <h2 class="section-title">AVAILABLE // COURSES</h2>

    <div class="courses-grid">
      <div 
        v-for="(course, idx) in courses" 
        :key="idx" 
        class="course-card glossy-panel"
        @mouseenter="cardHover($event)"
      >
        <div class="card-header">
          <span class="category-badge">{{ course.category }}</span>
          <span class="price-tag">{{ course.price }}</span>
        </div>
        <h3 class="course-name">{{ course.name }}</h3>
        <p class="coverage"><strong>Coverage:</strong> {{ course.coverage }}</p>
        <p class="focus"><strong>Focus:</strong> {{ course.focus }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import gsap from 'gsap';

const courses = [
  { name: "6th to 10th Standard (All Subjects)", price: "₹2,500 / Month", coverage: "Mathematics, Science, Social Studies, Languages", focus: "Conceptual clarity, curriculum alignment, exam prep", category: "School" },
  { name: "Intermediate Subject Mastery", price: "₹2,500 / Month per subject", coverage: "Maths, Physics, Chemistry, Economics, Commerce", focus: "In-depth analysis, board exams, competitive foundation", category: "Intermediate" },
  { name: "Cinematography & Direction", price: "Custom / Contact", coverage: "Camera handling, lighting, scriptwriting", focus: "Visual storytelling & cinematography", category: "Media & Arts" },
  { name: "Video Editing", price: "₹2,500 / Month", coverage: "Timeline management, audio syncing, transitions", focus: "Color grading & video post-production", category: "Media & Arts" },
  { name: "Programming", price: "Custom / Contact", coverage: "Python, Java, C++, Frontend Web Dev", focus: "Logic building, hands-on coding projects", category: "Tech & Business" },
  { name: "Tally Prime", price: "₹2,500 / Month", coverage: "Accounting, GST compliance, inventory", focus: "Invoicing & practical accounting", category: "Tech & Business" },
  { name: "MS Office Suite", price: "₹2,500 / Month", coverage: "Excel formulas, Word formatting, PowerPoint", focus: "Data organization & productivity", category: "Tech & Business" },
  { name: "Custom On-Demand Program", price: "Flexible", coverage: "Customized to individual requirements", focus: "Based on requirement & faculty availability", category: "Others" }
];

const cardHover = (e) => {
  gsap.to(e.currentTarget, { y: -8, duration: 0.3, ease: 'power2.out' });
};
</script>

<style scoped>
.section-padding { padding: 32px 12px; }
.section-title { font-family: var(--font-heading); font-size: 32px; color: var(--neon-cyan); margin-bottom: 24px; letter-spacing: 1px; }
.courses-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.course-card { padding: 24px; display: flex; flex-direction: column; justify-content: space-between; transition: border-color 0.3s; }
.course-card:hover { border-color: var(--neon-purple); }
.card-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
.category-badge { font-family: var(--font-mono); font-size: 11px; color: var(--neon-yellow); background: rgba(250, 204, 21, 0.1); padding: 4px 8px; border-radius: 4px; }
.price-tag { font-weight: bold; color: var(--neon-cyan); font-size: 14px; }
.course-name { font-size: 20px; margin-bottom: 12px; color: #fff; }
.coverage, .focus { font-size: 13px; color: var(--text-muted); margin-top: 6px; line-height: 1.4; }
</style>