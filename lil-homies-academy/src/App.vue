<template>
  <div :class="['app-wrapper', activeViewClass]">
    <Navbar :currentView="viewMode" @setView="setView" />
    <HeroSlideshow />
    <CourseGrid />
    <FacultyRoster />
    <Registration />
    <Footer />
    <WhatsappWidget />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Navbar from './components/Navbar.vue';
import HeroSlideshow from './components/HeroSlideshow.vue';
import CourseGrid from './components/CourseGrid.vue';
import FacultyRoster from './components/FacultyRoster.vue';
import Registration from './components/Registration.vue';
import Footer from './components/Footer.vue';
import WhatsappWidget from './components/WhatsappWidget.vue';

const viewMode = ref('auto');
const autoDetectedView = ref('laptop');

const handleResize = () => {
  const w = window.innerWidth;
  if (w <= 600) autoDetectedView.value = 'mobile';
  else if (w <= 1024) autoDetectedView.value = 'tab';
  else autoDetectedView.value = 'laptop';
};

const setView = (mode) => {
  viewMode.value = mode;
};

const activeViewClass = computed(() => {
  const target = viewMode.value === 'auto' ? autoDetectedView.value : viewMode.value;
  return `view-${target}`;
});

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>