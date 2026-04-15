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
    getThreeSceneWrappers,
    mountManagedThreeScene,
  } from "./functions/three";

  let {
    pixelRatioCapControlId = "",
    antialiasControlId = "",
  }: {
    pixelRatioCapControlId?: string;
    antialiasControlId?: string;
  } = $props();

  const id = "two-lines-perpendicular-to-same-line-wrapper";

  onMount(() => {
    const wrappers = getThreeSceneWrappers(id);
    const handles: any[] = [];

    for (const wrapper of wrappers) {
      wrapper.dataset.pixelRatioCapControlId = pixelRatioCapControlId;
      wrapper.dataset.antialiasControlId = antialiasControlId;
      const handle = mountManagedThreeScene(wrapper, {
        cameraPosition: [4.8, 3.8, 7.6],
        cameraLookAt: [0, 0.8, 0],
        setup: ({ scene, trackResolutionTarget }) => {
          addReferencePlane(scene);

          const resolution = new THREE.Vector2(1, 1);

          const createLine = (
            start: THREE.Vector3,
            end: THREE.Vector3,
            color: number,
          ) => {
            const geometry = new LineGeometry();

            geometry.setPositions([
              start.x,
              start.y,
              start.z,
              end.x,
              end.y,
              end.z,
            ]);

            return new Line2(
              geometry,
              new LineMaterial({ color, linewidth: 3, resolution }),
            );
          };

          const blackLine = createLine(
            new THREE.Vector3(0, -1.8, 0),
            new THREE.Vector3(0, 2.6, 0),
            0x111827,
          );
          const redLine1 = createLine(
            new THREE.Vector3(-1.8, 0.8, 0),
            new THREE.Vector3(1.8, 0.8, 0),
            0xef4444,
          );

          const upperCenter = new THREE.Vector3(0, 1.65, 0);
          const upperDirection = new THREE.Vector3(0.9, 0, 1.5).normalize();
          const upperOffset = upperDirection.clone().multiplyScalar(1.8);
          const redLine2 = createLine(
            upperCenter.clone().sub(upperOffset),
            upperCenter.clone().add(upperOffset),
            0xef4444,
          );

          scene.add(blackLine);
          scene.add(redLine1);
          scene.add(redLine2);

          trackResolutionTarget(
            blackLine.material,
            redLine1.material,
            redLine2.material,
          );
        },
      });
      handles.push(handle);
    }

    return () => {
      handles.forEach((h) => h.destroy());
    };
  });
</script>

<ThreeSceneShell {id} {pixelRatioCapControlId} {antialiasControlId} />
