<svelte:options runes={true} />

<script lang="ts">
  import WidgetContainer from "../WidgetContainer.svelte";
  import WidgetSliderController from "../WidgetSliderController.svelte";
  import {
    getDoubleAngleDotPositions,
    getLinePathThroughPoint,
    type Point,
  } from "./functions/geometry";

  const width = 400;
  const height = 400;
  const gridSpacing = 40;
  const linePadding = 40;

  const gridXs = Array.from(
    { length: Math.floor(width / gridSpacing) + 1 },
    (_, i) => i * gridSpacing,
  );
  const gridYs = Array.from(
    { length: Math.floor(height / gridSpacing) + 1 },
    (_, i) => i * gridSpacing,
  );

  const center: Point = { x: width / 2, y: height / 2 };
  const topY = height * 0.3;
  const bottomY = height * 0.7;
  const horizontalLinesY = [topY, bottomY];
  const markerRadius = 35;
  const baseId = `parallel-lines-${crypto.randomUUID()}`;

  // 2. Reactive State
  let angleDeg = $state(135);

  // 3. Derived State
  let angleRad = $derived(Math.PI - (angleDeg * Math.PI) / 180);

  const transversalPath = $derived(
    getLinePathThroughPoint(center, angleRad, 1000),
  );

  function getIntersectionData(yLine: number, currentAngle: number) {
    const sin = Math.sin(currentAngle);
    const cos = Math.cos(currentAngle);
    const safeSin = Math.abs(sin) < 1e-6 ? (sin >= 0 ? 1e-6 : -1e-6) : sin;
    const t = (yLine - center.y) / safeSin;
    const pt = { x: center.x + t * cos, y: yLine };

    const pRight = { x: pt.x + markerRadius, y: pt.y };
    const pLeft = { x: pt.x - markerRadius, y: pt.y };
    const pTransversal = {
      x: pt.x + Math.cos(currentAngle) * markerRadius,
      y: pt.y + Math.sin(currentAngle) * markerRadius,
    };

    return {
      point: pt,
      rightDots: getDoubleAngleDotPositions(pRight, pt, pTransversal),
      leftDots: getDoubleAngleDotPositions(pLeft, pt, pTransversal),
    };
  }

  const intersections = $derived(
    horizontalLinesY.map((y) => getIntersectionData(y, angleRad)),
  );
</script>

<WidgetContainer id="parallel-lines-wrapper">
  <svg
    viewBox="0 0 {width} {height}"
    aria-label="Parallel lines and transversal diagram"
  >
    {#each gridXs as x (x)}
      <line
        x1={x}
        y1="0"
        x2={x}
        y2={height}
        stroke="#d7dde5"
        stroke-width="1"
      />
    {/each}
    {#each gridYs as y (y)}
      <line x1="0" y1={y} x2={width} y2={y} stroke="#d7dde5" stroke-width="1" />
    {/each}

    <defs>
      <marker
        id="arrow"
        viewBox="0 0 10 10"
        refX="5"
        refY="5"
        markerWidth="4"
        markerHeight="4"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#374151" />
      </marker>
    </defs>

    <!-- Horizontal Lines -->
    {#each horizontalLinesY as y (y)}
      <line
        x1={linePadding}
        x2={width - linePadding}
        y1={y}
        y2={y}
        stroke="#374151"
        stroke-width="3"
        marker-start="url(#arrow)"
        marker-end="url(#arrow)"
      />
    {/each}

    <!-- Transversal -->
    <path d={transversalPath} fill="none" stroke="#2563eb" stroke-width="3" />

    <!-- Angle Markers -->
    <g style="pointer-events: none;">
      {#each intersections as inter, i (i)}
        <circle
          cx={inter.rightDots[1].x}
          cy={inter.rightDots[1].y}
          r="4.5"
          fill="#facc15"
          stroke="#111827"
          stroke-width="1.5"
        />
        <circle
          cx={inter.leftDots[1].x}
          cy={inter.leftDots[1].y}
          r="4.5"
          fill="#16a34a"
          stroke="#111827"
          stroke-width="1.5"
        />
      {/each}
    </g>
  </svg>

  {#snippet controls()}
    <WidgetSliderController
      id={`${baseId}-angle`}
      label="Angle"
      min={20}
      max={160}
      step={1}
      bind:value={angleDeg}
    />
  {/snippet}
</WidgetContainer>

<style>
  svg {
    width: 100%;
    height: 100%;
    display: block;
    background-color: #f8fafc;
  }
</style>
