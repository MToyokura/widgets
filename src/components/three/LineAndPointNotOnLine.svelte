<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { Line2 } from "three/addons/lines/Line2.js";
  import { LineGeometry } from "three/addons/lines/LineGeometry.js";
  import { LineMaterial } from "three/addons/lines/LineMaterial.js";
  import ThreeSceneShell from "./shared/ThreeSceneShell.svelte";
  import {
    addReferencePlane,
    getThreeSceneWrapper,
    mountManagedThreeScene,
  } from "./functions/three";

  let {
    pixelRatioCapControlId = "",
    antialiasControlId = "",
  }: {
    pixelRatioCapControlId?: string;
    antialiasControlId?: string;
  } = $props();

  const id = "line-and-point-not-on-line-wrapper";

  onMount(() => {
    const wrapper = getThreeSceneWrapper(id);
    if (wrapper instanceof HTMLDivElement) {
      const handle = mountManagedThreeScene(wrapper, {
        cameraPosition: [5, 4.5, 5],
        cameraLookAt: [0, 0, 0],
        setup: ({ scene, trackResolutionTarget }) => {
          addReferencePlane(scene);

          const resolution = new THREE.Vector2(1, 1);
          const point = new THREE.Vector3(0.2, 0, 1.5);
          const linePts = [
            new THREE.Vector3(-1.7, 0, -0.8),
            new THREE.Vector3(1.7, 0, 0.7),
          ];
          const lineGeometry = new LineGeometry();
          lineGeometry.setPositions([
            linePts[0].x,
            linePts[0].y,
            linePts[0].z,
            linePts[1].x,
            linePts[1].y,
            linePts[1].z,
          ]);
          const line = new Line2(
            lineGeometry,
            new LineMaterial({ color: 0x111827, linewidth: 3, resolution }),
          );
          scene.add(line);
          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 12, 8),
            new THREE.MeshBasicMaterial({ color: 0xdc2626 }),
          );
          sphere.position.copy(point);
          scene.add(sphere);

          trackResolutionTarget(line.material);
        },
      });

      return () => {
        handle.destroy();
      };
    }
  });
</script>

<ThreeSceneShell {id} {pixelRatioCapControlId} {antialiasControlId} />
