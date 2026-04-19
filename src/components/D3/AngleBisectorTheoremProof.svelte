<svelte:options runes={true} />

<script lang="ts">
  import * as d3 from "d3";
  import type { Action } from "svelte/action";
  import { cubicOut } from "svelte/easing";
  import { Tween } from "svelte/motion";

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

  // SSR-safe unique ID generation fallback
  const baseId = `angle-bisector-proof-${
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  }`;

  // --- Svelte 5 Tween for Declarative Animations ---
  const stepTwoProgress = new Tween(steps >= 2 ? 1 : 0, {
    duration: 650,
    easing: cubicOut,
  });

  $effect(() => {
    stepTwoProgress.target = steps >= 2 ? 1 : 0;
  });

  // --- Theme & Styles ---
  const THEME = {
    points: { a: "#2563eb", b: "#16a34a", c: "#ef4444", default: "#111827" },
    dots: { fill: "#facc15", stroke: "#111827" },
    lines: {
      default: "#6b7280",
      bisector: "#f59e0b",
      caExtended: "#eab308",
      ac: "#a16207",
      ab: "#eab308",
      db: "#22c55e",
      dc: "#166534",
    },
    areas: {
      base: { fill: "rgba(59,130,246,0.08)", stroke: "#2563eb" },
      aeb: { fill: "rgba(250,204,21,0.18)", stroke: "#eab308" },
      afc: { fill: "rgba(202,138,4,0.18)", stroke: "#a16207" },
      adc: { fill: "rgba(21,128,61,0.18)", stroke: "#166534" },
      ebc: { fill: "rgba(74,222,128,0.16)", stroke: "#22c55e" },
    },
  };

  // --- Interactive Points ---
  let pointA = $state<Point>({ x: 128, y: 200 });
  let pointB = $state<Point>({ x: 86, y: 278 });
  let pointC = $state<Point>({ x: 296, y: 278 });

  // --- Generic D3 Drag Action ---
  const dragPoint: Action<SVGCircleElement, (p: Point) => void> = (
    node,
    onDrag,
  ) => {
    let currentDragFn = onDrag;

    const drag = d3.drag<SVGCircleElement, unknown>().on("drag", (event) => {
      currentDragFn({ x: event.x, y: event.y });
    });

    const selection = d3.select(node);

    // Cast to `unknown` first, then strictly type the function to expect
    // the exact `typeof selection` to satisfy both D3 and the linter perfectly.
    selection.call(drag as unknown as (s: typeof selection) => void);

    return {
      update(newDragFn) {
        currentDragFn = newDragFn;
      },
      destroy() {
        d3.select(node).on(".drag", null);
      },
    };
  };

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
  const angleBad = $derived(getAngleLabelPosition(pointB, pointA, pointD, 18));
  const angleCad = $derived(getAngleLabelPosition(pointC, pointA, pointD, 18));
  const angleVerticalCad = $derived(
    getAngleLabelPosition(pointC, pointE, pointB, 18),
  );
  const angleVerticalBad = $derived(
    getAngleLabelPosition(pointB, pointF, pointC, 18),
  );
  const angleAbe = $derived(getAngleLabelPosition(pointA, pointB, pointE, 18));
  const angleAcf = $derived(getAngleLabelPosition(pointA, pointC, pointF, 18));
  const angleEax = $derived(getAngleLabelPosition(pointE, pointA, pointX, 18));
  const angleFax = $derived(getAngleLabelPosition(pointF, pointA, pointX, 18));

  // Animated dots mapping progressively to their targets using the Svelte Tween
  const animatedBeaDot = $derived(
    interpolatePoint(angleCad, angleVerticalCad, stepTwoProgress.current),
  );
  const animatedBfcDot = $derived(
    interpolatePoint(angleBad, angleVerticalBad, stepTwoProgress.current),
  );
  const animatedEaxDot = $derived(
    interpolatePoint(angleCad, angleEax, stepTwoProgress.current),
  );
  const animatedFaxDot = $derived(
    interpolatePoint(angleBad, angleFax, stepTwoProgress.current),
  );
  const animatedAbeDot = $derived(
    interpolatePoint(angleBad, angleAbe, stepTwoProgress.current),
  );
  const animatedAcfDot = $derived(
    interpolatePoint(angleCad, angleAcf, stepTwoProgress.current),
  );

  // --- Pure Helpers ---
  function getBisectorIntersection(a: Point, b: Point, c: Point): Point {
    const dir = getAngleBisectorUnitVector(b, a, c);
    const sVec = { x: c.x - b.x, y: c.y - b.y };
    const q = { x: b.x - a.x, y: b.y - a.y };
    const cross = dir.x * sVec.y - dir.y * sVec.x;

    if (Math.abs(cross) < 1e-8) {
      const segLen2 = sVec.x * sVec.x + sVec.y * sVec.y || 1;
      const u0 = Math.max(
        0,
        Math.min(1, ((a.x - b.x) * sVec.x + (a.y - b.y) * sVec.y) / segLen2),
      );
      return { x: b.x + sVec.x * u0, y: b.y + sVec.y * u0 };
    }

    const t = (q.x * sVec.y - q.y * sVec.x) / cross;
    const u = (q.x * dir.y - q.y * dir.x) / cross;

    if (u >= 0 && u <= 1) return { x: a.x + t * dir.x, y: a.y + t * dir.y };

    const uClamped = Math.max(0, Math.min(1, u));
    return { x: b.x + sVec.x * uClamped, y: b.y + sVec.y * uClamped };
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

    const t = ((p2.x - p1.x) * v2.y - (p2.y - p1.y) * v2.x) / cross;
    return { x: p1.x + t * v1.x, y: p1.y + t * v1.y };
  }

  function interpolatePoint(from: Point, to: Point, progress: number): Point {
    return {
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
    };
  }
</script>

<!-- --- UI Snippets --- -->
{#snippet dashedTriangle(d: string, theme: { fill: string; stroke: string })}
  <path
    {d}
    fill={theme.fill}
    stroke={theme.stroke}
    stroke-width="2"
    stroke-dasharray="5 7"
    stroke-linecap="round"
    class="pointer-none"
  />
{/snippet}

{#snippet referenceLine(
  d: string,
  options: {
    strokeWidth?: string;
    dashArray?: string;
    linecap?: "round" | "butt" | "square";
    stroke?: string;
    opacity?: string;
  } = {},
)}
  <path
    {d}
    fill="none"
    stroke={options.stroke ?? THEME.lines.default}
    stroke-width={options.strokeWidth ?? "2.5"}
    stroke-dasharray={options.dashArray ?? "5 7"}
    stroke-linecap={options.linecap ?? "round"}
    opacity={options.opacity ?? "0.85"}
    class="pointer-none"
  />
{/snippet}

{#snippet angleDot(point: Point)}
  <circle
    cx={point.x}
    cy={point.y}
    r="4.5"
    fill={THEME.dots.fill}
    stroke={THEME.dots.stroke}
    stroke-width="1.5"
    class="pointer-none"
  />
{/snippet}

{#snippet solidPoint(point: Point)}
  <circle
    cx={point.x}
    cy={point.y}
    r="6"
    fill={THEME.points.default}
    class="pointer-none"
  />
{/snippet}

{#snippet pointLabel(
  text: string,
  point: Point,
  options: { fontSize?: number; dx?: number; dy?: number } = {},
)}
  <text
    x={point.x + (options.dx ?? 14)}
    y={point.y + (options.dy ?? -8)}
    fill={THEME.points.default}
    font-size={options.fontSize ?? 16}
    font-weight="700"
    text-anchor="start"
    dominant-baseline="middle"
    class="pointer-none"
  >
    {text}
  </text>
{/snippet}

<!-- --- Main Visualization --- -->
<WidgetContainer id="angle-bisector-proof-wrapper">
  <svg
    viewBox={`0 0 ${width} ${height}`}
    role="img"
    aria-label="Angle bisector theorem proof diagram"
  >
    <!-- Background Triangles -->
    {#if steps < 3}
      <path
        d={trianglePath}
        fill={THEME.areas.base.fill}
        stroke={THEME.areas.base.stroke}
        stroke-width="2"
      />
    {/if}

    {#if steps === 3}
      {@render dashedTriangle(aebTrianglePath, THEME.areas.aeb)}
      {@render dashedTriangle(afcTrianglePath, THEME.areas.afc)}
    {/if}

    {#if steps >= 4}
      {@render dashedTriangle(adcTrianglePath, THEME.areas.adc)}
      {@render dashedTriangle(ebcTrianglePath, THEME.areas.ebc)}
    {/if}

    <!-- Lines -->
    {#if steps < 1}
      {@render referenceLine(bisectorPath, {
        stroke: THEME.lines.bisector,
        dashArray: "5 7",
      })}
    {/if}

    {#if steps >= 1}
      {@render referenceLine(parallelThroughBPath)}
      {@render referenceLine(parallelThroughCPath)}
      {@render referenceLine(extendedBisectorPath)}

      {#if steps === 1 || steps === 2}
        {@render referenceLine(caExtendedPath, {
          strokeWidth: "2",
        })}
        {@render referenceLine(baExtendedPath, {
          strokeWidth: "2",
        })}
      {:else if steps === 3}
        {@render referenceLine(caExtendedPath, {
          strokeWidth: "2",
          dashArray: "none",
          stroke: THEME.lines.caExtended,
        })}
        {@render referenceLine(acPath, {
          strokeWidth: "2",
          dashArray: "none",
          stroke: THEME.lines.ac,
          opacity: "1",
        })}
      {:else if steps >= 4}
        {@render referenceLine(caExtendedPath, {
          strokeWidth: "2",
          dashArray: "none",
          stroke: THEME.lines.caExtended,
          opacity: "1",
        })}
        {@render referenceLine(abPath, {
          strokeWidth: "2",
          stroke: THEME.lines.ab,
        })}
        {@render referenceLine(acPath, {
          strokeWidth: "2",
          dashArray: "none",
          stroke: THEME.lines.ac,
          opacity: "1",
        })}
        {@render referenceLine(dbPath, {
          strokeWidth: "2",
          dashArray: "none",
          stroke: THEME.lines.db,
          opacity: "1",
        })}
        {@render referenceLine(dcPath, {
          strokeWidth: "2",
          dashArray: "none",
          stroke: THEME.lines.dc,
          opacity: "1",
        })}
      {/if}
    {/if}

    <!-- Interactive Points -->
    <circle
      use:dragPoint={(p) => (pointA = p)}
      cx={pointA.x}
      cy={pointA.y}
      r="6"
      fill={THEME.points.a}
      class="cursor-grab"
    />
    <circle
      use:dragPoint={(p) => (pointB = p)}
      cx={pointB.x}
      cy={pointB.y}
      r="6"
      fill={THEME.points.b}
      class="cursor-grab"
    />
    <circle
      use:dragPoint={(p) => (pointC = p)}
      cx={pointC.x}
      cy={pointC.y}
      r="6"
      fill={THEME.points.c}
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
      {#if steps < 3 || steps === 4}
        {@render angleDot(angleCad)}
      {/if}

      {#if steps < 4 && steps !== 3}
        {@render angleDot(angleBad)}
      {/if}

      {#if steps >= 2}
        {@render angleDot(animatedBeaDot)}

        {#if steps < 3}
          {@render angleDot(animatedEaxDot)}
          {@render angleDot(animatedFaxDot)}
        {/if}

        {#if steps < 4}
          {@render angleDot(animatedBfcDot)}
          {@render angleDot(animatedAbeDot)}
          {@render angleDot(animatedAcfDot)}
        {/if}
      {/if}
    </g>

    <!-- Text Labels -->
    {@render pointLabel("A", pointA)}
    {@render pointLabel("B", pointB)}
    {@render pointLabel("C", pointC)}
    {@render pointLabel("D", pointD, { fontSize: 14, dx: 10, dy: 12 })}

    {#if steps >= 1}
      {@render pointLabel("E", pointE, { fontSize: 14, dx: 10, dy: -8 })}
      {@render pointLabel("F", pointF, { fontSize: 14, dx: 10, dy: -8 })}
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
