<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import WidgetSliderController from "../WidgetSliderController.svelte";
  import {
    addReferencePlane,
    getRangeControlValue,
    getThreeSceneWrappers,
    mountManagedThreeScene,
    observeRangePreference,
  } from "./functions/three";
  import ThreeSceneShell from "./shared/ThreeSceneShell.svelte";

  let {
    locale = "ja",
    pixelRatioCapControlId = "",
    antialiasControlId = "",
    heightControlId = "",
  }: {
    locale?: "en" | "ja";
    pixelRatioCapControlId?: string;
    antialiasControlId?: string;
    heightControlId?: string;
  } = $props();

  const id = "moving-triangle-creates-triangular-prism-wrapper";
  const baseId = `moving-triangle-creates-triangular-prism-${crypto.randomUUID()}`;
  const copy = {
    en: {
      heightLabel: "Height",
    },
    ja: {
      heightLabel: "高さ",
    },
  } as const;

  const resolvedHeightControlId = $derived(
    heightControlId || `${baseId}-height`,
  );
  const text = $derived(copy[locale === "en" ? "en" : "ja"]);

  const BASE_Y = 0;
  const REFERENCE_PLANE_Y = BASE_Y - 0.001;
  const DEFAULT_HEIGHT = 0;
  const MIN_HEIGHT = 0;
  const MAX_HEIGHT = 2.4;
  const MIN_VISIBLE_HEIGHT = 0.02;
  const BASE_POINTS = [
    new THREE.Vector3(-1.55, BASE_Y, -0.9),
    new THREE.Vector3(1.45, BASE_Y, -0.55),
    new THREE.Vector3(-0.35, BASE_Y, 1.5),
  ];
  const TRANSLATION_VECTOR = new THREE.Vector3(0, 1, 0);

  function setPositions(
    attribute: THREE.BufferAttribute,
    points: THREE.Vector3[],
  ) {
    for (let index = 0; index < points.length; index += 1) {
      const point = points[index];
      const start = index * 3;
      attribute.array[start] = point.x;
      attribute.array[start + 1] = point.y;
      attribute.array[start + 2] = point.z;
    }

    attribute.needsUpdate = true;
  }

  function getTranslatedPoints(offset: number) {
    return BASE_POINTS.map((point) =>
      point.clone().addScaledVector(TRANSLATION_VECTOR, offset),
    );
  }

  onMount(() => {
    const wrappers = getThreeSceneWrappers(id);
    const handles: Array<{ destroy: () => void }> = [];

    for (const wrapper of wrappers) {
      wrapper.dataset.pixelRatioCapControlId = pixelRatioCapControlId;
      wrapper.dataset.antialiasControlId = antialiasControlId;
      wrapper.dataset.heightControlId = resolvedHeightControlId;

      const handle = mountManagedThreeScene(wrapper, {
        cameraPosition: [6.3, 4.7, 6.8],
        cameraLookAt: [0, 1.2, 0],
        setup: ({ scene, addCleanup, render }) => {
          const controlId = wrapper.dataset.heightControlId || "";

          const { plane, grid } = addReferencePlane(scene, {
            size: 6.6,
            segments: 10,
            opacity: 0.24,
          });
          plane.position.y = REFERENCE_PLANE_Y;
          grid.position.y = REFERENCE_PLANE_Y;

          const prismGeometry = new THREE.BufferGeometry();
          prismGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(18), 3),
          );
          prismGeometry.setIndex([
            0, 1, 2, 3, 5, 4, 0, 1, 4, 0, 4, 3, 1, 2, 5, 1, 5, 4, 2, 0, 3, 2, 3,
            5,
          ]);
          const prism = new THREE.Mesh(
            prismGeometry,
            new THREE.MeshBasicMaterial({
              color: 0xfbbf24,
              transparent: true,
              opacity: 0.34,
              side: THREE.DoubleSide,
              depthWrite: false,
            }),
          );
          scene.add(prism);

          const baseFaceGeometry = new THREE.BufferGeometry();
          baseFaceGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(9), 3),
          );
          baseFaceGeometry.setIndex([0, 1, 2]);
          const baseFace = new THREE.Mesh(
            baseFaceGeometry,
            new THREE.MeshBasicMaterial({
              color: 0xf59e0b,
              transparent: true,
              opacity: 0.2,
              side: THREE.DoubleSide,
              depthWrite: false,
            }),
          );
          scene.add(baseFace);

          const movingFaceGeometry = new THREE.BufferGeometry();
          movingFaceGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(9), 3),
          );
          movingFaceGeometry.setIndex([0, 1, 2]);
          const movingFace = new THREE.Mesh(
            movingFaceGeometry,
            new THREE.MeshBasicMaterial({
              color: 0x60a5fa,
              transparent: true,
              opacity: 0.18,
              side: THREE.DoubleSide,
              depthWrite: false,
            }),
          );
          scene.add(movingFace);

          const baseOutlineGeometry = new THREE.BufferGeometry();
          baseOutlineGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(9), 3),
          );
          const baseOutline = new THREE.LineLoop(
            baseOutlineGeometry,
            new THREE.LineBasicMaterial({ color: 0x92400e }),
          );
          scene.add(baseOutline);

          const movingOutlineGeometry = new THREE.BufferGeometry();
          movingOutlineGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(9), 3),
          );
          const movingOutline = new THREE.LineLoop(
            movingOutlineGeometry,
            new THREE.LineBasicMaterial({ color: 0x111827 }),
          );
          scene.add(movingOutline);

          const connectorGeometry = new THREE.BufferGeometry();
          connectorGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(18), 3),
          );
          const connectors = new THREE.LineSegments(
            connectorGeometry,
            new THREE.LineBasicMaterial({
              color: 0x2563eb,
              transparent: true,
              opacity: 0.9,
            }),
          );
          scene.add(connectors);

          const markerGeometry = new THREE.SphereGeometry(0.075, 18, 14);
          const baseMarkers = BASE_POINTS.map(
            () =>
              new THREE.Mesh(
                markerGeometry,
                new THREE.MeshBasicMaterial({ color: 0x92400e }),
              ),
          );
          const movingMarkers = BASE_POINTS.map(
            () =>
              new THREE.Mesh(
                markerGeometry,
                new THREE.MeshBasicMaterial({ color: 0x111827 }),
              ),
          );

          for (let index = 0; index < BASE_POINTS.length; index += 1) {
            baseMarkers[index].position.copy(BASE_POINTS[index]);
            scene.add(baseMarkers[index]);
            scene.add(movingMarkers[index]);
          }

          const baseOutlinePositions = baseOutlineGeometry.getAttribute(
            "position",
          ) as THREE.BufferAttribute;
          const baseFacePositions = baseFaceGeometry.getAttribute(
            "position",
          ) as THREE.BufferAttribute;
          const movingOutlinePositions = movingOutlineGeometry.getAttribute(
            "position",
          ) as THREE.BufferAttribute;
          const movingFacePositions = movingFaceGeometry.getAttribute(
            "position",
          ) as THREE.BufferAttribute;
          const prismPositions = prismGeometry.getAttribute(
            "position",
          ) as THREE.BufferAttribute;
          const connectorPositions = connectorGeometry.getAttribute(
            "position",
          ) as THREE.BufferAttribute;

          setPositions(baseOutlinePositions, BASE_POINTS);
          setPositions(baseFacePositions, BASE_POINTS);
          baseOutlineGeometry.computeBoundingSphere();
          baseFaceGeometry.computeBoundingSphere();

          const updateScene = (rawHeight: number) => {
            const height = THREE.MathUtils.clamp(
              rawHeight,
              MIN_HEIGHT,
              MAX_HEIGHT,
            );
            const showExtrusion = height > MIN_VISIBLE_HEIGHT;
            const topPoints = getTranslatedPoints(height);

            setPositions(movingOutlinePositions, topPoints);
            setPositions(movingFacePositions, topPoints);
            movingOutlineGeometry.computeBoundingSphere();
            movingFaceGeometry.computeBoundingSphere();

            setPositions(prismPositions, [...BASE_POINTS, ...topPoints]);
            prismGeometry.computeVertexNormals();
            prismGeometry.computeBoundingSphere();

            const connectorPointPairs = [
              BASE_POINTS[0],
              topPoints[0],
              BASE_POINTS[1],
              topPoints[1],
              BASE_POINTS[2],
              topPoints[2],
            ];
            setPositions(connectorPositions, connectorPointPairs);
            connectorGeometry.computeBoundingSphere();

            for (let index = 0; index < topPoints.length; index += 1) {
              movingMarkers[index].position.copy(topPoints[index]);
            }

            prism.visible = showExtrusion;
            connectors.visible = showExtrusion;
            movingOutline.visible = showExtrusion;
            movingFace.visible = showExtrusion;

            for (const marker of movingMarkers) {
              marker.visible = showExtrusion;
            }

            render();
          };

          const stopObservingRange = observeRangePreference(
            controlId,
            updateScene,
          );
          updateScene(getRangeControlValue(controlId, DEFAULT_HEIGHT));

          addCleanup(() => {
            stopObservingRange?.();
          });
        },
      });

      handles.push(handle);
    }

    return () => {
      handles.forEach((handle) => handle.destroy());
    };
  });
</script>

<ThreeSceneShell {id} {pixelRatioCapControlId} {antialiasControlId}>
  {#snippet controls()}
    <WidgetSliderController
      id={resolvedHeightControlId}
      label={text.heightLabel}
      min={0}
      max={2.4}
      step={0.1}
      value={0}
    />
  {/snippet}
</ThreeSceneShell>
