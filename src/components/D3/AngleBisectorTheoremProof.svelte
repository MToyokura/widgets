<svelte:options runes={true} />

<script lang="ts">
  import * as d3 from "d3";
  import { cubicOut } from "svelte/easing";
  import WidgetContainer from "../WidgetContainer.svelte";
  import WidgetSliderController from "../WidgetSliderController.svelte";
  import {
    getAngleBisectorUnitVector,
    getAngleLabelPosition,
    getLinePath,
    getLinePathThroughPoint,
    getTrianglePath,
    type Point,
  } from "./functions/geometry";

  let { steps = $bindable(0) }: { steps?: number } = $props();

  const width = 400;
  const height = 400;
  const baseId = `angle-bisector-proof-${crypto.randomUUID()}`;
  const stepTwoAnimationDuration = 650;

  let stepTwoProgress = $state(steps >= 2 ? 1 : 0);
  let previousSteps = steps;
  let animationFrame = 0;

  // --- Interactive Points ---
  let pointA = $state<Point>({ x: 128, y: 200 });
  let pointB = $state<Point>({ x: 86, y: 278 });
  let pointC = $state<Point>({ x: 296, y: 278 });

  // --- Geometry Computation Helpers ---
  function getBisectorIntersection(a: Point, b: Point, c: Point): Point {
    const dir = getAngleBisectorUnitVector(b, a, c);

    const s = b;
    const e = c;
    const sVec = { x: e.x - s.x, y: e.y - s.y };
    const q = { x: s.x - a.x, y: s.y - a.y };

    const cross = dir.x * sVec.y - dir.y * sVec.x;

    if (Math.abs(cross) < 1e-8) {
      const segLen2 = sVec.x * sVec.x + sVec.y * sVec.y || 1;
      const u0 = Math.max(
        0,
        Math.min(1, ((a.x - s.x) * sVec.x + (a.y - s.y) * sVec.y) / segLen2),
      );
      return { x: s.x + sVec.x * u0, y: s.y + sVec.y * u0 };
    }

    const t = (q.x * sVec.y - q.y * sVec.x) / cross;
    const u = (q.x * dir.y - q.y * dir.x) / cross;

    if (u >= 0 && u <= 1) {
      return { x: a.x + t * dir.x, y: a.y + t * dir.y };
    }

    const uClamped = Math.max(0, Math.min(1, u));
    return { x: s.x + sVec.x * uClamped, y: s.y + sVec.y * uClamped };
  }

  function getLinesIntersection(
    p1: Point,
    angle1: number,
    p2: Point,
    angle2: number,
  ): Point {
    const v1 = { x: Math.cos(angle1), y: Math.sin(angle1) };
    const v2 = { x: Math.cos(angle2), y: Math.sin(angle2) };
    const cross = v1.x * v2.y - v1.y * v2.x;

    if (Math.abs(cross) < 1e-8) {
      const dot = (p1.x - p2.x) * v2.x + (p1.y - p2.y) * v2.y;
      return { x: p2.x + v2.x * dot, y: p2.y + v2.y * dot };
    }

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const t = (dx * v2.y - dy * v2.x) / cross;
    return { x: p1.x + t * v1.x, y: p1.y + t * v1.y };
  }

  function interpolatePoint(from: Point, to: Point, progress: number): Point {
    return {
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
    };
  }

  // --- Derived Coordinates & Angles ---
  const pointD = $derived(getBisectorIntersection(pointA, pointC, pointB));
  const bisectorAngle = $derived(
    Math.atan2(pointD.y - pointA.y, pointD.x - pointA.x),
  );

  const caAngle = $derived(
    Math.atan2(pointA.y - pointC.y, pointA.x - pointC.x),
  );
  const pointE = $derived(
    getLinesIntersection(pointC, caAngle, pointB, bisectorAngle),
  );

  const baAngle = $derived(
    Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x),
  );
  const pointF = $derived(
    getLinesIntersection(pointB, baAngle, pointC, bisectorAngle),
  );

  const efAngle = $derived(
    Math.atan2(pointF.y - pointE.y, pointF.x - pointE.x),
  );
  const pointX = $derived(
    getLinesIntersection(pointE, efAngle, pointA, bisectorAngle),
  );

  // --- Derived Paths (Triangles) ---
  const trianglePath = $derived(getTrianglePath(pointA, pointC, pointB));
  const acPath = $derived(getLinePath(pointA, pointC));
  const aebTrianglePath = $derived(getTrianglePath(pointA, pointE, pointB));
  const afcTrianglePath = $derived(getTrianglePath(pointA, pointF, pointC));
  const adcTrianglePath = $derived(getTrianglePath(pointA, pointC, pointD));
  const ebcTrianglePath = $derived(getTrianglePath(pointE, pointC, pointB));

  // --- Derived Paths (Lines) ---
  const abPath = $derived(getLinePath(pointA, pointB));
  const bisectorPath = $derived(getLinePath(pointA, pointD));
  const dbPath = $derived(getLinePath(pointD, pointB));
  const dcPath = $derived(getLinePath(pointD, pointC));
  const parallelThroughBPath = $derived(
    getLinePathThroughPoint(pointB, bisectorAngle, 600),
  );
  const parallelThroughCPath = $derived(
    getLinePathThroughPoint(pointC, bisectorAngle, 600),
  );
  const caExtendedPath = $derived(getLinePath(pointA, pointE));
  const extendedBisectorPath = $derived(
    getLinePathThroughPoint(pointA, bisectorAngle, 800),
  );
  const baExtendedPath = $derived(getLinePath(pointA, pointF));

  // --- Derived Dots (Angle Labels) ---
  const badDot = $derived(getAngleLabelPosition(pointB, pointA, pointD, 18));
  const cadDot = $derived(getAngleLabelPosition(pointC, pointA, pointD, 18));
  const verticalCadDot = $derived(
    getAngleLabelPosition(pointC, pointE, pointB, 18),
  );
  const verticalBadDot = $derived(
    getAngleLabelPosition(pointB, pointF, pointC, 18),
  );
  const abeDot = $derived(getAngleLabelPosition(pointA, pointB, pointE, 18));
  const acfDot = $derived(getAngleLabelPosition(pointA, pointC, pointF, 18));
  const eaxDot = $derived(getAngleLabelPosition(pointE, pointA, pointX, 18));
  const faxDot = $derived(getAngleLabelPosition(pointF, pointA, pointX, 18));

  // Animated dots
  const animatedBeaDot = $derived(
    interpolatePoint(cadDot, verticalCadDot, stepTwoProgress),
  );
  const animatedBfcDot = $derived(
    interpolatePoint(badDot, verticalBadDot, stepTwoProgress),
  );
  const animatedEaxDot = $derived(
    interpolatePoint(cadDot, eaxDot, stepTwoProgress),
  );
  const animatedFaxDot = $derived(
    interpolatePoint(badDot, faxDot, stepTwoProgress),
  );
  const animatedAbeDot = $derived(
    interpolatePoint(badDot, abeDot, stepTwoProgress),
  );
  const animatedAcfDot = $derived(
    interpolatePoint(cadDot, acfDot, stepTwoProgress),
  );

  // --- Effects ---
  $effect(() => {
    const currentSteps = steps;

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    if (currentSteps >= 2 && previousSteps === 1) {
      const startedAt = performance.now();
      stepTwoProgress = 0;

      const tick = (now: number) => {
        const linearProgress = Math.min(
          1,
          (now - startedAt) / stepTwoAnimationDuration,
        );

        stepTwoProgress = cubicOut(linearProgress);

        if (linearProgress < 1) {
          animationFrame = requestAnimationFrame(tick);
        } else {
          animationFrame = 0;
        }
      };

      animationFrame = requestAnimationFrame(tick);
    } else {
      stepTwoProgress = currentSteps >= 2 ? 1 : 0;
    }

    previousSteps = currentSteps;

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };
  });

  // --- Drag Behaviors ---
  function setupDragForPoint(update: (x: number, y: number) => void) {
    return (node: SVGCircleElement) => {
      const drag = d3.drag<SVGCircleElement, unknown>().on("drag", (event) => {
        update(event.x, event.y);
      });

      d3.select(node).call(drag);

      return {
        destroy() {
          d3.select(node).on(".drag", null);
        },
      };
    };
  }

  const dragA = setupDragForPoint((x, y) => {
    pointA = { x, y };
  });
  const dragB = setupDragForPoint((x, y) => {
    pointB = { x, y };
  });
  const dragC = setupDragForPoint((x, y) => {
    pointC = { x, y };
  });
</script>

<!-- UI Snippets -->
{#snippet dashedTriangle(d: string, fill: string, stroke: string)}
  <path
    {d}
    {fill}
    {stroke}
    stroke-width="2"
    stroke-dasharray="4 4"
    class="pointer-none"
  />
{/snippet}

{#snippet referenceLine(
  d: string,
  strokeWidth = "2.5",
  dashArray = "7 5",
  linecap?: "round",
  stroke = "#6b7280",
  opacity = "0.85",
)}
  <path
    {d}
    fill="none"
    {stroke}
    stroke-width={strokeWidth}
    stroke-dasharray={dashArray}
    stroke-linecap={linecap}
    {opacity}
    class="pointer-none"
  />
{/snippet}

{#snippet angleDot(point: Point)}
  <circle
    cx={point.x}
    cy={point.y}
    r="4.5"
    fill="#facc15"
    stroke="#111827"
    stroke-width="1.5"
    class="pointer-none"
  />
{/snippet}

{#snippet solidPoint(point: Point)}
  <circle cx={point.x} cy={point.y} r={6} fill="#111827" class="pointer-none" />
{/snippet}

{#snippet pointLabel(
  text: string,
  point: Point,
  fontSize = 16,
  dx = 14,
  dy = -8,
)}
  <text
    x={point.x + dx}
    y={point.y + dy}
    fill="#111827"
    font-size={fontSize}
    font-weight="700"
    text-anchor="start"
    dominant-baseline="middle"
    class="pointer-none"
  >
    {text}
  </text>
{/snippet}

<!-- Main Visualization -->
<WidgetContainer id="angle-bisector-proof-wrapper">
  <svg
    viewBox={`0 0 ${width} ${height}`}
    aria-label="Angle bisector theorem proof diagram"
  >
    <!-- Background Triangles -->
    {#if steps < 3}
      <path
        d={trianglePath}
        fill="rgba(59,130,246,0.08)"
        stroke="#2563eb"
        stroke-width="2"
      />
    {/if}

    {#if steps === 3}
      {@render dashedTriangle(
        aebTrianglePath,
        "rgba(250,204,21,0.18)",
        "#eab308",
      )}
      {@render dashedTriangle(
        afcTrianglePath,
        "rgba(202,138,4,0.18)",
        "#a16207",
      )}
    {/if}

    {#if steps >= 4}
      {@render dashedTriangle(
        adcTrianglePath,
        "rgba(21,128,61,0.18)",
        "#166534",
      )}
      {@render dashedTriangle(
        ebcTrianglePath,
        "rgba(74,222,128,0.16)",
        "#22c55e",
      )}
    {/if}

    <!-- Lines -->
    {#if steps < 1}
      <path
        d={bisectorPath}
        fill="none"
        stroke="#f59e0b"
        stroke-width="2.5"
        stroke-dasharray="6 4"
      />
    {/if}

    {#if steps >= 1}
      {@render referenceLine(parallelThroughBPath)}
      {@render referenceLine(parallelThroughCPath)}
      {@render referenceLine(extendedBisectorPath)}

      {#if steps === 3}
        {@render referenceLine(caExtendedPath, "2", "none", "round", "#eab308")}
        {@render referenceLine(acPath, "2", "none", "round", "#a16207", "1")}
      {:else if steps >= 4}
        {@render referenceLine(
          caExtendedPath,
          "2",
          "none",
          "round",
          "#eab308",
          "1",
        )}
        {@render referenceLine(abPath, "2", "2 4", "round", "#eab308")}
        {@render referenceLine(acPath, "2", "none", "round", "#a16207", "1")}
        {@render referenceLine(dbPath, "2", "none", "round", "#22c55e", "1")}
        {@render referenceLine(dcPath, "2", "none", "round", "#166534", "1")}
      {:else if steps !== 4}
        {@render referenceLine(caExtendedPath, "2", "2 4", "round")}
      {/if}

      {#if steps !== 3 && steps !== 4}
        {@render referenceLine(baExtendedPath, "2", "2 4", "round")}
      {/if}
    {/if}

    <!-- Interactive Points -->
    <circle
      use:dragA
      cx={pointA.x}
      cy={pointA.y}
      r={6}
      fill="#2563eb"
      class="cursor-grab"
    />
    <circle
      use:dragB
      cx={pointB.x}
      cy={pointB.y}
      r={6}
      fill="#16a34a"
      class="cursor-grab"
    />
    <circle
      use:dragC
      cx={pointC.x}
      cy={pointC.y}
      r={6}
      fill="#ef4444"
      class="cursor-grab"
    />

    <!-- Static Geometry Points -->
    {@render solidPoint(pointD)}

    {#if steps >= 1}
      {@render solidPoint(pointE)}
      {@render solidPoint(pointF)}
    {/if}

    <!-- Angle Dots -->
    <g class="pointer-none">
      {#if steps !== 3}
        {#if steps !== 4}
          {@render angleDot(badDot)}
        {/if}
        {@render angleDot(cadDot)}
      {/if}

      {#if steps >= 2}
        {#if steps !== 4}
          {@render angleDot(animatedBfcDot)}
        {/if}
        {@render angleDot(animatedBeaDot)}

        {#if steps < 3}
          {@render angleDot(animatedEaxDot)}
          {@render angleDot(animatedFaxDot)}
        {/if}

        {#if steps !== 4}
          {@render angleDot(animatedAbeDot)}
          {@render angleDot(animatedAcfDot)}
        {/if}
      {/if}
    </g>

    <!-- Text Labels -->
    {@render pointLabel("A", pointA)}
    {@render pointLabel("B", pointB)}
    {@render pointLabel("C", pointC)}
    {@render pointLabel("D", pointD, 14, 10, 12)}

    {#if steps >= 1}
      {@render pointLabel("E", pointE, 14, 10, -8)}
      {@render pointLabel("F", pointF, 14, 10, -8)}
    {/if}
  </svg>

  {#snippet controls()}
    <WidgetSliderController
      id={`${baseId}-steps`}
      label={`Step ${steps}`}
      min={0}
      max={4}
      step={1}
      bind:value={steps}
    />
  {/snippet}
</WidgetContainer>

<style>
  .cursor-grab {
    cursor: grab;
    touch-action: none;
  }

  .cursor-grab:active {
    cursor: grabbing;
  }

  .pointer-none {
    pointer-events: none;
  }
</style>
