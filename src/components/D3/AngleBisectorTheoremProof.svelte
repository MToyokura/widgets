<svelte:options runes={true} />

<script lang="ts">
  import * as d3 from "d3";
  import type { Action } from "svelte/action";
  import { cubicOut } from "svelte/easing";
  import { Tween } from "svelte/motion";

  import WidgetContainer from "../WidgetContainer.svelte";
  import WidgetSliderController from "../WidgetSliderController.svelte";
  import {
    getAngleLabelPosition,
    getBisectorIntersection,
    getLinePath,
    getLinePathThroughPoint,
    getLinesIntersection,
    getTrianglePath,
    interpolatePoint,
    type Point,
  } from "./functions/geometry";

  let {
    steps = $bindable(0),
    locale = "en",
  }: {
    steps?: number;
    locale?: "en" | "ja" | "pt" | "es" | "hi" | "ru" | "bn" | "zh-cn";
  } = $props();

  const width = 400;
  const height = 400;

  // SSR-safe unique ID generation fallback
  const baseId = `angle-bisector-proof-${
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  }`;

  const copy = {
    en: {
      diagramLabel: "Angle bisector theorem proof diagram",
      stepsLabel: "Step",
      stepDescriptions: [
        "Start with triangle ABC and the angle bisector AD, where D lies on BC.",
        "Draw a line through B parallel to AD, and extend line AC to meet it at point E.",
        "Since BE is parallel to AD, the corresponding angles and alternate interior angles show that ∠ABE=∠BAE.",
        "Therefore, triangle ABE is isosceles, meaning AE=AB.",
        "Using the property of parallel lines (or similar triangles △CAD∼△CEB), we get AE:AC=BD:CD. Substituting AB for AE, we obtain AB:AC=BD:CD.",
      ],
    },
    ja: {
      diagramLabel: "角の二等分線定理の証明図",
      stepsLabel: "ステップ",
      stepDescriptions: [
        "△ABCで、∠Aの二等分線ADと辺BCの交点をDとする。",
        "Bを通ってADに平行な直線を引き、ACの延長との交点をEとする。Cを通ってADに平行な直線を引き、ABの延長との交点をFとする。",
        "∠BADおよび∠CADの対頂角、同位角、錯角を取る。",
        "△AEBと△AFCは二等辺三角形であり、AE＝AB、AF＝AC となる。",
        "△CEBと△CADは相似であることを用いると、AB：AC＝BD：CD が得られる。",
      ],
    },
    pt: {
      diagramLabel: "Diagrama da demonstração do teorema da bissetriz interna",
      stepsLabel: "Passo",
      stepDescriptions: [
        "Considere o triângulo ABC e a bissetriz AD, onde D pertence ao lado BC.",
        "Trace uma reta por B paralela a AD, prolongando o lado AC até encontrá-la no ponto E; trace uma reta por C paralela a AD, prolongando o lado AB até o ponto F.",
        "Como as novas retas são paralelas a AD, os ângulos em E, B, F e C são iguais às metades do ângulo A por correspondência e alternância.",
        "Assim, os triângulos ABE e ACF são isósceles, resultando em AE = AB e AF = AC.",
        "Usando a semelhança de triângulos gerada pelas paralelas, temos AE : AC = BD : CD. Substituindo AE por AB, obtemos AB : AC = BD : CD.",
      ],
    },
    es: {
      diagramLabel: "Diagrama de la demostración del teorema de la bisectriz",
      stepsLabel: "Paso",
      stepDescriptions: [
        "Comienza con el triángulo ABC y la bisectriz AD, donde D se encuentra en BC.",
        "Traza una recta por B paralela a AD y prolonga el lado AC hasta encontrarla en el punto E; traza una recta por C paralela a AD y prolonga el lado AB hasta el punto F.",
        "Dado que las nuevas rectas son paralelas a AD, los ángulos en E, B, F y C son iguales a las dos mitades del ángulo A.",
        "Por lo tanto, los triángulos ABE y ACF son isósceles, lo que implica que AE = AB y AF = AC.",
        "Al aplicar la semejanza de triángulos creada por las paralelas, obtenemos AB : AC = BD : CD.",
      ],
    },
    hi: {
      diagramLabel: "कोण समद्विभाजक प्रमेय के प्रमाण का आरेख",
      stepsLabel: "चरण",
      stepDescriptions: [
        "त्रिभुज ABC से शुरू करें, जहाँ AD कोण A का समद्विभाजक है और D, BC पर स्थित है।",
        "B से AD के समांतर एक रेखा खींचें और AC को आगे बढ़ाते हुए उसे बिंदु E पर मिलाएँ; इसी प्रकार C से AD के समांतर रेखा खींचकर AB को F पर मिलाएँ।",
        "चूंकि ये रेखाएँ AD के समांतर हैं, इसलिए संगत और एकांतर कोणों के गुण से E, B, F और C पर बने कोण, कोण A के अर्धकों के बराबर होंगे।",
        "अतः त्रिभुज ABE और ACF समद्विबाहु हैं, जिससे AE = AB और AF = AC प्राप्त होता है।",
        "समानुपातिकता प्रमेय (या समरूप त्रिभुजों) का उपयोग करने पर, हमें AB : AC = BD : CD प्राप्त होता है।",
      ],
    },
    ru: {
      diagramLabel: "Чертеж к доказательству теоремы о биссектрисе",
      stepsLabel: "Шаг",
      stepDescriptions: [
        "Рассмотрим треугольник ABC и биссектрису AD, где точка D лежит на стороне BC.",
        "Проведите через вершину B прямую, параллельную AD, до пересечения с продолжением стороны AC в точке E; аналогично через C проведите прямую, параллельную AD, до пересечения с продолжением AB в точке F.",
        "Так как новые прямые параллельны AD, углы при вершинах E, B, F и C равны половинам угла A (как соответствующие или накрест лежащие).",
        "Следовательно, треугольники ABE и ACF являются равнобедренными, то есть AE = AB и AF = AC.",
        "Используя подобие треугольников, образованных параллельными прямыми, получаем соотношение AB : AC = BD : CD.",
      ],
    },
    bn: {
      diagramLabel: "কোণ দ্বিভাজক উপপাদ্য প্রমাণের চিত্র",
      stepsLabel: "ধাপ",
      stepDescriptions: [
        "ত্রিভুজ ABC দিয়ে শুরু করি, যেখানে AD হলো ∠A-এর সমদ্বিভাজক এবং D বিন্দুটি BC বাহুর ওপর অবস্থিত।",
        "B বিন্দু দিয়ে AD-এর সমান্তরাল একটি রেখা আঁকি এবং AC-কে বর্ধিত করে E বিন্দুতে ছেদ করি; একইভাবে C দিয়ে AD-এর সমান্তরাল রেখা আঁকি যা বর্ধিত AB-কে F বিন্দুতে ছেদ করে।",
        "নতুন রেখাগুলো AD-এর সমান্তরাল হওয়ায়, অনুরূপ ও একান্তর কোণের নিয়মানুসারে E, B, F এবং C বিন্দুতে উৎপন্ন কোণগুলো ∠A-এর অর্ধেকের সমান।",
        "ফলস্বরূপ, ত্রিভুজ ABE এবং ACF উভয়ই সমদ্বিবাহু, অর্থাৎ AE = AB এবং AF = AC।",
        "সমান্তরাল রেখা দ্বারা গঠিত সদৃশ ত্রিভুজের বৈশিষ্ট্য ব্যবহার করে আমরা পাই AB : AC = BD : CD।",
      ],
    },
    "zh-cn": {
      diagramLabel: "角平分线定理证明图示",
      stepsLabel: "步骤",
      stepDescriptions: [
        "在△ABC中，AD是∠A的角平分线，点D在边BC上。",
        "过点B作AD de 平行线，与AC的延长线交于点E；过点C作AD的平行线，与AB的延长线交于点F。",
        "由于这些直线平行于AD，根据同位角和内错角相等的原理，E、B、F、C处的角均等于∠A的一半。",
        "因此，△ABE和△ACF均为等腰三角形，即 AE = AB 且 AF = AC。",
        "利用平行线产生的相似三角形性质，可得 AE : AC = BD : CD。代入等量关系后得出 AB : AC = BD : CD。",
      ],
    },
  } as const;

  const language = $derived(
    locale in copy ? (locale as keyof typeof copy) : "en",
  );
  const text = $derived(copy[language]);
  const currentStepDescription = $derived(
    text.stepDescriptions[steps] ?? text.stepDescriptions[0],
  );

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
    aria-label={text.diagramLabel}
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
      label={`${text.stepsLabel} ${steps + 1}`}
      description={currentStepDescription}
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
