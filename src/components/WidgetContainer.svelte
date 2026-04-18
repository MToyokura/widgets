<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    id,
    className = "",
    style = "",
    sceneClass = "",
    aspectRatio = "1 / 1",
    maxWidth = "720px",
    minHeight = "320px",
    background = "#f3f4f6",
    children,
    controls,
  }: {
    id?: string;
    className?: string;
    style?: string;
    sceneClass?: string;
    aspectRatio?: string;
    maxWidth?: string;
    minHeight?: string;
    background?: string;
    children?: Snippet;
    controls?: Snippet;
  } = $props();
</script>

<div
  {id}
  class="widget-container {className}"
  style:--widget-container-aspect-ratio={aspectRatio}
  style:--widget-container-max-width={maxWidth}
  style:--widget-container-min-height={minHeight}
  style:--widget-container-background={background}
  {style}
>
  <div class="widget-container__scene {sceneClass}">
    {@render children?.()}
  </div>

  {#if controls}
    <div class="widget-container__controls">
      {@render controls()}
    </div>
  {/if}
</div>

<style>
  .widget-container {
    width: 100%;
    margin: var(--sl-content-gap-y, 2rem) auto 0;
  }

  .widget-container__scene {
    width: min(100%, var(--widget-container-max-width));
    aspect-ratio: var(--widget-container-aspect-ratio);
    min-height: min(var(--widget-container-min-height), 75vw);
    margin: 0 auto;
    border-radius: 8px;
    overflow: hidden;
    background: var(--widget-container-background);
  }

  .widget-container__scene :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .widget-container__controls {
    width: min(100%, var(--widget-container-max-width));
    margin: 1.5rem auto 0;
  }
</style>
