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

  const id = "skew-position-wrapper";

  onMount(() => {
    const wrapper = getThreeSceneWrapper(id);
    if (wrapper instanceof HTMLDivElement) {
      const handle = mountManagedThreeScene(wrapper, {
        cameraPosition: [3.8, 3.7, 7.4],
        cameraLookAt: [0.1, 1.6, 0.1],
        setup: ({ scene, trackResolutionTarget }) => {
          addReferencePlane(scene);

          const resolution = new THREE.Vector2(1, 1);

          const blackEndpoints = [
            new THREE.Vector3(-1.8, 1.2, -1.2),
            new THREE.Vector3(1.6, 2.0, -0.1),
          ];
          const redEndpoints = [
            new THREE.Vector3(-0.4, 2.3, 1.2),
            new THREE.Vector3(0.7, 0.9, -2.0),
          ];

          const blackGeometry = new LineGeometry();
          blackGeometry.setPositions([
            blackEndpoints[0].x,
            blackEndpoints[0].y,
            blackEndpoints[0].z,
            blackEndpoints[1].x,
            blackEndpoints[1].y,
            blackEndpoints[1].z,
          ]);

          const redGeometry = new LineGeometry();
          redGeometry.setPositions([
            redEndpoints[0].x,
            redEndpoints[0].y,
            redEndpoints[0].z,
            redEndpoints[1].x,
            redEndpoints[1].y,
            redEndpoints[1].z,
          ]);

          const blackLine = new Line2(
            blackGeometry,
            new LineMaterial({ color: 0x111827, linewidth: 3, resolution }),
          );
          const redLine = new Line2(
            redGeometry,
            new LineMaterial({ color: 0xef4444, linewidth: 3, resolution }),
          );
          redLine.position.set(0, -0.542, 0.291);

          scene.add(blackLine);
          scene.add(redLine);

          trackResolutionTarget(blackLine.material, redLine.material);
        },
      });

      return () => {
        handle.destroy();
      };
    }
  });
</script>

<ThreeSceneShell {id} {pixelRatioCapControlId} {antialiasControlId} />
