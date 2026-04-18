<svelte:options runes={true} />

<script lang="ts">
  const options = [
    {
      href: "/en/geometry/transformation-of-figures-in-a-plane",
      label: "English",
      description: "Interactive widgets for visual learning.",
    },
    {
      href: "/ja/geometry/transformation-of-figures-in-a-plane",
      label: "日本語",
      description: "視覚的に学ぼう",
    },
  ] as const;
</script>

<div class="language-selector">
  {#each options as option (option.href)}
    <a href={option.href} class="card">
      <span class="label">{option.label}</span>
      <span class="description">{option.description}</span>
    </a>
  {/each}
</div>

<style>
  .language-selector {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    padding: 2rem 0;
    max-width: 800px;
    margin: 0 auto;
  }

  .card {
    display: flex;
    flex-direction: column;
    padding: 2rem;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.5rem;
    text-decoration: none;
    color: var(--sl-color-white);
    background-color: var(--sl-color-gray-6);
    transition:
      transform 0.2s ease,
      border-color 0.2s ease;
    text-align: center;
  }

  .card:hover {
    transform: translateY(-4px);
    border-color: var(--sl-color-accent-high);
    background-color: var(--sl-color-gray-5);
  }

  .label {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .description {
    font-size: 1rem;
    color: var(--sl-color-gray-3);
  }

  @media (max-width: 50rem) {
    .language-selector {
      grid-template-columns: 1fr;
    }
  }
</style>
