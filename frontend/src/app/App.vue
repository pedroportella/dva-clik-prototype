<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink class="brand" to="/">DVA CLIK Operations</RouterLink>
      <nav aria-label="Primary navigation">
        <a href="#queue-title">Upload queue</a>
        <a href="#health-title">Health</a>
        <a href="#architecture-title">Planning</a>
      </nav>
    </header>

    <main id="main-content" class="app-main">
      <RouterView />
    </main>
  </div>
</template>
