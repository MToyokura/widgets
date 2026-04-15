<script lang="ts">
  import LanguageSelector from "../LanguageSelector.svelte";
</script>

<svelte:head>
  <title>OER</title>
  <meta
    name="description"
    content="Choose a language to continue to the interactive geometry lessons."
  />
</svelte:head>

<main class="shell">
  <section class="panel">
    <h1>Choose a language</h1>
    <div class="content">
      <LanguageSelector />
    </div>
  </section>
</main>

<style>
  :global(:root) {
    color-scheme: dark;
  }

  .shell {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 2rem;
  }

  .panel {
    width: min(100%, 960px);
    padding: clamp(2rem, 5vw, 4rem);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 1.75rem;
    background: rgba(7, 17, 31, 0.72);
    backdrop-filter: blur(18px);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
  }

  h1 {
    margin: 0;
    font-size: clamp(2.4rem, 7vw, 5rem);
    line-height: 0.95;
  }

  .content {
    margin-top: 2rem;
  }
</style>
