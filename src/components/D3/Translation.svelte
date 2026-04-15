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

  // 2. Reactive State
  let originalPoints: Point[] = [
    { x: 60, y: 265 },
    { x: 125, y: 135 },
    { x: 205, y: 225 },
  ];
  let offset: Point = { x: 150, y: 0 };
  let isDragging = false;

  // 3. Derived State (Reactive Declarations)
  // These update automatically whenever 'originalPoints' or 'offset' change.
  $: transformedPoints = originalPoints.map((p) => translatePoint(p, offset));
  $: centroid = getCentroid(originalPoints);
  $: handlePos = translatePoint(centroid, offset);

  $: connectorsPath = getConnectorPath(originalPoints, transformedPoints);
  $: originalPath = getPolygonPath(originalPoints);
  $: transformedPath = getPolygonPath(transformedPoints);

  // 4. Logic
  function clampPoint(point: Point, margin = 18): Point {
    return {
      x: Math.max(margin, Math.min(width - margin, point.x)),
      y: Math.max(margin, Math.min(height - margin, point.y)),
    };
  }

  // D3 Drag action for Svelte
  function dragAction(node: SVGCircleElement) {
    const drag = d3
      .drag<SVGCircleElement, unknown>()
      .on("start", () => (isDragging = true))
      .on("drag", (event) => {
        const handlePoint = clampPoint({ x: event.x, y: event.y });
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
    {#each gridXs as x}
      <line
        x1={x}
        y1="0"
        x2={x}
        y2={height}
        stroke="#d7dde5"
        stroke-width="1"
      />
    {/each}
    {#each gridYs as y}
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
      style:cursor={isDragging ? "grabbing" : "grab"}
      style="touch-action: none;"
    />
  </svg>
</WidgetContainer>
