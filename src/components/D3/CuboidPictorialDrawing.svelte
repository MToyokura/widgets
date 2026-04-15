<svelte:options runes={true} />

<script lang="ts">
  import WidgetContainer from "../WidgetContainer.svelte";
  import WidgetSliderController from "../WidgetSliderController.svelte";
  import { getPolygonPath } from "./functions/geometry";

  type Point = {
    x: number;
    y: number;
  };

  let {
    locale = "ja",
    xScale: rawXScale = 1,
    yScale: rawYScale = 1,
    zScale: rawZScale = 1,
    xScaleControlId,
    yScaleControlId,
    zScaleControlId,
  }: {
    locale?: "en" | "ja";
    xScale?: number | string;
    yScale?: number | string;
    zScale?: number | string;
    xScaleControlId?: string;
    yScaleControlId?: string;
    zScaleControlId?: string;
  } = $props();

  const copy = {
    en: {
      title: "Pictorial drawing of a cuboid",
      xLabel: "X axis",
      yLabel: "Y axis",
      zLabel: "Z axis",
    },
    ja: {
      title: "直方体の見取図",
      xLabel: "X 方向",
      yLabel: "Y 方向",
      zLabel: "Z 方向",
    },
  } as const;

  const origin = { x: 108, y: 110 };
  const viewBoxPadding = 24;
  const baseId = `cube-pictorial-${crypto.randomUUID()}`;
  const titleId = `${baseId}-title`;

  let xScale = $state(1);
  let yScale = $state(1);
  let zScale = $state(1);

  const text = $derived(copy[locale === "en" ? "en" : "ja"]);
  const resolvedXScaleControlId = $derived(
    xScaleControlId || `${baseId}-x-scale`,
  );
  const resolvedYScaleControlId = $derived(
    yScaleControlId || `${baseId}-y-scale`,
  );
  const resolvedZScaleControlId = $derived(
    zScaleControlId || `${baseId}-z-scale`,
  );
  const geometry = $derived(getGeometry(xScale, yScale, zScale));
  const aspectRatio = $derived(
    `${geometry.viewBoxWidth} / ${geometry.viewBoxHeight}`,
  );

  $effect(() => {
    xScale = getPositiveNumber(rawXScale, 1);
    yScale = getPositiveNumber(rawYScale, 1);
    zScale = getPositiveNumber(rawZScale, 1);
  });

  function getPositiveNumber(
    value: number | string | undefined,
    fallback: number,
  ) {
    if (typeof value === "number") {
      return Number.isFinite(value) && value > 0 ? value : fallback;
    }

    if (typeof value === "string") {
      const parsed = Number(value);

      return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    }

    return fallback;
  }

  function addPoints(...points: Point[]): Point {
    return points.reduce(
      (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
      { x: 0, y: 0 },
    );
  }

  function getGeometry(xScale: number, yScale: number, zScale: number) {
    const xAxis = { x: 120 * xScale, y: 0 };
    const yAxis = { x: 0, y: 120 * yScale };
    const zAxis = { x: 82 * zScale, y: -58 * zScale };

    const frontTopLeft = origin;
    const frontTopRight = addPoints(origin, xAxis);
    const frontBottomRight = addPoints(origin, xAxis, yAxis);
    const frontBottomLeft = addPoints(origin, yAxis);
    const backTopLeft = addPoints(origin, zAxis);
    const backTopRight = addPoints(origin, xAxis, zAxis);
    const backBottomRight = addPoints(origin, xAxis, yAxis, zAxis);
    const backBottomLeft = addPoints(origin, yAxis, zAxis);

    const frontFace = [
      frontTopLeft,
      frontTopRight,
      frontBottomRight,
      frontBottomLeft,
    ];
    const topFace = [frontTopLeft, frontTopRight, backTopRight, backTopLeft];
    const sideFace = [
      frontTopRight,
      backTopRight,
      backBottomRight,
      frontBottomRight,
    ];
    const visibleEdges = [
      [frontTopLeft, frontTopRight],
      [frontTopRight, frontBottomRight],
      [frontBottomRight, frontBottomLeft],
      [frontBottomLeft, frontTopLeft],
      [frontTopLeft, backTopLeft],
      [frontTopRight, backTopRight],
      [frontBottomRight, backBottomRight],
      [backTopLeft, backTopRight],
      [backTopRight, backBottomRight],
    ] as const;
    const hiddenEdges = [
      [frontBottomLeft, backBottomLeft],
      [backTopLeft, backBottomLeft],
      [backBottomLeft, backBottomRight],
    ] as const;
    const allPoints = [
      frontTopLeft,
      frontTopRight,
      frontBottomRight,
      frontBottomLeft,
      backTopLeft,
      backTopRight,
      backBottomRight,
      backBottomLeft,
    ];
    const minX =
      Math.min(...allPoints.map((point) => point.x)) - viewBoxPadding;
    const maxX =
      Math.max(...allPoints.map((point) => point.x)) + viewBoxPadding;
    const minY =
      Math.min(...allPoints.map((point) => point.y)) - viewBoxPadding;
    const maxY =
      Math.max(...allPoints.map((point) => point.y)) + viewBoxPadding;

    return {
      frontFace,
      topFace,
      sideFace,
      visibleEdges,
      hiddenEdges,
      viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`,
      viewBoxWidth: maxX - minX,
      viewBoxHeight: maxY - minY,
    };
  }
</script>

<div class="not-content">
  <WidgetContainer {aspectRatio} maxWidth="720px">
    <svg viewBox={geometry.viewBox} role="img" aria-labelledby={titleId}>
      <title id={titleId}>{text.title}</title>

      <path class="face" data-face="top" d={getPolygonPath(geometry.topFace)} />
      <path
        class="face"
        data-face="side"
        d={getPolygonPath(geometry.sideFace)}
      />
      <path
        class="face"
        data-face="front"
        d={getPolygonPath(geometry.frontFace)}
      />

      {#each geometry.hiddenEdges as [start, end]}
        <line
          class="edge edge-hidden"
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
        />
      {/each}

      {#each geometry.visibleEdges as [start, end]}
        <line
          class="edge edge-visible"
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
        />
      {/each}
    </svg>

    {#snippet controls()}
      <div class="pictorial-drawing-controls">
        <div>
          <WidgetSliderController
            id={resolvedXScaleControlId}
            label={text.xLabel}
            min={0.5}
            max={2.5}
            step={0.1}
            bind:value={xScale}
          />
        </div>
        <div>
          <WidgetSliderController
            id={resolvedYScaleControlId}
            label={text.yLabel}
            min={0.5}
            max={2.5}
            step={0.1}
            bind:value={yScale}
          />
        </div>
        <div>
          <WidgetSliderController
            id={resolvedZScaleControlId}
            label={text.zLabel}
            min={0.5}
            max={2.5}
            step={0.1}
            bind:value={zScale}
          />
        </div>
      </div>
    {/snippet}
  </WidgetContainer>
</div>

<style>
  .pictorial-drawing-controls {
    display: flex;
    gap: 1rem;
  }

  .pictorial-drawing-controls > div {
    flex: 1 1 0;
  }

  .face {
    fill: none;
    stroke: none;
  }

  .edge {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .edge-visible {
    stroke: #0f172a;
    stroke-width: 4;
  }

  .edge-hidden {
    stroke: #64748b;
    stroke-width: 3;
    stroke-dasharray: 8 8;
  }

  @media (max-width: 30rem) {
    .pictorial-drawing-controls {
      flex-direction: column;
    }
  }
</style>
