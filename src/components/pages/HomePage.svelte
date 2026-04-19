<script lang="ts">
  import LanguagePrompt from "../LanguagePrompt.svelte";
  import LanguageSelector from "../LanguageSelector.svelte";
</script>

<svelte:head>
  <title>Widgets</title>
  <meta name="description" content="Interactive widgets for visual learning." />
</svelte:head>

<div class="page-shell">
  <div class="ambient ambient-a" aria-hidden="true"></div>
  <div class="ambient ambient-b" aria-hidden="true"></div>

  <main class="hero">
    <section class="hero-copy" aria-labelledby="home-title">
      <h1 id="home-title">Interactive widgets for visual learning</h1>
    </section>

    <section class="panel" aria-label="Language selection">
      <div class="panel-header">
        <h2>Choose a language</h2>
      </div>

      <LanguagePrompt />
      <LanguageSelector />
    </section>
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    min-height: 100vh;
    background:
      radial-gradient(
        circle at top left,
        rgba(72, 187, 120, 0.22),
        transparent 34%
      ),
      radial-gradient(
        circle at right 18%,
        rgba(59, 130, 246, 0.18),
        transparent 28%
      ),
      linear-gradient(180deg, #09111f 0%, #0f172a 44%, #111827 100%);
    color: #f8fafc;
  }

  .page-shell {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    padding: clamp(1.25rem, 3vw, 2.5rem);
  }

  .page-shell::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
    background-size: 3.5rem 3.5rem;
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.85), transparent 85%);
    pointer-events: none;
  }

  .ambient {
    position: absolute;
    border-radius: 999px;
    filter: blur(18px);
    opacity: 0.85;
    pointer-events: none;
  }

  .ambient-a {
    top: -8rem;
    left: -5rem;
    width: 18rem;
    height: 18rem;
    background: rgba(56, 189, 248, 0.2);
  }

  .ambient-b {
    right: -4rem;
    bottom: 6rem;
    width: 16rem;
    height: 16rem;
    background: rgba(34, 197, 94, 0.16);
  }

  .hero {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
    gap: clamp(1.5rem, 4vw, 3rem);
    align-items: start;
    max-width: 1180px;
    margin: 0 auto;
    padding-top: clamp(1rem, 4vw, 4rem);
  }

  .hero-copy {
    display: grid;
    align-content: center;
    gap: 1.25rem;
    min-height: min(76vh, 52rem);
    padding: clamp(1rem, 2vw, 2rem) 0;
  }

  .eyebrow,
  .panel-kicker {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 0.78rem;
    color: rgba(226, 232, 240, 0.78);
  }

  h1 {
    margin: 0;
    max-width: 11ch;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(3.1rem, 7vw, 6.2rem);
    line-height: 0.92;
    letter-spacing: -0.05em;
  }

  .lede {
    margin: 0;
    max-width: 42rem;
    font-size: clamp(1.05rem, 1.9vw, 1.25rem);
    line-height: 1.7;
    color: rgba(226, 232, 240, 0.84);
  }

  .highlights {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .highlights li {
    padding: 0.7rem 0.95rem;
    border: 1px solid rgba(148, 163, 184, 0.26);
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.42);
    backdrop-filter: blur(14px);
    color: rgba(248, 250, 252, 0.9);
    font-size: 0.95rem;
  }

  .panel {
    display: grid;
    gap: 1rem;
    padding: clamp(1.25rem, 3vw, 2rem);
    border: 1px solid rgba(148, 163, 184, 0.24);
    border-radius: 1.5rem;
    background: rgba(15, 23, 42, 0.58);
    box-shadow: 0 24px 80px rgba(2, 6, 23, 0.38);
    backdrop-filter: blur(20px);
  }

  .panel-header {
    display: grid;
    gap: 0.55rem;
  }

  .panel-header h2 {
    margin: 0;
    font-size: clamp(1.6rem, 2.6vw, 2rem);
    letter-spacing: -0.03em;
  }

  .panel-header p:last-child {
    margin: 0;
    color: rgba(226, 232, 240, 0.76);
    line-height: 1.65;
  }

  .panel :global(.language-prompt) {
    margin: 0;
    max-width: none;
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(148, 163, 184, 0.28);
    color: rgba(248, 250, 252, 0.92);
  }

  .panel :global(.language-selector) {
    max-width: none;
    padding: 0.5rem 0 0;
  }

  .panel :global(.card) {
    border-radius: 1rem;
    border-color: rgba(148, 163, 184, 0.22);
    background-color: rgba(15, 23, 42, 0.72);
  }

  .panel :global(.card:hover) {
    background-color: rgba(30, 41, 59, 0.92);
  }

  .panel :global(.description) {
    color: rgba(226, 232, 240, 0.68);
  }

  @media (max-width: 56rem) {
    .hero {
      grid-template-columns: 1fr;
    }

    .hero-copy {
      min-height: auto;
      padding-top: 0;
    }

    h1 {
      max-width: 14ch;
    }
  }

  @media (max-width: 40rem) {
    .page-shell {
      padding: 1rem;
    }

    .panel {
      border-radius: 1.1rem;
    }

    .highlights li {
      width: 100%;
      justify-content: flex-start;
    }
  }
</style>
