<svelte:options runes={true} />

<script lang="ts">
  import * as d3 from "d3";
  import WidgetContainer from "../WidgetContainer.svelte";
  import {
    getAngleBisectorUnitVector,
    getAngleLabelPosition,
    getLinePath,
    getTrianglePath,
    type Point,
  } from "./functions/geometry";

  const width = 400;
  const height = 400;

  let pointA = $state<Point>({ x: 110, y: 80 });
  let pointB = $state<Point>({ x: 50, y: 300 });
  let pointC = $state<Point>({ x: 350, y: 300 });

  const trianglePath = $derived(getTrianglePath(pointA, pointC, pointB));

  function getBisectorIntersection(a: Point, b: Point, c: Point) {
    const dir = getAngleBisectorUnitVector(b, a, c);

    const s = b;
    const e = c;
    const sVec = { x: e.x - s.x, y: e.y - s.y };
    const q = { x: s.x - a.x, y: s.y - a.y };

    const cross = dir.x * sVec.y - dir.y * sVec.x;

    if (Math.abs(cross) < 1e-8) {
      // Nearly parallel: fallback to closest point on BC
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

  const badDot = $derived(getAngleLabelPosition(pointB, pointA, pointD, 18));
  const cadDot = $derived(getAngleLabelPosition(pointC, pointA, pointD, 18));

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

<WidgetContainer id="angle-bisector-wrapper">
  <svg viewBox={`0 0 ${width} ${height}`} aria-label="Angle bisector theorem">
    <path
      d={trianglePath}
      fill="rgba(59,130,246,0.08)"
      stroke="#2563eb"
      stroke-width="2"
    />

    <path
      d={bisectorPath}
      fill="none"
      stroke="#f59e0b"
      stroke-width="2.5"
      stroke-dasharray="6 4"
    />

    <!-- Points -->
    <circle
      use:dragA
      cx={pointA.x}
      cy={pointA.y}
      r={10}
      fill="#2563eb"
      class="cursor-grab"
      style="touch-action: none;"
    />
    <circle
      use:dragB
      cx={pointB.x}
      cy={pointB.y}
      r={10}
      fill="#16a34a"
      class="cursor-grab"
      style="touch-action: none;"
    />
    <circle
      use:dragC
      cx={pointC.x}
      cy={pointC.y}
      r={10}
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

    <!-- Angle markers (CAD & BAD) -->
    <g style="pointer-events: none;">
      <circle
        cx={badDot.x}
        cy={badDot.y}
        r="4.5"
        fill="#facc15"
        stroke="#111827"
        stroke-width="1.5"
      />

      <circle
        cx={cadDot.x}
        cy={cadDot.y}
        r="4.5"
        fill="#facc15"
        stroke="#111827"
        stroke-width="1.5"
      />
    </g>

    <!-- Labels -->
    <text
      x={pointA.x + 14}
      y={pointA.y - 8}
      fill="#111827"
      font-size="16"
      font-weight="700"
      text-anchor="start"
      dominant-baseline="middle">A</text
    >
    <text
      x={pointB.x + 14}
      y={pointB.y - 8}
      fill="#111827"
      font-size="16"
      font-weight="700"
      text-anchor="start"
      dominant-baseline="middle">B</text
    >
    <text
      x={pointC.x + 14}
      y={pointC.y - 8}
      fill="#111827"
      font-size="16"
      font-weight="700"
      text-anchor="start"
      dominant-baseline="middle">C</text
    >
    <text
      x={pointD.x + 10}
      y={pointD.y + 12}
      fill="#111827"
      font-size="14"
      font-weight="700"
      text-anchor="start"
      dominant-baseline="middle">D</text
    >
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
