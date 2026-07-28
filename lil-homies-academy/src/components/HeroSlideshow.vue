<template>
  <section id="home" class="hero-slideshow glossy-panel">
    <div class="slide-container" ref="slideBox">
      <div 
        v-for="(slide, i) in slides" 
        :key="i" 
        class="slide" 
        :class="{ active: currentSlide === i }"
        :style="{ backgroundImage: `linear-gradient(to top, rgba(5,5,8,0.9), transparent), url(${slide.img})` }"
      >
        <div class="slide-content">
          <span class="tag">// {{ slide.tag }}</span>
          <h2>{{ slide.title }}</h2>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import anime from 'animejs';

const currentSlide = ref(0);
const slideBox = ref(null);

const slides = [
  { title: "Next-Gen Academic Mastery", tag: "FOUNDATION", img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200" },
  { title: "Cinematography & Visual Arts", tag: "CREATIVE", img: "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1200" },
  { title: "Full-Stack & Systems Coding", tag: "TECHNICAL", img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200" }
];

onMounted(() => {
  setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length;
    anime({
      targets: slideBox.value,
      scale: [0.98, 1],
      duration: 800,
      easing: 'easeOutElastic(1, .8)'
    });
  }, 4000);
});
</script>

<style scoped>
.hero-slideshow { height: 420px; position: relative; overflow: hidden; margin: 24px 12px; }
.slide-container { width: 100%; height: 100%; position: relative; }
.slide {
  position: absolute; inset: 0; opacity: 0; transition: opacity 0.8s ease;
  background-size: cover; background-position: center; display: flex; align-items: flex-end; padding: 40px;
}
.slide.active { opacity: 1; }
.slide-content h2 { font-size: 38px; color: #fff; font-family: var(--font-heading); text-transform: uppercase; }
.tag { font-family: var(--font-mono); color: var(--neon-yellow); font-weight: bold; }
</style>