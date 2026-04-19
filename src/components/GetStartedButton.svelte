<script>
  export let href = "#";
  export let label = "始める";
</script>

<a class="get-started-button" {href}>
  {label}
</a>

<style>
  .get-started-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.5rem;
    width: fit-content;
    margin: 0 auto;
    text-decoration: none;
    color: var(--sl-color-white);
    background-color: var(--sl-color-gray-6);
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease;
  }

  .get-started-button:hover {
    transform: translateY(-4px);
    border-color: var(--sl-color-accent-high);
    background-color: var(--sl-color-gray-5);
  }

  .get-started-button:active {
    transform: translateY(0);
  }

  .get-started-button:focus-visible {
    outline: none;
    border-color: var(--sl-color-accent-high);
  }

  @media (max-width: 40rem) {
    .get-started-button {
      width: 100%;
      box-sizing: border-box;
    }
  }
</style>
