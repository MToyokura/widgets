<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { Line2 } from "three/addons/lines/Line2.js";
  import { LineGeometry } from "three/addons/lines/LineGeometry.js";
  import { LineMaterial } from "three/addons/lines/LineMaterial.js";
  import {
    addReferencePlane,
    createCirclePoints,
    getThreeSceneWrapper,
    mountManagedThreeScene,
    setSegment,
  } from "./functions/three";
  import ThreeSceneShell from "./shared/ThreeSceneShell.svelte";

  let {
    pixelRatioCapControlId = "",
    antialiasControlId = "",
  }: {
    pixelRatioCapControlId?: string;
    antialiasControlId?: string;
  } = $props();

  const id = "moving-line-creates-conical-surface-wrapper";
  const BASE_RADIUS = 1.35;
  const HEIGHT = 3;
  const HALF_HEIGHT = HEIGHT / 2;
  const APEX = new THREE.Vector3(0, HALF_HEIGHT, 0);
  const ANGULAR_SPEED = 0.55;

  function getBasePoint(angle: number) {
    return new THREE.Vector3(
      Math.cos(angle) * BASE_RADIUS,
      -HALF_HEIGHT,
      Math.sin(angle) * BASE_RADIUS,
    );
  }

  onMount(() => {
    const wrapper = getThreeSceneWrapper(id);

    if (wrapper instanceof HTMLDivElement) {
      wrapper.dataset.pixelRatioCapControlId = pixelRatioCapControlId;
      wrapper.dataset.antialiasControlId = antialiasControlId;

      const handle = mountManagedThreeScene(wrapper, {
        cameraPosition: [5.2, 3.4, 5.8],
        cameraLookAt: [0, -0.1, 0],
        setup: ({ scene, addCleanup, render, trackResolutionTarget }) => {
          const { plane, grid } = addReferencePlane(scene, {
            size: 5.4,
            opacity: 0.28,
          });
          plane.position.y = -HALF_HEIGHT;
          grid.position.y = -HALF_HEIGHT;

          const resolution = new THREE.Vector2(1, 1);

          const surface = new THREE.Mesh(
            new THREE.ConeGeometry(BASE_RADIUS, HEIGHT, 96, 1, true),
            new THREE.MeshBasicMaterial({
              color: 0xfca5a5,
              transparent: true,
              opacity: 0.32,
              side: THREE.DoubleSide,
              depthWrite: false,
            }),
          );
          scene.add(surface);

          const baseRing = new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(
              createCirclePoints(BASE_RADIUS, -HALF_HEIGHT),
            ),
            new THREE.LineBasicMaterial({
              color: 0xdc2626,
              transparent: true,
              opacity: 0.8,
            }),
          );
          scene.add(baseRing);

          const axisGeometry = new LineGeometry();
          setSegment(
            axisGeometry,
            new THREE.Vector3(0, -HALF_HEIGHT - 0.25, 0),
            new THREE.Vector3(0, HALF_HEIGHT + 0.25, 0),
          );
          const axisLine = new Line2(
            axisGeometry,
            new LineMaterial({
              color: 0x1d4ed8,
              linewidth: 2.5,
              resolution,
            }),
          );
          scene.add(axisLine);

          const movingGeometry = new LineGeometry();
          setSegment(movingGeometry, APEX, getBasePoint(0));
          const movingLine = new Line2(
            movingGeometry,
            new LineMaterial({
              color: 0x111827,
              linewidth: 3.2,
              resolution,
            }),
          );
          scene.add(movingLine);

          const markerGeometry = new THREE.SphereGeometry(0.08, 18, 14);
          const apexMarker = new THREE.Mesh(
            markerGeometry,
            new THREE.MeshBasicMaterial({ color: 0x111827 }),
          );
          apexMarker.position.copy(APEX);
          scene.add(apexMarker);

          const baseMarker = new THREE.Mesh(
            markerGeometry,
            new THREE.MeshBasicMaterial({ color: 0x111827 }),
          );
          scene.add(baseMarker);

          let frameId = 0;
          let startTime = performance.now();

          const updateMovingLine = (angle: number) => {
            const basePoint = getBasePoint(angle);
            setSegment(movingGeometry, APEX, basePoint);
            baseMarker.position.copy(basePoint);
          };

          const tick = (time: number) => {
            const elapsed = (time - startTime) / 1000;
            updateMovingLine(elapsed * ANGULAR_SPEED);
            render();
            frameId = window.requestAnimationFrame(tick);
          };

          updateMovingLine(0);
          frameId = window.requestAnimationFrame(tick);

          addCleanup(() => {
            window.cancelAnimationFrame(frameId);
            startTime = 0;
          });

          trackResolutionTarget(axisLine.material, movingLine.material);
        },
      });

      return () => {
        handle.destroy();
      };
    }
  });
</script>

<ThreeSceneShell {id} {pixelRatioCapControlId} {antialiasControlId} />
