<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">BI Dashboard</div>
      <nav class="nav">
        <NuxtLink to="/kardex" class="link">Kardex</NuxtLink>
      </nav>
    </header>

    <main class="main">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
:root {
  --bg: #0b1220;
  --panel: #121b2e;
  --panel2: #0f172a;
  --text: #e5e7eb;
  --muted: #9ca3af;
  --border: rgba(255,255,255,0.08);
  --accent: #60a5fa;
}

html, body, #__nuxt { height: 100%; }
body {
  margin: 0;
  background: radial-gradient(1200px 600px at 20% 10%, rgba(96,165,250,0.18), transparent 50%),
              radial-gradient(900px 500px at 80% 20%, rgba(34,197,94,0.12), transparent 55%),
              var(--bg);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji", "Segoe UI Emoji";
}

.app { min-height: 100%; display: flex; flex-direction: column; }
.topbar {
  position: sticky; top: 0;
  background: rgba(11,18,32,0.75);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px;
}
.brand { font-weight: 800; letter-spacing: 0.4px; }
.nav .link {
  color: var(--text);
  text-decoration: none;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: rgba(255,255,255,0.03);
}
.nav .link:hover { border-color: rgba(96,165,250,0.55); }

.main { padding: 18px; max-width: 1400px; width: 100%; margin: 0 auto; }
</style>
