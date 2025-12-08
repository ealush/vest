import React from 'react';
import Sandpack from './index';
import commonStyles from '../RawExample.module.css';

const SuiteCode = `import { create, test, enforce } from "vest";

export default create((data = {}) => {
  test("username", "Username is required", () => {
    enforce(data.username).isNotBlank();
  });

  test("username", "Username must be at least 3 characters", () => {
    enforce(data.username).longerThanOrEquals(3);
  });

  test("email", "Email is required", () => {
    enforce(data.email).isNotBlank();
  });

  test("email", "Please enter a valid email", () => {
    enforce(data.email).isEmail();
  });
});
`;

const AppCode = `<script setup>
import { reactive, ref } from "vue";
import suite from "./validation.js";
import "./style.css";

const form = reactive({
  username: "",
  email: "",
});

const result = ref(suite.get());

const validateField = (fieldName) => {
  suite
    .afterEach((res) => {
      result.value = res;
    })
    .run(form, fieldName);
};

const handleSubmit = () => {
  suite
    .afterEach((res) => {
      result.value = res;

      if (!res.hasErrors()) {
        alert("Form is valid! 🎉");
      }
    })
    .run(form);
};
</script>

<template>
  <main class="app">
    <h1>Vest + Vue 3</h1>
    <form @submit.prevent="handleSubmit">
      <label>
        Username
        <input
          v-model="form.username"
          @input="validateField('username')"
          placeholder="Ada Lovelace"
        />
        <span v-if="result.hasErrors('username')" class="error">
          {{ result.getErrors('username')[0] }}
        </span>
      </label>

      <label>
        Email
        <input
          v-model="form.email"
          @input="validateField('email')"
          type="email"
          placeholder="ada@vestjs.dev"
        />
        <span v-if="result.hasErrors('email')" class="error">
          {{ result.getErrors('email')[0] }}
        </span>
      </label>

      <button type="submit">Validate</button>
    </form>

    <section class="status" aria-live="polite">
      <div>Form is {{ result.isValid() ? "valid ✅" : "not valid yet" }}</div>
    </section>
  </main>
</template>
`;

const MainCode = `import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
`;

const StylesCode = `:root {
  color-scheme: dark;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  background: #0f1115;
  color: #f8fafc;
}

body {
  margin: 0;
}

.app {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}

h1 {
  margin: 0 0 16px;
  font-size: 1.6rem;
}

form {
  display: grid;
  gap: 16px;
}

label {
  display: grid;
  gap: 6px;
  font-size: 0.95rem;
  color: #cbd5e1;
}

input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #1f2933;
  background: #0c0e13;
  color: #fff;
}

input:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.25);
}

button {
  padding: 12px 14px;
  border-radius: 10px;
  border: none;
  background: #7c3aed;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 30px rgba(124, 58, 237, 0.35);
}

.error {
  color: #fb7185;
  font-size: 0.85rem;
}

.status {
  margin-top: 22px;
  padding: 14px 12px;
  border: 1px solid #1f2933;
  border-radius: 10px;
  background: #0c0e13;
  color: #cbd5e1;
}
`;

export default function VueIntegrationSandpack() {
  return (
    <div className={commonStyles.codeWindow}>
      <Sandpack
        template="vue3"
        theme="dark"
        files={{
          '/src/validation.js': SuiteCode,
          '/src/App.vue': AppCode,
          '/src/style.css': StylesCode,
          '/src/main.js': MainCode,
        }}
        customSetup={{
          dependencies: {
            vest: 'next',
          },
        }}
        options={{
          activeFile: '/src/App.vue',
          visibleFiles: ['/src/App.vue', '/src/validation.js'],
          editorHeight: 700,
        }}
      />
    </div>
  );
}
