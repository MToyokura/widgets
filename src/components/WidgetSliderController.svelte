<svelte:options runes={true} />

<script lang="ts">
  let {
    id,
    label,
    description = "",
    min = 0,
    max = 1,
    step = 0.1,
    value = $bindable(0),
    valuePrefix = "",
    valueSuffix = "",
  }: {
    id: string;
    label: string;
    description?: string;
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    valuePrefix?: string;
    valueSuffix?: string;
  } = $props();

  function handleInput(event: Event) {
    value = Number((event.currentTarget as HTMLInputElement).value);
  }
</script>

<div class="widget-slider-controller" data-widget-slider-controller>
  <label class="widget-slider-controller__label" for={id}>{label}</label>
  <input
    {id}
    class="widget-slider-controller__input"
    type="range"
    {min}
    {max}
    {step}
    {value}
    data-value-prefix={valuePrefix}
    data-value-suffix={valueSuffix}
    oninput={handleInput}
  />

  {#if description}
    <p class="widget-slider-controller__description">{description}</p>
  {/if}
</div>

<style>
  .widget-slider-controller {
    color: var(--sl-color-text);
  }

  .widget-slider-controller__label {
    font-weight: 600;
  }

  .widget-slider-controller__input {
    width: 100%;
  }
</style>
