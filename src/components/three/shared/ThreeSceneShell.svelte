<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";
  import WidgetContainer from "../../WidgetContainer.svelte";

  let {
    id,
    pixelRatioCapControlId = "",
    antialiasControlId = "",
    children,
    controls,
  }: {
    id?: string;
    pixelRatioCapControlId?: string;
    antialiasControlId?: string;
    children?: Snippet;
    controls?: Snippet;
  } = $props();
</script>

<WidgetContainer
  {id}
  sceneClass="threejs-viz-shell"
  background="#e0e0e0"
  {controls}
>
  <div
    class="threejs-viz"
    data-pixel-ratio-cap-control-id={pixelRatioCapControlId}
    data-antialias-control-id={antialiasControlId}
  >
    {@render children?.()}
  </div>
</WidgetContainer>

<style>
  :global(.threejs-viz-shell) {
    padding: 0;
  }

  .threejs-viz {
    width: 100%;
    height: 100%;
    background: transparent;
  }

  .threejs-viz :global(canvas) {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
