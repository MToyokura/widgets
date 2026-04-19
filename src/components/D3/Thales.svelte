<svelte:options runes={true} />

<script lang="ts">
  import * as d3 from "d3";
  import WidgetContainer from "../WidgetContainer.svelte";
  import {
    getAngleDegrees,
    getAngleLabelPosition,
    getPointOnCircle,
    getPointerAngle,
    getRightAnglePath,
    getTrianglePath,
  } from "./functions/geometry";

  const width = 400;
  const height = 400;
  const radius = 150;
  const cx = width / 2;
  const cy = height / 2;
  const center = { x: cx, y: cy };

  let diameterAngle = $state(0);
  let vertexAngle = $state(-Math.PI / 2);
  let isDragging = $state(false);

  const startPoint = $derived(
    getPointOnCircle(center, radius, diameterAngle + Math.PI),
  );
  const endPoint = $derived(getPointOnCircle(center, radius, diameterAngle));
  const vertexPoint = $derived(getPointOnCircle(center, radius, vertexAngle));
  const trianglePath = $derived(
    getTrianglePath(startPoint, endPoint, vertexPoint),
  );
  const rightAnglePath = $derived(
    getRightAnglePath(startPoint, endPoint, vertexPoint),
  );
  const angleLabelPosition = $derived(
    getAngleLabelPosition(startPoint, vertexPoint, endPoint),
  );
  const angleDegrees = $derived(
    getAngleDegrees(startPoint, vertexPoint, endPoint),
  );
  const angleText = $derived(formatAngle(angleDegrees));
  const cursor = $derived(isDragging ? "grabbing" : "grab");

  function formatAngle(angle: number) {
    const roundedAngle = Math.round(angle * 10) / 10;

    return Number.isInteger(roundedAngle)
      ? `${roundedAngle.toFixed(0)}°`
      : `${roundedAngle.toFixed(1)}°`;
  }

  function createDrag(updateAngle: (angle: number) => void) {
    return (node: SVGCircleElement) => {
      const drag = d3
        .drag<SVGCircleElement, unknown>()
        .on("start", () => {
          isDragging = true;
        })
        .on("drag", (event) => {
          updateAngle(getPointerAngle({ x: event.x, y: event.y }, center));
        })
        .on("end", () => {
          isDragging = false;
        });

      d3.select(node).call(drag);

      return {
        destroy() {
          d3.select(node).on(".drag", null);
        },
      };
    };
  }

  const dragStartHandle = createDrag((angle) => {
    diameterAngle = angle - Math.PI;
  });

  const dragEndHandle = createDrag((angle) => {
    diameterAngle = angle;
  });

  const dragVertexHandle = createDrag((angle) => {
    vertexAngle = angle;
  });
</script>

<WidgetContainer id="thales-wrapper">
  <svg viewBox={`0 0 ${width} ${height}`} aria-label="Thales diagram">
    <circle {cx} {cy} r={radius} fill="none" stroke="#888" stroke-width="2" />
    <line
      x1={startPoint.x}
      y1={startPoint.y}
      x2={endPoint.x}
      y2={endPoint.y}
      stroke="#666"
      stroke-dasharray="4"
      stroke-width="2.5"
      stroke-linecap="round"
    />
    <path
      d={trianglePath}
      fill="rgba(52, 152, 219, 0.3)"
      stroke="#3498db"
      stroke-width="2.5"
    />
    <path
      d={rightAnglePath}
      fill="none"
      stroke="#1f2937"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      style="pointer-events: none;"
    />
    <text
      x={angleLabelPosition.x}
      y={angleLabelPosition.y}
      fill="#111827"
      font-size="16"
      font-weight="700"
      text-anchor="middle"
      dominant-baseline="middle"
      style="pointer-events: none; user-select: none;"
    >
      {angleText}
    </text>
    <circle {cx} {cy} r={4} fill="#111827" style="pointer-events: none;" />
    <circle
      use:dragStartHandle
      cx={startPoint.x}
      cy={startPoint.y}
      r={10}
      fill="#2563eb"
      class="cursor-grab"
      style="touch-action: none;"
    />
    <circle
      use:dragEndHandle
      cx={endPoint.x}
      cy={endPoint.y}
      r={10}
      fill="#2563eb"
      class="cursor-grab"
      style="touch-action: none;"
    />
    <circle
      use:dragVertexHandle
      cx={vertexPoint.x}
      cy={vertexPoint.y}
      r={10}
      fill="#e74c3c"
      class="cursor-grab"
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
