<svelte:options runes={true} />

<script lang="ts">
  import * as d3 from "d3";
  import WidgetContainer from "../WidgetContainer.svelte";
  import {
    getAngleArcPath,
    getAngleDegrees,
    getAngleLabelPosition,
    getCircleArcPath,
    getDoubleAngleDotPositions,
    getLinePath,
    getOppositePoint,
    getPointOnCircle,
    getPointerAngle,
    getRadialLabelPosition,
    getTrianglePath,
  } from "./functions/geometry";

  const width = 400;
  const height = 400;
  const radius = 150;
  const cx = width / 2;
  const cy = height / 2;
  const center = { x: cx, y: cy };
  const degenerateAngleThresholdDegrees = 0.5;
  const insetAngleIndicatorCenter = { x: width - 54, y: height - 54 };
  const insetAngleIndicatorRadius = 30;
  const insetAngleIndicatorLayoutRadius = 34;
  const insetAngleIndicatorDotSpacing = 6;
  const insetAngleIndicatorDotGroupOffset =
    insetAngleIndicatorLayoutRadius * 0.5;
  const insetSplitPath = getLinePath(
    {
      x: insetAngleIndicatorCenter.x,
      y: insetAngleIndicatorCenter.y - insetAngleIndicatorRadius,
    },
    {
      x: insetAngleIndicatorCenter.x,
      y: insetAngleIndicatorCenter.y + insetAngleIndicatorRadius,
    },
  );

  let angleA = $state((3 * Math.PI) / 4);
  let angleB = $state(Math.PI / 4);
  let angleC = $state(-Math.PI / 2);
  let isDragging = $state(false);

  const pointA = $derived(getPointOnCircle(center, radius, angleA));
  const pointB = $derived(getPointOnCircle(center, radius, angleB));
  const pointC = $derived(getPointOnCircle(center, radius, angleC));
  const pointD = $derived(getOppositePoint(pointC, center));
  const diameterPath = $derived(getLinePath(pointC, pointD));
  const showAcoGroup = $derived(
    getAngleDegrees(pointA, pointC, pointD) > degenerateAngleThresholdDegrees,
  );
  const showBcoGroup = $derived(
    getAngleDegrees(pointB, pointC, pointD) > degenerateAngleThresholdDegrees,
  );
  const acoTrianglePath = $derived(getTrianglePath(pointA, pointC, center));
  const bcoTrianglePath = $derived(getTrianglePath(pointB, pointC, center));
  const aodArcPath = $derived(getAngleArcPath(pointA, center, pointD, 38));
  const bodArcPath = $derived(getAngleArcPath(pointB, center, pointD, 30));
  const acoDot = $derived(getAngleLabelPosition(pointA, pointC, center, 18));
  const caoDot = $derived(getAngleLabelPosition(pointC, pointA, center, 18));
  const aodDots = $derived(getDoubleAngleDotPositions(pointA, center, pointD));
  const bcoDot = $derived(getAngleLabelPosition(pointB, pointC, center, 18));
  const cboDot = $derived(getAngleLabelPosition(pointC, pointB, center, 18));
  const bodDots = $derived(getDoubleAngleDotPositions(pointB, center, pointD));
  const aodIndicator = $derived(
    getInsetAngleIndicatorPaths(
      getAngleDegrees(pointA, center, pointD),
      "left",
    ),
  );
  const bodIndicator = $derived(
    getInsetAngleIndicatorPaths(
      getAngleDegrees(pointB, center, pointD),
      "right",
    ),
  );
  const pointALabelPosition = $derived(getRadialLabelPosition(pointA, center));
  const pointBLabelPosition = $derived(getRadialLabelPosition(pointB, center));
  const pointCLabelPosition = $derived(getRadialLabelPosition(pointC, center));
  const pointDLabelPosition = $derived(getRadialLabelPosition(pointD, center));
  const cursor = $derived(isDragging ? "grabbing" : "grab");

  function getInsetAngleIndicatorPaths(
    angleDegrees: number,
    side: "left" | "right",
  ) {
    const angleRadians = Math.max(
      0,
      Math.min(Math.PI, (angleDegrees * Math.PI) / 180),
    );
    const sectorStart = getPointOnCircle(
      insetAngleIndicatorCenter,
      insetAngleIndicatorRadius,
      Math.PI / 2,
    );
    const endAngle =
      side === "left" ? Math.PI / 2 + angleRadians : Math.PI / 2 - angleRadians;
    const sectorEnd = getPointOnCircle(
      insetAngleIndicatorCenter,
      insetAngleIndicatorRadius,
      endAngle,
    );
    const hasVisibleAngle = angleRadians > 0.01;
    const sweepFlag = side === "left" ? 1 : 0;
    const dotBaseX =
      insetAngleIndicatorCenter.x +
      (side === "left"
        ? -insetAngleIndicatorDotGroupOffset
        : insetAngleIndicatorDotGroupOffset);
    const dotY = insetAngleIndicatorCenter.y + insetAngleIndicatorLayoutRadius;

    return {
      sectorPath: hasVisibleAngle
        ? `M ${insetAngleIndicatorCenter.x} ${insetAngleIndicatorCenter.y} L ${sectorStart.x} ${sectorStart.y} A ${insetAngleIndicatorRadius} ${insetAngleIndicatorRadius} 0 0 ${sweepFlag} ${sectorEnd.x} ${sectorEnd.y} Z`
        : "",
      rayPath: hasVisibleAngle
        ? getLinePath(insetAngleIndicatorCenter, sectorEnd)
        : "",
      arcPath: hasVisibleAngle
        ? getCircleArcPath(
            insetAngleIndicatorCenter,
            insetAngleIndicatorRadius,
            Math.PI / 2,
            endAngle,
          )
        : "",
      dotPositions: [
        { x: dotBaseX - insetAngleIndicatorDotSpacing / 2, y: dotY },
        { x: dotBaseX + insetAngleIndicatorDotSpacing / 2, y: dotY },
      ] as const,
    };
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

<WidgetContainer
  id="inscribed-angle-proof-case-center-outside-triangle-wrapper"
>
  <svg
    viewBox={`0 0 ${width} ${height}`}
    aria-label="Inscribed angle proof diagram"
  >
    <circle {cx} {cy} r={radius} fill="none" stroke="#888" stroke-width="2" />

    <path
      d={diameterPath}
      fill="none"
      stroke="#4b5563"
      stroke-width="2.5"
      stroke-dasharray="6 5"
      stroke-linecap="round"
      style="pointer-events: none;"
    />

    <g style="pointer-events: none;">
      <circle
        cx={insetAngleIndicatorCenter.x}
        cy={insetAngleIndicatorCenter.y}
        r={insetAngleIndicatorRadius}
        fill="white"
        stroke="#9ca3af"
        stroke-width="2"
      />
      <path d={insetSplitPath} fill="none" stroke="#9ca3af" stroke-width="2" />

      <path
        d={aodIndicator.sectorPath}
        fill="rgba(250, 204, 21, 0.18)"
        stroke="none"
      />
      <path
        d={aodIndicator.rayPath}
        fill="none"
        stroke="#ca8a04"
        stroke-width="2.5"
        stroke-linecap="round"
      />
      <path
        d={aodIndicator.arcPath}
        fill="none"
        stroke="#facc15"
        stroke-width="4"
        stroke-linecap="round"
      />
      <circle
        cx={aodIndicator.dotPositions[0].x}
        cy={aodIndicator.dotPositions[0].y}
        r={3.5}
        fill="#facc15"
        stroke="#111827"
        stroke-width="1.5"
      />
      <circle
        cx={aodIndicator.dotPositions[1].x}
        cy={aodIndicator.dotPositions[1].y}
        r={3.5}
        fill="#facc15"
        stroke="#111827"
        stroke-width="1.5"
      />

      <path
        d={bodIndicator.sectorPath}
        fill="rgba(22, 163, 74, 0.16)"
        stroke="none"
      />
      <path
        d={bodIndicator.rayPath}
        fill="none"
        stroke="#15803d"
        stroke-width="2.5"
        stroke-linecap="round"
      />
      <path
        d={bodIndicator.arcPath}
        fill="none"
        stroke="#16a34a"
        stroke-width="4"
        stroke-linecap="round"
      />
      <circle
        cx={bodIndicator.dotPositions[0].x}
        cy={bodIndicator.dotPositions[0].y}
        r={3.5}
        fill="#16a34a"
        stroke="#111827"
        stroke-width="1.5"
      />
      <circle
        cx={bodIndicator.dotPositions[1].x}
        cy={bodIndicator.dotPositions[1].y}
        r={3.5}
        fill="#16a34a"
        stroke="#111827"
        stroke-width="1.5"
      />
    </g>

    {#if showAcoGroup}
      <path
        d={acoTrianglePath}
        fill="rgba(250, 204, 21, 0.28)"
        stroke="#ca8a04"
        stroke-width="2"
      />
      <path
        d={aodArcPath}
        fill="none"
        stroke="#facc15"
        stroke-width="5"
        stroke-linecap="round"
      />
      <circle
        cx={acoDot.x}
        cy={acoDot.y}
        r={4}
        fill="#facc15"
        stroke="#111827"
        stroke-width="1.5"
      />
      <circle
        cx={caoDot.x}
        cy={caoDot.y}
        r={4}
        fill="#facc15"
        stroke="#111827"
        stroke-width="1.5"
      />
      <circle
        cx={aodDots[0].x}
        cy={aodDots[0].y}
        r={4}
        fill="#facc15"
        stroke="#111827"
        stroke-width="1.5"
      />
      <circle
        cx={aodDots[1].x}
        cy={aodDots[1].y}
        r={4}
        fill="#facc15"
        stroke="#111827"
        stroke-width="1.5"
      />
    {/if}

    {#if showBcoGroup}
      <path
        d={bcoTrianglePath}
        fill="rgba(22, 163, 74, 0.2)"
        stroke="#15803d"
        stroke-width="2"
      />
      <path
        d={bodArcPath}
        fill="none"
        stroke="#16a34a"
        stroke-width="5"
        stroke-linecap="round"
      />
      <circle
        cx={bcoDot.x}
        cy={bcoDot.y}
        r={4}
        fill="#16a34a"
        stroke="#111827"
        stroke-width="1.5"
      />
      <circle
        cx={cboDot.x}
        cy={cboDot.y}
        r={4}
        fill="#16a34a"
        stroke="#111827"
        stroke-width="1.5"
      />
      <circle
        cx={bodDots[0].x}
        cy={bodDots[0].y}
        r={4}
        fill="#16a34a"
        stroke="#111827"
        stroke-width="1.5"
      />
      <circle
        cx={bodDots[1].x}
        cy={bodDots[1].y}
        r={4}
        fill="#16a34a"
        stroke="#111827"
        stroke-width="1.5"
      />
    {/if}

    <circle {cx} {cy} r={5} fill="#111827" style="pointer-events: none;" />
    <text
      x={cx + 16}
      y={cy - 14}
      fill="#111827"
      font-size="18"
      font-weight="700"
      text-anchor="middle"
      dominant-baseline="middle"
      style="pointer-events: none; user-select: none;"
    >
      O
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

    <circle
      cx={pointD.x}
      cy={pointD.y}
      r={6}
      fill="#111827"
      style="pointer-events: none;"
    />

    <text
      x={pointALabelPosition.x}
      y={pointALabelPosition.y}
      fill="#111827"
      font-size="18"
      font-weight="700"
      text-anchor="middle"
      dominant-baseline="middle"
      style="pointer-events: none; user-select: none;"
    >
      A
    </text>
    <text
      x={pointBLabelPosition.x}
      y={pointBLabelPosition.y}
      fill="#111827"
      font-size="18"
      font-weight="700"
      text-anchor="middle"
      dominant-baseline="middle"
      style="pointer-events: none; user-select: none;"
    >
      B
    </text>
    <text
      x={pointCLabelPosition.x}
      y={pointCLabelPosition.y}
      fill="#111827"
      font-size="18"
      font-weight="700"
      text-anchor="middle"
      dominant-baseline="middle"
      style="pointer-events: none; user-select: none;"
    >
      C
    </text>
    <text
      x={pointDLabelPosition.x}
      y={pointDLabelPosition.y}
      fill="#111827"
      font-size="18"
      font-weight="700"
      text-anchor="middle"
      dominant-baseline="middle"
      style="pointer-events: none; user-select: none;"
    >
      D
    </text>
  </svg>
</WidgetContainer>
