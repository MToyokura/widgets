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
    getThreeSceneWrappers,
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

  const id = "moving-line-creates-cylindrical-surface-wrapper";
  const RADIUS = 1.1;
  const HEIGHT = 2.8;
  const HALF_HEIGHT = HEIGHT / 2;
  const ANGULAR_SPEED = 0.55;

  onMount(() => {
    const wrappers = getThreeSceneWrappers(id);
    const handles: Array<{ destroy: () => void }> = [];

    for (const wrapper of wrappers) {
      wrapper.dataset.pixelRatioCapControlId = pixelRatioCapControlId;
      wrapper.dataset.antialiasControlId = antialiasControlId;

      const handle = mountManagedThreeScene(wrapper, {
        cameraPosition: [5.4, 3.2, 5.6],
        cameraLookAt: [0, -0.1, 0],
        setup: ({ scene, addCleanup, render, trackResolutionTarget }) => {
          const { plane, grid } = addReferencePlane(scene, {
            size: 5.2,
            opacity: 0.28,
          });
          plane.position.y = -HALF_HEIGHT;
          grid.position.y = -HALF_HEIGHT;

          const resolution = new THREE.Vector2(1, 1);

          const surface = new THREE.Mesh(
            new THREE.CylinderGeometry(RADIUS, RADIUS, HEIGHT, 96, 1, true),
            new THREE.MeshBasicMaterial({
              color: 0x93c5fd,
              transparent: true,
              opacity: 0.3,
              side: THREE.DoubleSide,
              depthWrite: false,
            }),
          );
          scene.add(surface);

          const topRing = new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(
              createCirclePoints(RADIUS, HALF_HEIGHT),
            ),
            new THREE.LineBasicMaterial({
              color: 0x2563eb,
              transparent: true,
              opacity: 0.8,
            }),
          );
          const bottomRing = new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(
              createCirclePoints(RADIUS, -HALF_HEIGHT),
            ),
            new THREE.LineBasicMaterial({
              color: 0x2563eb,
              transparent: true,
              opacity: 0.45,
            }),
          );
          scene.add(topRing);
          scene.add(bottomRing);

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
          setSegment(
            movingGeometry,
            new THREE.Vector3(0, -HALF_HEIGHT, 0),
            new THREE.Vector3(0, HALF_HEIGHT, 0),
          );
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
          const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0x111827,
          });
          const topMarker = new THREE.Mesh(markerGeometry, markerMaterial);
          const bottomMarker = new THREE.Mesh(markerGeometry, markerMaterial);
          scene.add(topMarker);
          scene.add(bottomMarker);

          let frameId = 0;
          let startTime = performance.now();

          const updateMovingLine = (angle: number) => {
            const cosine = Math.cos(angle) * RADIUS;
            const sine = Math.sin(angle) * RADIUS;

            movingLine.position.set(cosine, 0, sine);
            movingLine.rotation.y = angle;

            topMarker.position.set(cosine, HALF_HEIGHT, sine);
            bottomMarker.position.set(cosine, -HALF_HEIGHT, sine);
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

      handles.push(handle);
    }

    return () => {
      handles.forEach((handle) => handle.destroy());
    };
  });
</script>

<ThreeSceneShell {id} {pixelRatioCapControlId} {antialiasControlId} />
