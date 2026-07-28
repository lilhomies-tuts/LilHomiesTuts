<template>
  <section id="register" class="section-padding">
    <div class="glossy-panel form-container">
      <h2 class="form-title">STUDENT REGISTRATION PANEL</h2>

      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="studentName">Student Name</label>
          <input 
            id="studentName"
            type="text" 
            v-model.trim="form.studentName" 
            required 
            placeholder="Full Name" 
          />
        </div>

        <div class="form-group">
          <label for="parentName">Parent Name</label>
          <input 
            id="parentName"
            type="text" 
            v-model.trim="form.parentName" 
            required 
            placeholder="Parent/Guardian Name" 
          />
        </div>

        <div class="form-group">
          <label for="standard">Standard / Class</label>
          <input 
            id="standard"
            type="text" 
            v-model.trim="form.standard" 
            required 
            placeholder="e.g. 10th Standard / Intermediate 1st Yr" 
          />
        </div>

        <div class="form-group">
          <label for="parentMobile">Parent Mobile Number</label>
          <input 
            id="parentMobile"
            type="tel" 
            pattern="[0-9]{10}" 
            maxlength="10"
            v-model.trim="form.parentMobile" 
            required 
            placeholder="10 Digit Mobile Number" 
          />
        </div>

        <div class="form-group">
          <label for="studentEmail">Student Mail ID</label>
          <input 
            id="studentEmail"
            type="email" 
            v-model.trim="form.studentEmail" 
            required 
            placeholder="student@example.com" 
          />
        </div>

        <div class="form-group">
          <span class="field-label">Interested Course</span>
          <div class="radio-group" role="radiogroup" aria-label="Interested Course">
            <label v-for="(c, index) in courseOptions" :key="c" class="radio-item">
              <input 
                type="radio" 
                :id="`course-${index}`"
                :value="c" 
                v-model="form.interestedCourse" 
                name="interestedCourse" 
                required 
              />
              <span>{{ c }}</span>
            </label>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'SUBMITTING...' : 'SUBMIT REGISTRATION' }}
        </button>

        <p v-if="message" class="status-msg" :class="{ error: isError }">{{ message }}</p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';

// Pull from environment variables
const API_URL = import.meta.env.VITE_SHEETDB_URL;

const loading = ref(false);
const message = ref('');
const isError = ref(false);

const courseOptions = [
  "6th to 10th Standard",
  "Intermediate Subject Mastery",
  "Cinematography & Direction",
  "Video Editing",
  "Programming",
  "Tally Prime",
  "MS Office Suite",
  "Others"
];

// Initial state object for easy resetting
const initialForm = {
  studentName: '',
  parentName: '',
  standard: '',
  parentMobile: '',
  studentEmail: '',
  interestedCourse: ''
};

const form = reactive({ ...initialForm });

const submitForm = async () => {
  if (!API_URL) {
    isError.value = true;
    message.value = "Configuration error: API URL is missing.";
    return;
  }

  loading.value = true;
  message.value = '';
  isError.value = false;

  try {
    await axios.post(API_URL, { data: form });
    message.value = "Registration successful! We will contact you soon.";
    
    // Clean reset to initial state
    Object.assign(form, initialForm);
  } catch (error) {
    isError.value = true;
    message.value = "Submission failed. Please check your connection and try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.section-padding { padding: 32px 12px; }
.form-container { max-width: 600px; margin: 0 auto; padding: 36px; }
.form-title { font-family: var(--font-heading); font-size: 28px; color: var(--neon-purple); margin-bottom: 20px; text-align: center; }
.form-group { margin-bottom: 16px; text-align: left; }
.form-group label, .field-label { display: block; font-size: 12px; font-family: var(--font-mono); color: var(--text-muted); margin-bottom: 6px; }
.form-group input[type="text"], 
.form-group input[type="tel"], 
.form-group input[type="email"] {
  width: 100%; padding: 12px; background: rgba(0,0,0,0.5); border: 1px solid var(--border-glass); border-radius: 6px; color: #fff; font-size: 14px;
}
.radio-group { display: flex; flex-direction: column; gap: 8px; }
.radio-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #fff; cursor: pointer; }
.submit-btn { width: 100%; padding: 14px; background: var(--neon-purple); border: none; border-radius: 8px; color: #fff; font-weight: bold; font-family: var(--font-mono); cursor: pointer; transition: opacity 0.2s; margin-top: 10px; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.status-msg { margin-top: 16px; text-align: center; font-size: 13px; color: var(--neon-yellow); }
.status-msg.error { color: #ff4d4d; }
</style>