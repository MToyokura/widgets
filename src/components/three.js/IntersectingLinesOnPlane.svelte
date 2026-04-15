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

  const id = "intersecting-lines-wrapper";

  onMount(() => {
    const wrapper = getThreeSceneWrapper(id);
    if (wrapper instanceof HTMLDivElement) {
      const handle = mountManagedThreeScene(wrapper, {
        cameraPosition: [5, 4.5, 5],
        cameraLookAt: [0, 0, 0],
        setup: ({ scene, trackResolutionTarget }) => {
          addReferencePlane(scene);

          const resolution = new THREE.Vector2(1, 1);
          const l1 = [
            new THREE.Vector3(-1.8, 0, -0.6),
            new THREE.Vector3(1.8, 0, 0.6),
          ];
          const l2 = [
            new THREE.Vector3(-1.1, 0, 1.3),
            new THREE.Vector3(1.1, 0, -1.3),
          ];
          const g1 = new LineGeometry();
          g1.setPositions([
            l1[0].x,
            l1[0].y,
            l1[0].z,
            l1[1].x,
            l1[1].y,
            l1[1].z,
          ]);
          const g2 = new LineGeometry();
          g2.setPositions([
            l2[0].x,
            l2[0].y,
            l2[0].z,
            l2[1].x,
            l2[1].y,
            l2[1].z,
          ]);
          const line1 = new Line2(
            g1,
            new LineMaterial({ color: 0x111827, linewidth: 3, resolution }),
          );
          const line2 = new Line2(
            g2,
            new LineMaterial({ color: 0x2563eb, linewidth: 3, resolution }),
          );
          scene.add(line1);
          scene.add(line2);

          trackResolutionTarget(line1.material, line2.material);
        },
      });

      return () => {
        handle.destroy();
      };
    }
  });
</script>

<ThreeSceneShell {id} {pixelRatioCapControlId} {antialiasControlId} />
