<script setup lang="ts">
import { useTheme } from "~/composables/useTheme";

const { isDark, toggleTheme } = useTheme();

// Apply theme class to html/body
useHead({
  htmlAttrs: {
    "data-theme": () => (isDark.value ? "dark" : "light"),
  },
});
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <span class="logo-icon">📊</span> BI Dashboard
      </div>
      <nav class="nav">
        <NuxtLink to="/kardex" class="link">Kardex</NuxtLink>
        <button class="theme-btn" @click="toggleTheme" title="Toggle Theme">
          {{ isDark ? 'cY' : 'R' }}
        </button>
      </nav>
    </header>

    <main class="main">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
:root {
  /* Light Theme (Default) */
  --bg: #f3f4f6;
  --panel: #ffffff;
  --text: #1f2937;
  --muted: #6b7280;
  --border: #e5e7eb;
  --accent: #3b82f6;
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --input-bg: #ffffff;
}

[data-theme="dark"] {
  /* Dark Theme */
  --bg: #0b1220;
  --panel: #1e293b;
  --text: #e5e7eb;
  --muted: #9ca3af;
  --border: rgba(255, 255, 255, 0.08);
  --accent: #60a5fa;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  --input-bg: rgba(255, 255, 255, 0.03);
}

html, body, #__nuxt { height: 100%; }
body {
  margin: 0;
  background-color: var(--bg);
  /* Subtle mesh gradient overlay */
  background-image: 
    radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.05) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(34, 197, 94, 0.05) 0px, transparent 50%);
  background-attachment: fixed;
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app { min-height: 100%; display: flex; flex-direction: column; }

.topbar {
  position: sticky; top: 0; z-index: 50;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  box-shadow: var(--shadow);
  transition: background 0.3s, border-color 0.3s;
}

.brand { 
  font-weight: 800; 
  font-size: 18px; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  letter-spacing: -0.5px;
}
.logo-icon { font-size: 20px; }

.nav { display: flex; align-items: center; gap: 12px; }

.nav .link {
  color: var(--text);
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}
.nav .link:hover { 
  background: var(--bg); 
  color: var(--accent); 
}
.nav .link.router-link-active {
  background: var(--bg);
  color: var(--accent);
  font-weight: 700;
}

.theme-btn {
  background: none;
  border: 1px solid var(--border);
  color: var(--text);
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  font-family: monospace; /* simplified icon fallback */
  transition: all 0.2s;
}
.theme-btn:hover { border-color: var(--accent); color: var(--accent); }

.main { 
  padding: 24px; 
  max-width: 1440px; 
  width: 100%; 
  margin: 0 auto; 
  box-sizing: border-box;
}
</style>