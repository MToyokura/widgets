<svelte:options runes={true} />

<script lang="ts">
  import * as d3 from "d3";
  import WidgetContainer from "../WidgetContainer.svelte";
  import {
    getAngleArcPath,
    getAngleDegrees,
    getAngleLabelPosition,
    getCircleArcPathExcludingAngle,
    getInscribedLinesPath,
    getPointOnCircle,
    getPointerAngle,
  } from "./functions/geometry";

  const width = 400;
  const height = 400;
  const radius = 150;
  const cx = width / 2;
  const cy = height / 2;
  const center = { x: cx, y: cy };

  let angleA = $state((3 * Math.PI) / 4);
  let angleB = $state(Math.PI / 4);
  let angleC = $state(-Math.PI / 2);
  let isDragging = $state(false);

  const pointA = $derived(getPointOnCircle(center, radius, angleA));
  const pointB = $derived(getPointOnCircle(center, radius, angleB));
  const pointC = $derived(getPointOnCircle(center, radius, angleC));
  const highlightedArcPath = $derived(
    getCircleArcPathExcludingAngle(center, radius, angleA, angleB, angleC),
  );
  const linesPath = $derived(getInscribedLinesPath(pointA, pointB, pointC));
  const angleMarkerPath = $derived(getAngleArcPath(pointA, pointC, pointB));
  const angleLabelPosition = $derived(
    getAngleLabelPosition(pointA, pointC, pointB),
  );
  const angleDegrees = $derived(getAngleDegrees(pointA, pointC, pointB));
  const angleText = $derived(formatAngle(angleDegrees));
  const cursor = $derived(isDragging ? "grabbing" : "grab");

  function formatAngle(angle: number) {
    const roundedAngle = Math.round(angle * 10) / 10;

    return Number.isInteger(roundedAngle)
      ? `${roundedAngle.toFixed(0)}°`
      : `${roundedAngle.toFixed(1)}°`;
  }

  function createAngleDrag(updateAngle: (angle: number) => void) {
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

  const dragHandleA = createAngleDrag((angle) => {
    angleA = angle;
  });

  const dragHandleB = createAngleDrag((angle) => {
    angleB = angle;
  });

  const dragHandleC = createAngleDrag((angle) => {
    angleC = angle;
  });
</script>

<WidgetContainer id="inscribed-angle-wrapper">
  <svg viewBox={`0 0 ${width} ${height}`} aria-label="Inscribed angle diagram">
    <circle {cx} {cy} r={radius} fill="none" stroke="#888" stroke-width="2" />
    <path
      d={highlightedArcPath}
      fill="none"
      stroke="#f59e0b"
      stroke-width="5"
      stroke-linecap="round"
      opacity="0.85"
      style="pointer-events: none;"
    />
    <path
      d={linesPath}
      fill="none"
      stroke="#3498db"
      stroke-width="2.5"
      style="pointer-events: none;"
    />
    <path
      d={angleMarkerPath}
      fill="none"
      stroke="#1f2937"
      stroke-width="5"
      stroke-linecap="round"
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
    <circle
      use:dragHandleA
      cx={pointA.x}
      cy={pointA.y}
      r={10}
      fill="#2563eb"
      style:cursor
      style="touch-action: none;"
    />
    <circle
      use:dragHandleB
      cx={pointB.x}
      cy={pointB.y}
      r={10}
      fill="#2563eb"
      style:cursor
      style="touch-action: none;"
    />
    <circle
      use:dragHandleC
      cx={pointC.x}
      cy={pointC.y}
      r={10}
      fill="#e74c3c"
      style:cursor
      style="touch-action: none;"
    />
  </svg>
</WidgetContainer>
