<svelte:options runes={true} />

<script lang="ts">
  import * as d3 from "d3";
  import WidgetContainer from "../WidgetContainer.svelte";
  import {
    getAngleArcPath,
    getAngleDegrees,
    getAngleLabelPosition,
    getCentralAngleArcPath,
    getCentralAngleDegrees,
    getCentralAngleLabelPosition,
    getCentralLinesPath,
    getCircleArcPathExcludingAngle,
    getInscribedLinesPath,
    getPointOnCircle,
    getPointerAngle,
    getSignedMinorAngleDelta,
  } from "./functions/geometry";

  const width = 400;
  const height = 400;
  const radius = 150;
  const cx = width / 2;
  const cy = height / 2;
  const center = { x: cx, y: cy };
  const initialAngleA = (3 * Math.PI) / 4;
  const initialAngleB = Math.PI / 4;
  const initialAngleC =
    initialAngleA +
    getSignedMinorAngleDelta(initialAngleA, initialAngleB) / 2 +
    Math.PI;

  let angleA = $state(initialAngleA);
  let angleB = $state(initialAngleB);
  let angleC = $state(initialAngleC);
  let isDragging = $state(false);

  const pointA = $derived(getPointOnCircle(center, radius, angleA));
  const pointB = $derived(getPointOnCircle(center, radius, angleB));
  const pointC = $derived(getPointOnCircle(center, radius, angleC));
  const highlightedArcPath = $derived(
    getCircleArcPathExcludingAngle(center, radius, angleA, angleB, angleC),
  );
  const sectorPath = $derived(getCentralLinesPath(pointA, center, pointB));
  const inscribedLinesPath = $derived(
    getInscribedLinesPath(pointA, pointB, pointC),
  );
  const centralAngleMarkerPath = $derived(
    getCentralAngleArcPath(center, angleA, angleB, angleC),
  );
  const inscribedAngleMarkerPath = $derived(
    getAngleArcPath(pointA, pointC, pointB),
  );
  const centralAngleDegrees = $derived(
    getCentralAngleDegrees(angleA, angleB, angleC),
  );
  const inscribedAngleDegrees = $derived(
    getAngleDegrees(pointA, pointC, pointB),
  );
  const centralAngleLabelPosition = $derived(
    getCentralAngleLabelPosition(center, angleA, angleB, angleC),
  );
  const inscribedAngleLabelPosition = $derived(
    getAngleLabelPosition(pointA, pointC, pointB, 36),
  );
  const centralAngleText = $derived(formatAngle(centralAngleDegrees));
  const inscribedAngleText = $derived(formatAngle(inscribedAngleDegrees));
  const relationText = $derived(
    `${centralAngleText} = 2 x ${inscribedAngleText}`,
  );
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

<WidgetContainer id="central-angle-wrapper">
  <svg viewBox={`0 0 ${width} ${height}`} aria-label="Central angle diagram">
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
      d={sectorPath}
      fill="none"
      stroke="#3498db"
      stroke-width="2.5"
      style="pointer-events: none;"
    />
    <path
      d={inscribedLinesPath}
      fill="none"
      stroke="#16a34a"
      stroke-width="2.5"
      stroke-dasharray="6 4"
      opacity="0.9"
      style="pointer-events: none;"
    />
    <path
      d={centralAngleMarkerPath}
      fill="none"
      stroke="#1f2937"
      stroke-width="5"
      stroke-linecap="round"
      style="pointer-events: none;"
    />
    <path
      d={inscribedAngleMarkerPath}
      fill="none"
      stroke="#15803d"
      stroke-width="5"
      stroke-linecap="round"
      style="pointer-events: none;"
    />
    <text
      x={centralAngleLabelPosition.x}
      y={centralAngleLabelPosition.y}
      fill="#111827"
      font-size="16"
      font-weight="700"
      text-anchor="middle"
      dominant-baseline="middle"
      style="pointer-events: none; user-select: none;"
    >
      {centralAngleText}
    </text>
    <text
      x={inscribedAngleLabelPosition.x}
      y={inscribedAngleLabelPosition.y}
      fill="#15803d"
      font-size="15"
      font-weight="700"
      text-anchor="middle"
      dominant-baseline="middle"
      style="pointer-events: none; user-select: none;"
    >
      {inscribedAngleText}
    </text>
    <text
      x={cx}
      y={height - 18}
      fill="#92400e"
      font-size="14"
      font-weight="700"
      text-anchor="middle"
      style="pointer-events: none; user-select: none;"
    >
      {relationText}
    </text>
    <circle {cx} {cy} r={7} fill="#e74c3c" />
    <circle
      use:dragHandleC
      cx={pointC.x}
      cy={pointC.y}
      r={7}
      fill="#16a34a"
      style="touch-action: none; cursor: {cursor};"
    />
    <circle
      use:dragHandleA
      cx={pointA.x}
      cy={pointA.y}
      r={10}
      fill="#2563eb"
      style="touch-action: none; cursor: {cursor};"
    />
    <circle
      use:dragHandleB
      cx={pointB.x}
      cy={pointB.y}
      r={10}
      fill="#2563eb"
      style="touch-action: none; cursor: {cursor};"
    />
  </svg>
</WidgetContainer>
