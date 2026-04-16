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
  } from "./functions/three";
  import ThreeSceneShell from "./shared/ThreeSceneShell.svelte";

  let {
    pixelRatioCapControlId = "",
    antialiasControlId = "",
  }: {
    pixelRatioCapControlId?: string;
    antialiasControlId?: string;
  } = $props();

  const id = "rotating-triangle-creates-cone-wrapper";
  const SIDE = 1.7;
  const HEIGHT = SIDE;
  const BASE_RADIUS = SIDE;
  const ANGULAR_SPEED = 0.55;
  const OUTLINE_WIDTH = 3.8;
  const REFERENCE_PLANE_Y = -0.001;

  function createTriangleShape() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(BASE_RADIUS, 0);
    shape.lineTo(0, HEIGHT);
    shape.closePath();
    return shape;
  }

  function createTriangleOutlinePositions() {
    return [0, 0, 0, BASE_RADIUS, 0, 0, 0, HEIGHT, 0, 0, 0, 0];
  }

  onMount(() => {
    const wrapper = getThreeSceneWrapper(id);

    if (wrapper instanceof HTMLDivElement) {
      wrapper.dataset.pixelRatioCapControlId = pixelRatioCapControlId;
      wrapper.dataset.antialiasControlId = antialiasControlId;

      const handle = mountManagedThreeScene(wrapper, {
        cameraPosition: [5.6, 3.6, 5.6],
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

          const cone = new THREE.Mesh(
            new THREE.ConeGeometry(BASE_RADIUS, HEIGHT, 96),
            new THREE.MeshBasicMaterial({
              color: 0xfca5a5,
              transparent: true,
              opacity: 0.18,
              side: THREE.DoubleSide,
              depthWrite: false,
            }),
          );
          cone.position.y = HEIGHT / 2;
          scene.add(cone);

          const baseRing = new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(
              createCirclePoints(BASE_RADIUS, 0),
            ),
            new THREE.LineBasicMaterial({
              color: 0xdc2626,
              transparent: true,
              opacity: 0.75,
            }),
          );
          scene.add(baseRing);

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

          const triangle = new THREE.Mesh(
            new THREE.ShapeGeometry(createTriangleShape()),
            new THREE.MeshBasicMaterial({
              color: 0xfca5a5,
              transparent: true,
              opacity: 0.34,
              side: THREE.DoubleSide,
              depthWrite: false,
            }),
          );
          rotatingGroup.add(triangle);

          const outlineGeometry = new LineGeometry();
          outlineGeometry.setPositions(createTriangleOutlinePositions());
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
          const rotatingMarker = new THREE.Mesh(
            markerGeometry,
            new THREE.MeshBasicMaterial({ color: 0x111827 }),
          );
          rotatingMarker.position.set(BASE_RADIUS, 0, 0);
          rotatingGroup.add(rotatingMarker);

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
