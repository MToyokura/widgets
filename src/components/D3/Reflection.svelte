<svelte:options runes={true} />

<script lang="ts">
  import * as d3 from "d3";
  import WidgetContainer from "../WidgetContainer.svelte";
  import {
    getCentroid,
    getConnectorPath,
    getLinePathThroughPoint,
    getPointOnCircle,
    getPolygonPath,
    reflectPointAcrossLine,
    type Point,
  } from "./functions/geometry";

  // --- Props & Constants ---
  const width = 400;
  const height = 400;
  const gridSpacing = 40;
  const lineHandleDistance = 88;
  const lineHalfLength = 280;
  const linePoint: Point = { x: 200, y: 200 };

  // --- Reactive State ($state) ---
  let originalPoints = $state<Point[]>([
    { x: 30, y: 275 },
    { x: 90, y: 135 },
    { x: 175, y: 225 },
  ]);
  let lineAngle = $state(-Math.PI / 2);

  // --- Derived State ($derived) ---
  // These update automatically whenever originalPoints or lineAngle change
  const reflectedPoints = $derived(
    originalPoints.map((p) => reflectPointAcrossLine(p, linePoint, lineAngle)),
  );
  const centroid = $derived(getCentroid(originalPoints));
  const lineHandlePos = $derived(
    getPointOnCircle(linePoint, lineHandleDistance, lineAngle),
  );

  const connectorsPath = $derived(
    getConnectorPath(originalPoints, reflectedPoints),
  );
  const linePath = $derived(
    getLinePathThroughPoint(linePoint, lineAngle, lineHalfLength),
  );
  const originalPath = $derived(getPolygonPath(originalPoints));
  const reflectedPath = $derived(getPolygonPath(reflectedPoints));

  // Static Grid Data
  const gridXs = Array.from(
    { length: Math.floor(width / gridSpacing) + 1 },
    (_, i) => i * gridSpacing,
  );
  const gridYs = Array.from(
    { length: Math.floor(height / gridSpacing) + 1 },
    (_, i) => i * gridSpacing,
  );

  // --- Interactivity (D3 Actions) ---
  function angleDrag(node: SVGCircleElement) {
    const drag = d3
      .drag<SVGCircleElement, unknown>()
      .on("start", () => d3.select(node).style("cursor", "grabbing"))
      .on("drag", (event) => {
        lineAngle = Math.atan2(event.y - linePoint.y, event.x - linePoint.x);
      })
      .on("end", () => d3.select(node).style("cursor", "grab"));

    d3.select(node).call(drag);
    return { destroy: () => d3.select(node).on(".drag", null) };
  }

  function moveDrag(node: SVGCircleElement) {
    const drag = d3
      .drag<SVGCircleElement, unknown>()
      .on("start", () => d3.select(node).style("cursor", "grabbing"))
      .on("drag", (event) => {
        const dx = event.x - centroid.x;
        const dy = event.y - centroid.y;

        // Update state: Svelte 5 handles the fine-grained update
        originalPoints = originalPoints.map((p) => ({
          x: p.x + dx,
          y: p.y + dy,
        }));
      })
      .on("end", () => d3.select(node).style("cursor", "grab"));

    d3.select(node).call(drag);
    return { destroy: () => d3.select(node).on(".drag", null) };
  }
</script>

<WidgetContainer id="reflection-wrapper">
  <svg
    viewBox={`0 0 ${width} ${height}`}
    aria-label="Reflection diagram"
    style="display: block; width: 100%; height: auto;"
  >
    <g class="grid" stroke="#d7dde5" stroke-width="1">
      {#each gridXs as x}
        <line x1={x} y1="0" x2={x} y2={height} />
      {/each}
      {#each gridYs as y}
        <line x1="0" y1={y} x2={width} y2={y} />
      {/each}
    </g>

    <path
      d={connectorsPath}
      fill="none"
      stroke="#94a3b8"
      stroke-width="2"
      stroke-dasharray="5 5"
      style="pointer-events: none;"
    />

    <path
      d={linePath}
      fill="none"
      stroke="#111827"
      stroke-width="3"
      stroke-linecap="round"
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
      d={reflectedPath}
      fill="rgba(22, 163, 74, 0.2)"
      stroke="#16a34a"
      stroke-width="3"
      style="pointer-events: none;"
    />

    <circle
      use:angleDrag
      cx={lineHandlePos.x}
      cy={lineHandlePos.y}
      r="10"
      fill="#f97316"
      style="cursor: grab; touch-action: none;"
    />

    <circle
      use:moveDrag
      cx={centroid.x}
      cy={centroid.y}
      r="8"
      fill="#2563eb"
      style="cursor: grab; touch-action: none;"
    />
  </svg>
</WidgetContainer>

<style>
  /* Optional: styles for cleaner transitions if desired */
  svg {
    user-select: none;
  }
</style>
