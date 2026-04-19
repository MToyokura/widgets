<svelte:options runes={true} />

<script lang="ts">
  import * as d3 from "d3";
  import WidgetContainer from "../WidgetContainer.svelte";
  import {
    getCentroid,
    getConnectorPath,
    getPolygonPath,
    translatePoint,
    type Point,
  } from "./functions/geometry";

  // 1. Constants and Setup
  const width = 400;
  const height = 400;
  const gridSpacing = 40;

  const gridXs = Array.from(
    { length: Math.floor(width / gridSpacing) + 1 },
    (_, i) => i * gridSpacing,
  );
  const gridYs = Array.from(
    { length: Math.floor(height / gridSpacing) + 1 },
    (_, i) => i * gridSpacing,
  );

  // 2. Reactive State (Svelte 5 Runes)
  let originalPoints = $state<Point[]>([
    { x: 60, y: 265 },
    { x: 125, y: 135 },
    { x: 205, y: 225 },
  ]);
  let offset = $state<Point>({ x: 150, y: 0 });
  let isDragging = $state(false);

  // 3. Derived State
  let transformedPoints = $derived(
    originalPoints.map((p) => translatePoint(p, offset)),
  );
  let centroid = $derived(getCentroid(originalPoints));
  let handlePos = $derived(translatePoint(centroid, offset));

  let connectorsPath = $derived(
    getConnectorPath(originalPoints, transformedPoints),
  );
  let originalPath = $derived(getPolygonPath(originalPoints));
  let transformedPath = $derived(getPolygonPath(transformedPoints));

  // 4. Logic
  function clampPoint(point: Point, margin = 18): Point {
    return {
      x: Math.max(margin, Math.min(width - margin, point.x)),
      y: Math.max(margin, Math.min(height - margin, point.y)),
    };
  }

  // D3 Drag action
  function dragAction(node: SVGCircleElement) {
    const drag = d3
      .drag<SVGCircleElement, unknown>()
      .on("start", () => (isDragging = true))
      .on("drag", (event) => {
        const handlePoint = clampPoint({ x: event.x, y: event.y });
        // Update the state object to trigger reactivity
        offset = {
          x: handlePoint.x - centroid.x,
          y: handlePoint.y - centroid.y,
        };
      })
      .on("end", () => (isDragging = false));

    d3.select(node).call(drag);
  }
</script>

<WidgetContainer id="translation-wrapper">
  <svg viewBox="0 0 {width} {height}" aria-label="Translation diagram">
    {#each gridXs as x (x)}
      <line
        x1={x}
        y1="0"
        x2={x}
        y2={height}
        stroke="#d7dde5"
        stroke-width="1"
      />
    {/each}
    {#each gridYs as y (y)}
      <line x1="0" y1={y} x2={width} y2={y} stroke="#d7dde5" stroke-width="1" />
    {/each}

    <path
      d={connectorsPath}
      fill="none"
      stroke="#94a3b8"
      stroke-width="2"
      stroke-dasharray="5 5"
      style="pointer-events: none;"
    />

    <path
      d={originalPath}
      fill="rgba(37, 99, 235, 0.24)"
      stroke="#2563eb"
      stroke-width="3"
      style="pointer-events: none;"
    />

    <path
      d={transformedPath}
      fill="rgba(249, 115, 22, 0.24)"
      stroke="#f97316"
      stroke-width="3"
      style="pointer-events: none;"
    />

    <circle
      use:dragAction
      cx={handlePos.x}
      cy={handlePos.y}
      r="11"
      fill="#f97316"
      class="cursor-grab"
      style:cursor={isDragging ? "grabbing" : "grab"}
      style="touch-action: none;"
    />
  </svg>
</WidgetContainer>

<style>
  .cursor-grab {
    cursor: grab;
  }
  .cursor-grab:active {
    cursor: grabbing;
  }

  /* Optional: Add any specific styles here */
  svg {
    width: 100%;
    height: auto;
    display: block;
    background-color: #f8fafc;
  }
</style>
