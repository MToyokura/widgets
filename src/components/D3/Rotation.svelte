<svelte:options runes={true} />

<script lang="ts">
  import * as d3 from "d3";
  import WidgetContainer from "../WidgetContainer.svelte";
  import {
    getCentroid,
    getCircleArcPath,
    getPointOnCircle,
    getPolygonPath,
    rotatePoint,
    type Point,
  } from "./functions/geometry";

  // 1. Static Configuration
  const width = 400;
  const height = 400;
  const gridSpacing = 40;
  const guideRadius = 72;
  const rotationCenter: Point = { x: 210, y: 210 };

  const gridXs = Array.from(
    { length: Math.floor(width / gridSpacing) + 1 },
    (_, i) => i * gridSpacing,
  );
  const gridYs = Array.from(
    { length: Math.floor(height / gridSpacing) + 1 },
    (_, i) => i * gridSpacing,
  );

  // 2. Reactive State (The source of truth)
  let originalPoints = $state<Point[]>([
    { x: 80, y: 270 },
    { x: 155, y: 130 },
    { x: 240, y: 230 },
  ]);
  let rotationAngle = $state(0);

  // 3. Derived State (Calculated automatically when state changes)
  const centroid = $derived(getCentroid(originalPoints));
  const originalPath = $derived(getPolygonPath(originalPoints));

  const rotatedPoints = $derived(
    originalPoints.map((p) => rotatePoint(p, rotationCenter, rotationAngle)),
  );
  const transformedPath = $derived(getPolygonPath(rotatedPoints));

  const angleHandlePoint = $derived(
    getPointOnCircle(rotationCenter, guideRadius, rotationAngle),
  );

  const vertexPaths = $derived(
    originalPoints.map((point) => {
      const radius = Math.hypot(
        point.x - rotationCenter.x,
        point.y - rotationCenter.y,
      );
      const startAngle = Math.atan2(
        point.y - rotationCenter.y,
        point.x - rotationCenter.x,
      );
      return getCircleArcPath(
        rotationCenter,
        radius,
        startAngle,
        startAngle + rotationAngle,
      );
    }),
  );

  // 4. Drag Interactions (D3 as a logic engine only)
  function setupAngleDrag(node: SVGCircleElement) {
    const drag = d3.drag<SVGCircleElement, unknown>().on("drag", (event) => {
      rotationAngle = Math.atan2(
        event.y - rotationCenter.y,
        event.x - rotationCenter.x,
      );
    });
    d3.select(node).call(drag);
  }

  function setupMoveDrag(node: SVGCircleElement) {
    const drag = d3.drag<SVGCircleElement, unknown>().on("drag", (event) => {
      const dx = event.x - centroid.x;
      const dy = event.y - centroid.y;
      originalPoints = originalPoints.map((p) => ({
        x: p.x + dx,
        y: p.y + dy,
      }));
    });
    d3.select(node).call(drag);
  }
</script>

<WidgetContainer id="rotation-wrapper">
  <svg viewBox={`0 0 ${width} ${height}`} aria-label="Rotation diagram">
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

    <circle
      cx={rotationCenter.x}
      cy={rotationCenter.y}
      r={guideRadius}
      fill="none"
      stroke="#cbd5e1"
      stroke-width="2"
      stroke-dasharray="5 5"
    />

    <path
      d={originalPath}
      fill="rgba(37, 99, 235, 0.24)"
      stroke="#2563eb"
      stroke-width="3"
    />

    {#each vertexPaths as d}
      <path
        {d}
        fill="none"
        stroke="#94a3b8"
        stroke-width="1"
        stroke-dasharray="2 2"
      />
    {/each}

    <path
      d={transformedPath}
      fill="rgba(14, 165, 233, 0.22)"
      stroke="#0ea5e9"
      stroke-width="3"
    />

    <circle cx={rotationCenter.x} cy={rotationCenter.y} r="4" fill="#dc2626" />

    <circle
      use:setupAngleDrag
      cx={angleHandlePoint.x}
      cy={angleHandlePoint.y}
      r="10"
      fill="#f97316"
      class="cursor-grab active:cursor-grabbing"
      style="touch-action: none;"
    />
    <circle
      use:setupMoveDrag
      cx={centroid.x}
      cy={centroid.y}
      r="8"
      fill="#2563eb"
      class="cursor-grab active:cursor-grabbing"
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
</style>
