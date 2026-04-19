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

  let pointA = $state<Point>({ x: 128, y: 200 });
  let pointB = $state<Point>({ x: 86, y: 278 });
  let pointC = $state<Point>({ x: 296, y: 278 });

  const trianglePath = $derived(getTrianglePath(pointA, pointC, pointB));

  function getBisectorIntersection(a: Point, b: Point, c: Point) {
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

  const pointD = $derived(getBisectorIntersection(pointA, pointC, pointB));
  const bisectorPath = $derived(getLinePath(pointA, pointD));
  const bisectorAngle = $derived(
    Math.atan2(pointD.y - pointA.y, pointD.x - pointA.x),
  );
  const parallelThroughBPath = $derived(
    getLinePathThroughPoint(pointB, bisectorAngle, 600),
  );
  const parallelThroughCPath = $derived(
    getLinePathThroughPoint(pointC, bisectorAngle, 600),
  );
  const badDot = $derived(getAngleLabelPosition(pointB, pointA, pointD, 18));
  const cadDot = $derived(getAngleLabelPosition(pointC, pointA, pointD, 18));

  function getLinesIntersection(
    p1: Point,
    angle1: number,
    p2: Point,
    angle2: number,
  ) {
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

  const caAngle = $derived(
    Math.atan2(pointA.y - pointC.y, pointA.x - pointC.x),
  );
  const pointE = $derived(
    getLinesIntersection(pointC, caAngle, pointB, bisectorAngle),
  );
  const aebTrianglePath = $derived(getTrianglePath(pointA, pointE, pointB));
  const adcTrianglePath = $derived(getTrianglePath(pointA, pointC, pointD));
  const ebcTrianglePath = $derived(getTrianglePath(pointE, pointC, pointB));
  const caExtendedPath = $derived(getLinePath(pointA, pointE));
  const extendedBisectorPath = $derived(
    getLinePathThroughPoint(pointA, bisectorAngle, 800),
  );
  const baAngle = $derived(
    Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x),
  );
  const pointF = $derived(
    getLinesIntersection(pointB, baAngle, pointC, bisectorAngle),
  );
  const afcTrianglePath = $derived(getTrianglePath(pointA, pointF, pointC));
  const baExtendedPath = $derived(getLinePath(pointA, pointF));

  const verticalCadDot = $derived(
    getAngleLabelPosition(pointC, pointE, pointB, 18),
  );
  const verticalBadDot = $derived(
    getAngleLabelPosition(pointB, pointF, pointC, 18),
  );
  const abeDot = $derived(getAngleLabelPosition(pointA, pointB, pointE, 18));
  const acfDot = $derived(getAngleLabelPosition(pointA, pointC, pointF, 18));

  const efAngle = $derived(
    Math.atan2(pointF.y - pointE.y, pointF.x - pointE.x),
  );
  const pointX = $derived(
    getLinesIntersection(pointE, efAngle, pointA, bisectorAngle),
  );
  const eaxDot = $derived(getAngleLabelPosition(pointE, pointA, pointX, 18));
  const faxDot = $derived(getAngleLabelPosition(pointF, pointA, pointX, 18));

  function interpolatePoint(from: Point, to: Point, progress: number): Point {
    return {
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
    };
  }

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

<WidgetContainer id="angle-bisector-proof-wrapper">
  <svg
    viewBox={`0 0 ${width} ${height}`}
    aria-label="Angle bisector theorem proof diagram"
  >
    {#if steps < 3}
      <path
        d={trianglePath}
        fill="rgba(59,130,246,0.08)"
        stroke="#2563eb"
        stroke-width="2"
      />
    {/if}

    {#if steps === 3}
      <path
        d={aebTrianglePath}
        fill="rgba(59,130,246,0.14)"
        stroke="#2563eb"
        stroke-width="2"
        stroke-dasharray="4 4"
        style="pointer-events: none;"
      />

      <path
        d={afcTrianglePath}
        fill="rgba(239,68,68,0.14)"
        stroke="#ef4444"
        stroke-width="2"
        stroke-dasharray="4 4"
        style="pointer-events: none;"
      />
    {/if}

    {#if steps >= 4}
      <path
        d={adcTrianglePath}
        fill="rgba(34,197,94,0.14)"
        stroke="#16a34a"
        stroke-width="2"
        stroke-dasharray="4 4"
        style="pointer-events: none;"
      />

      <path
        d={ebcTrianglePath}
        fill="rgba(245,158,11,0.16)"
        stroke="#f59e0b"
        stroke-width="2"
        stroke-dasharray="4 4"
        style="pointer-events: none;"
      />
    {/if}

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
      <path
        d={parallelThroughBPath}
        fill="none"
        stroke="#6b7280"
        stroke-width="2.5"
        stroke-dasharray="7 5"
        opacity="0.85"
        style="pointer-events: none;"
      />

      <path
        d={parallelThroughCPath}
        fill="none"
        stroke="#6b7280"
        stroke-width="2.5"
        stroke-dasharray="7 5"
        opacity="0.85"
        style="pointer-events: none;"
      />

      <path
        d={extendedBisectorPath}
        fill="none"
        stroke="#6b7280"
        stroke-width="2.5"
        stroke-dasharray="7 5"
        opacity="0.85"
        style="pointer-events: none;"
      />

      {#if steps !== 3}
        <path
          d={caExtendedPath}
          fill="none"
          stroke="#6b7280"
          stroke-width="2"
          stroke-dasharray="2 4"
          stroke-linecap="round"
          opacity="0.85"
          style="pointer-events: none;"
        />

        <path
          d={baExtendedPath}
          fill="none"
          stroke="#6b7280"
          stroke-width="2"
          stroke-dasharray="2 4"
          stroke-linecap="round"
          opacity="0.85"
          style="pointer-events: none;"
        />
      {/if}
    {/if}

    <circle
      use:dragA
      cx={pointA.x}
      cy={pointA.y}
      r={6}
      fill="#2563eb"
      class="cursor-grab"
      style="touch-action: none;"
    />
    <circle
      use:dragB
      cx={pointB.x}
      cy={pointB.y}
      r={6}
      fill="#16a34a"
      class="cursor-grab"
      style="touch-action: none;"
    />
    <circle
      use:dragC
      cx={pointC.x}
      cy={pointC.y}
      r={6}
      fill="#ef4444"
      class="cursor-grab"
      style="touch-action: none;"
    />

    <circle
      cx={pointD.x}
      cy={pointD.y}
      r={6}
      fill="#111827"
      style="pointer-events: none;"
    />

    {#if steps !== 3}
      <g style="pointer-events: none;">
        {#if steps !== 4}
          <circle
            cx={badDot.x}
            cy={badDot.y}
            r="4.5"
            fill="#facc15"
            stroke="#111827"
            stroke-width="1.5"
          />
        {/if}

        <circle
          cx={cadDot.x}
          cy={cadDot.y}
          r="4.5"
          fill="#facc15"
          stroke="#111827"
          stroke-width="1.5"
        />
      </g>
    {/if}

    {#if steps >= 2}
      <g style="pointer-events: none;">
        <circle
          cx={animatedBfcDot.x}
          cy={animatedBfcDot.y}
          r="4.5"
          fill="#facc15"
          stroke="#111827"
          stroke-width="1.5"
        />

        <circle
          cx={animatedBeaDot.x}
          cy={animatedBeaDot.y}
          r="4.5"
          fill="#facc15"
          stroke="#111827"
          stroke-width="1.5"
        />
      </g>

      <g style="pointer-events: none;">
        {#if steps < 3}
          <circle
            cx={animatedEaxDot.x}
            cy={animatedEaxDot.y}
            r="4.5"
            fill="#facc15"
            stroke="#111827"
            stroke-width="1.5"
          />

          <circle
            cx={animatedFaxDot.x}
            cy={animatedFaxDot.y}
            r="4.5"
            fill="#facc15"
            stroke="#111827"
            stroke-width="1.5"
          />
        {/if}

        {#if steps !== 4}
          <circle
            cx={animatedAbeDot.x}
            cy={animatedAbeDot.y}
            r="4.5"
            fill="#facc15"
            stroke="#111827"
            stroke-width="1.5"
          />
        {/if}

        {#if steps !== 4}
          <circle
            cx={animatedAcfDot.x}
            cy={animatedAcfDot.y}
            r="4.5"
            fill="#facc15"
            stroke="#111827"
            stroke-width="1.5"
          />
        {/if}
      </g>
    {/if}

    <text
      x={pointA.x + 14}
      y={pointA.y - 8}
      fill="#111827"
      font-size="16"
      font-weight="700"
      text-anchor="start"
      dominant-baseline="middle"
    >
      A
    </text>
    <text
      x={pointB.x + 14}
      y={pointB.y - 8}
      fill="#111827"
      font-size="16"
      font-weight="700"
      text-anchor="start"
      dominant-baseline="middle"
    >
      B
    </text>
    <text
      x={pointC.x + 14}
      y={pointC.y - 8}
      fill="#111827"
      font-size="16"
      font-weight="700"
      text-anchor="start"
      dominant-baseline="middle"
    >
      C
    </text>
    <text
      x={pointD.x + 10}
      y={pointD.y + 12}
      fill="#111827"
      font-size="14"
      font-weight="700"
      text-anchor="start"
      dominant-baseline="middle"
    >
      D
    </text>

    {#if steps >= 1}
      <circle
        cx={pointE.x}
        cy={pointE.y}
        r={6}
        fill="#111827"
        style="pointer-events: none;"
      />

      <text
        x={pointE.x + 10}
        y={pointE.y - 8}
        fill="#111827"
        font-size="14"
        font-weight="700"
        text-anchor="start"
        dominant-baseline="middle"
      >
        E
      </text>

      <circle
        cx={pointF.x}
        cy={pointF.y}
        r={6}
        fill="#111827"
        style="pointer-events: none;"
      />

      <text
        x={pointF.x + 10}
        y={pointF.y - 8}
        fill="#111827"
        font-size="14"
        font-weight="700"
        text-anchor="start"
        dominant-baseline="middle"
      >
        F
      </text>
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
  }

  .cursor-grab:active {
    cursor: grabbing;
  }
</style>
