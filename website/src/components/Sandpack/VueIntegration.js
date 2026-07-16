import React from 'react';
import clsx from 'clsx';
import Sandpack from './index';
import commonStyles from '../RawExample.module.css';

const AppCode = `<script setup>
import { reactive, ref } from 'vue';
import { create, test, enforce } from 'vest';
import 'vest/email';

const suite = create((data = {}) => {
  // \`test\` runs an assertion. The first argument is the name of the field.
  test('username', 'Username is required', () => {
    // \`enforce\` checks that a condition is met. 
    // If it throws an error, the test is marked as failed.
    enforce(data.username).isNotBlank();
  });

  // You can define multiple tests for the same field.
  test('username', 'Username must be at least 3 characters', () => {
    enforce(data.username).longerThanOrEquals(3);
  });

  test('email', 'Email is required', () => {
    enforce(data.email).isNotBlank();
  });

  test('email', 'Please enter a valid email', () => {
    enforce(data.email).isEmail();
  });
});

const formData = reactive({
  username: '',
  email: '',
});

const res = ref(suite.get());

const validateField = fieldName => {
  suite.only(fieldName).afterEach(() => {
    res.value = suite.get();
  }).run(formData);
};

const handleSubmit = async () => {
  await suite.run(formData);
  if (suite.isValid()) {
    console.log('Form is valid!', formData);
  }
};
</script>

<template>
  <div class="app">
    <h1>Vue + Vest</h1>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Username:</label>
        <input
          v-model="formData.username"
          @input="validateField('username')"
          placeholder="Username"
          :class="{ invalid: res.hasErrors('username') }"
        />
        <span v-if="res.hasErrors('username')" class="error">
          {{ res.getError('username') }}
        </span>
      </div>

      <div class="form-group">
        <label>Email:</label>
        <input
          v-model="formData.email"
          @input="validateField('email')"
          type="email"
          placeholder="Email"
          :class="{ invalid: res.hasErrors('email') }"
        />
        <span v-if="res.hasErrors('email')" class="error">
          {{ res.getError('email') }}
        </span>
      </div>

      <button type="submit" :disabled="!res.isValid()">
        Submit
      </button>

      <div class="status">
        Status: {{ res.isValid() ? '✅ Valid' : '❌ Invalid' }}
      </div>
    </form>
  </div>
</template>

<style scoped>
.app {
  padding: 20px;
  max-width: 500px;
  font-family: sans-serif;
}

h1 {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
  box-sizing: border-box;
}

input.invalid {
  border-color: #ff5f56;
}

input:focus {
  outline: none;
  border-color: #42b883;
}

.error {
  color: #ff5f56;
  font-size: 0.85rem;
  margin-top: 4px;
  display: block;
}

button {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: none;
  border-radius: 4px;
  background: #42b883;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
}

button:disabled {
  background: #ccc;
  color: #666;
  cursor: not-allowed;
}

.status {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  color: #666;
  font-size: 0.9rem;
}
</style>
`;

export default function VueIntegrationSandpack() {
  return (
    <div className={commonStyles.codeWindow}>
      <Sandpack
        template="vue"
        theme="dark"
        files={{
          '/src/App.vue': AppCode,
        }}
        customSetup={{
          dependencies: {
            vest: '^6.3.2',
          },
        }}
        options={{
          activeFile: '/src/App.vue',
          showConsole: false,
          showCommonFiles: false,
          editorHeight: 500,
        }}
      />
    </div>
  );
}
