<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { Line2 } from "three/addons/lines/Line2.js";
  import { LineGeometry } from "three/addons/lines/LineGeometry.js";
  import { LineMaterial } from "three/addons/lines/LineMaterial.js";
  import WidgetSliderController from "../WidgetSliderController.svelte";
  import {
    addReferencePlane,
    getRangeControlValue,
    getThreeSceneWrapper,
    mountManagedThreeScene,
    observeRangePreference,
    setSegment,
  } from "./functions/three";
  import ThreeSceneShell from "./shared/ThreeSceneShell.svelte";

  let {
    locale = "ja",
    pixelRatioCapControlId = "",
    antialiasControlId = "",
    linePositionControlId = "",
  }: {
    locale?: "en" | "ja";
    pixelRatioCapControlId?: string;
    antialiasControlId?: string;
    linePositionControlId?: string;
  } = $props();

  const id = "moving-line-creates-flat-plane-wrapper";
  const baseId = `moving-line-creates-flat-plane-${crypto.randomUUID()}`;
  const copy = {
    en: {
      linePositionLabel: "Translation amount",
    },
    ja: {
      linePositionLabel: "動かす",
    },
  } as const;

  const resolvedLinePositionControlId = $derived(
    linePositionControlId || `${baseId}-line-position`,
  );
  const text = $derived(copy[locale === "en" ? "en" : "ja"]);

  const DEFAULT_LINE_OFFSET = 0;
  const MIN_LINE_OFFSET = 0;
  const MAX_LINE_OFFSET = 2.4;
  const BASE_START = new THREE.Vector3(-1.6, 0.85, -1.1);
  const BASE_END = new THREE.Vector3(1.6, 0.85, -1.1);
  const TRANSLATION_VECTOR = new THREE.Vector3(0, 0, 1);

  onMount(() => {
    const wrapper = getThreeSceneWrapper(id);

    if (wrapper instanceof HTMLDivElement) {
      wrapper.dataset.pixelRatioCapControlId = pixelRatioCapControlId;
      wrapper.dataset.antialiasControlId = antialiasControlId;
      wrapper.dataset.linePositionControlId = resolvedLinePositionControlId;

      const handle = mountManagedThreeScene(wrapper, {
        cameraPosition: [-6.6, 5.2, 0],
        cameraLookAt: [0, 0, 0],
        setup: ({ scene, addCleanup, trackResolutionTarget, render }) => {
          addReferencePlane(scene, { opacity: 0.3 });

          const resolution = new THREE.Vector2(1, 1);
          const controlId = wrapper.dataset.linePositionControlId || "";

          const baseLineGeometry = new LineGeometry();
          setSegment(baseLineGeometry, BASE_START, BASE_END);

          const baseLineMaterial = new LineMaterial({
            color: 0x94a3b8,
            linewidth: 2.5,
            resolution,
            dashed: true,
            dashSize: 0.18,
            gapSize: 0.12,
          });
          const baseLine = new Line2(baseLineGeometry, baseLineMaterial);
          baseLine.computeLineDistances();
          scene.add(baseLine);

          const movingLineGeometry = new LineGeometry();
          const movingLineMaterial = new LineMaterial({
            color: 0x111827,
            linewidth: 3.2,
            resolution,
          });
          const movingLine = new Line2(movingLineGeometry, movingLineMaterial);
          scene.add(movingLine);

          const connectorGeometry = new THREE.BufferGeometry();
          const connectorPositions = new Float32Array(12);
          connectorGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(connectorPositions, 3),
          );
          const connectors = new THREE.LineSegments(
            connectorGeometry,
            new THREE.LineBasicMaterial({ color: 0x2563eb }),
          );
          scene.add(connectors);

          const planeGeometry = new THREE.BufferGeometry();
          const planePositions = new Float32Array(12);
          planeGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(planePositions, 3),
          );
          planeGeometry.setIndex([0, 1, 2, 2, 1, 3]);
          const plane = new THREE.Mesh(
            planeGeometry,
            new THREE.MeshBasicMaterial({
              color: 0x93c5fd,
              transparent: true,
              opacity: 0.45,
              side: THREE.DoubleSide,
            }),
          );
          scene.add(plane);

          const markerGeometry = new THREE.SphereGeometry(0.07, 16, 12);
          const baseMarkerMaterial = new THREE.MeshBasicMaterial({
            color: 0x64748b,
          });
          const movingMarkerMaterial = new THREE.MeshBasicMaterial({
            color: 0x0f172a,
          });
          const baseMarkers = [
            new THREE.Mesh(markerGeometry, baseMarkerMaterial),
            new THREE.Mesh(markerGeometry, baseMarkerMaterial),
          ];
          const movingMarkers = [
            new THREE.Mesh(markerGeometry, movingMarkerMaterial),
            new THREE.Mesh(markerGeometry, movingMarkerMaterial),
          ];

          baseMarkers[0].position.copy(BASE_START);
          baseMarkers[1].position.copy(BASE_END);

          for (const marker of [...baseMarkers, ...movingMarkers]) {
            scene.add(marker);
          }

          const updateScene = (rawOffset: number) => {
            const offset = THREE.MathUtils.clamp(
              rawOffset,
              MIN_LINE_OFFSET,
              MAX_LINE_OFFSET,
            );
            const translatedStart = BASE_START.clone().addScaledVector(
              TRANSLATION_VECTOR,
              offset,
            );
            const translatedEnd = BASE_END.clone().addScaledVector(
              TRANSLATION_VECTOR,
              offset,
            );

            setSegment(movingLineGeometry, translatedStart, translatedEnd);

            connectorPositions.set([
              BASE_START.x,
              BASE_START.y,
              BASE_START.z,
              translatedStart.x,
              translatedStart.y,
              translatedStart.z,
              BASE_END.x,
              BASE_END.y,
              BASE_END.z,
              translatedEnd.x,
              translatedEnd.y,
              translatedEnd.z,
            ]);
            connectorGeometry.attributes.position.needsUpdate = true;
            connectorGeometry.computeBoundingSphere();

            planePositions.set([
              BASE_START.x,
              BASE_START.y,
              BASE_START.z,
              translatedStart.x,
              translatedStart.y,
              translatedStart.z,
              BASE_END.x,
              BASE_END.y,
              BASE_END.z,
              translatedEnd.x,
              translatedEnd.y,
              translatedEnd.z,
            ]);
            planeGeometry.attributes.position.needsUpdate = true;
            planeGeometry.computeVertexNormals();
            planeGeometry.computeBoundingSphere();

            movingMarkers[0].position.copy(translatedStart);
            movingMarkers[1].position.copy(translatedEnd);
            render();
          };

          const stopObservingRange = observeRangePreference(
            controlId,
            updateScene,
          );
          addCleanup(() => {
            stopObservingRange?.();
          });

          updateScene(getRangeControlValue(controlId, DEFAULT_LINE_OFFSET));
          trackResolutionTarget(baseLineMaterial, movingLineMaterial);
        },
      });

      return () => {
        handle.destroy();
      };
    }
  });
</script>

<ThreeSceneShell {id} {pixelRatioCapControlId} {antialiasControlId}>
  {#snippet controls()}
    <WidgetSliderController
      id={resolvedLinePositionControlId}
      label={text.linePositionLabel}
      min={0}
      max={2.4}
      step={0.1}
      value={0}
    />
  {/snippet}
</ThreeSceneShell>
