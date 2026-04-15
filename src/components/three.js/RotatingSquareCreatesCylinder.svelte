<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { Line2 } from "three/addons/lines/Line2.js";
  import { LineGeometry } from "three/addons/lines/LineGeometry.js";
  import { LineMaterial } from "three/addons/lines/LineMaterial.js";
  import {
    addReferencePlane,
    getThreeSceneWrapper,
    mountManagedThreeScene,
  } from "./functions/three";
  import ThreeSceneShell from "./shared/ThreeSceneShell.svelte";

  let {
    pixelRatioCapControlId = "",
    antialiasControlId = "",
  }: {
    pixelRatioCapControlId?: string;
    antialiasControlId?: string;
  } = $props();

  const id = "rotating-square-creates-cylinder-wrapper";
  const SIDE = 1.7;
  const HEIGHT = SIDE;
  const RADIUS = SIDE;
  const ANGULAR_SPEED = 0.55;
  const OUTLINE_WIDTH = 3.8;
  const REFERENCE_PLANE_Y = -0.001;

  function createRingPoints(radius: number, y: number, segments = 96) {
    const points = [];

    for (let index = 0; index < segments; index += 1) {
      const angle = (index / segments) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius,
        ),
      );
    }

    return points;
  }

  function createSquareOutlinePositions() {
    return [0, 0, 0, RADIUS, 0, 0, RADIUS, HEIGHT, 0, 0, HEIGHT, 0, 0, 0, 0];
  }

  onMount(() => {
    const wrapper = getThreeSceneWrapper(id);
    if (wrapper instanceof HTMLDivElement) {
      const handle = mountManagedThreeScene(wrapper, {
        cameraPosition: [5.9, 3.8, 5.8],
        cameraLookAt: [0, 0.8, 0],
        setup: ({ scene, addCleanup, render, trackResolutionTarget }) => {
          const { plane, grid } = addReferencePlane(scene, {
            size: 6.2,
            segments: 10,
            opacity: 0.24,
          });
          plane.position.y = REFERENCE_PLANE_Y;
          grid.position.y = REFERENCE_PLANE_Y;

          const resolution = new THREE.Vector2(1, 1);

          const cylinder = new THREE.Mesh(
            new THREE.CylinderGeometry(RADIUS, RADIUS, HEIGHT, 96),
            new THREE.MeshBasicMaterial({
              color: 0x93c5fd,
              transparent: true,
              opacity: 0.18,
              side: THREE.DoubleSide,
              depthWrite: false,
            }),
          );
          cylinder.position.y = HEIGHT / 2;
          scene.add(cylinder);

          const topRing = new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(
              createRingPoints(RADIUS, HEIGHT),
            ),
            new THREE.LineBasicMaterial({
              color: 0x2563eb,
              transparent: true,
              opacity: 0.75,
            }),
          );
          const bottomRing = new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(
              createRingPoints(RADIUS, 0),
            ),
            new THREE.LineBasicMaterial({
              color: 0x2563eb,
              transparent: true,
              opacity: 0.5,
            }),
          );
          scene.add(topRing);
          scene.add(bottomRing);

          const axis = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, -0.2, 0),
              new THREE.Vector3(0, HEIGHT + 0.25, 0),
            ]),
            new THREE.LineBasicMaterial({ color: 0x1d4ed8 }),
          );
          scene.add(axis);

          const rotatingGroup = new THREE.Group();
          scene.add(rotatingGroup);

          const square = new THREE.Mesh(
            new THREE.PlaneGeometry(SIDE, SIDE),
            new THREE.MeshBasicMaterial({
              color: 0x93c5fd,
              transparent: true,
              opacity: 0.34,
              side: THREE.DoubleSide,
              depthWrite: false,
            }),
          );
          square.position.set(RADIUS / 2, HEIGHT / 2, 0);
          rotatingGroup.add(square);

          const outlineGeometry = new LineGeometry();
          outlineGeometry.setPositions(createSquareOutlinePositions());
          const outline = new Line2(
            outlineGeometry,
            new LineMaterial({
              color: 0x111827,
              linewidth: OUTLINE_WIDTH,
              resolution,
            }),
          );
          rotatingGroup.add(outline);

          const markerGeometry = new THREE.SphereGeometry(0.07, 18, 14);
          const rotatingMarkers = [
            new THREE.Mesh(
              markerGeometry,
              new THREE.MeshBasicMaterial({ color: 0x111827 }),
            ),
            new THREE.Mesh(
              markerGeometry,
              new THREE.MeshBasicMaterial({ color: 0x111827 }),
            ),
          ];

          rotatingMarkers[0].position.set(RADIUS, 0, 0);
          rotatingMarkers[1].position.set(RADIUS, HEIGHT, 0);

          for (const marker of rotatingMarkers) {
            rotatingGroup.add(marker);
          }

          const hingeMarkers = [
            new THREE.Mesh(
              markerGeometry,
              new THREE.MeshBasicMaterial({ color: 0x1d4ed8 }),
            ),
            new THREE.Mesh(
              markerGeometry,
              new THREE.MeshBasicMaterial({ color: 0x1d4ed8 }),
            ),
          ];
          hingeMarkers[0].position.set(0, 0, 0);
          hingeMarkers[1].position.set(0, HEIGHT, 0);

          for (const marker of hingeMarkers) {
            scene.add(marker);
          }

          let frameId = 0;
          let startTime = performance.now();

          const tick = (time: number) => {
            const elapsed = (time - startTime) / 1000;
            rotatingGroup.rotation.y = -elapsed * ANGULAR_SPEED;
            render();
            frameId = window.requestAnimationFrame(tick);
          };

          render();
          frameId = window.requestAnimationFrame(tick);

          addCleanup(() => {
            window.cancelAnimationFrame(frameId);
            startTime = 0;
          });

          trackResolutionTarget(outline.material);
        },
      });

      return () => {
        handle.destroy();
      };
    }
  });
</script>

<ThreeSceneShell {id} {pixelRatioCapControlId} {antialiasControlId} />
