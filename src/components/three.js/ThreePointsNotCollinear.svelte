<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
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

  const id = "three-points-not-collinear-wrapper";

  onMount(() => {
    const wrapper = getThreeSceneWrapper(id);
    if (wrapper instanceof HTMLDivElement) {
      const handle = mountManagedThreeScene(wrapper, {
        cameraPosition: [5, 4.5, 5],
        cameraLookAt: [0, 0, 0],
        setup: ({ scene }) => {
          addReferencePlane(scene);

          const points = [
            new THREE.Vector3(-1.5, 0, -0.8),
            new THREE.Vector3(1.2, 0, -0.4),
            new THREE.Vector3(0.2, 0, 1.5),
          ];
          const markerGeometry = new THREE.SphereGeometry(0.06, 12, 8);
          const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0xdc2626,
          });
          for (const p of points) {
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.copy(p);
            scene.add(marker);
          }

          return undefined;
        },
      });

      return () => {
        handle.destroy();
      };
    }
  });
</script>

<ThreeSceneShell {id} {pixelRatioCapControlId} {antialiasControlId} />
