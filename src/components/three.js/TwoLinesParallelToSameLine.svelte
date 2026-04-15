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

  const id = "two-lines-parallel-to-same-line-wrapper";

  onMount(() => {
    const wrappers = getThreeSceneWrappers(id);
    const handles: any[] = [];

    for (const wrapper of wrappers) {
      wrapper.dataset.pixelRatioCapControlId = pixelRatioCapControlId;
      wrapper.dataset.antialiasControlId = antialiasControlId;
      const handle = mountManagedThreeScene(wrapper, {
        cameraPosition: [4.2, 3.6, 7.4],
        cameraLookAt: [0, 1.3, 0],
        setup: ({ scene, trackResolutionTarget }) => {
          addReferencePlane(scene);

          const resolution = new THREE.Vector2(1, 1);
          const direction = new THREE.Vector3(2.1, 0.8, 1.0).normalize();
          const planeNormal = new THREE.Vector3(0.4, -1, 0.3).normalize();
          const separationAxis = new THREE.Vector3()
            .crossVectors(planeNormal, direction)
            .normalize();
          const halfLength = 1.9;
          const offset = direction.clone().multiplyScalar(halfLength);
          const centers = [
            new THREE.Vector3(0, 1.35, 0),
            new THREE.Vector3(0, 1.35, 0)
              .add(separationAxis.clone().multiplyScalar(0.95))
              .add(planeNormal.clone().multiplyScalar(-0.6)),
            new THREE.Vector3(0, 1.35, 0)
              .add(separationAxis.clone().multiplyScalar(-0.95))
              .add(planeNormal.clone().multiplyScalar(-0.6)),
          ];
          const colors = [0x111827, 0xef4444, 0xef4444];
          const materials: any[] = [];

          for (let index = 0; index < centers.length; index += 1) {
            const geometry = new LineGeometry();
            geometry.setPositions([
              -offset.x,
              -offset.y,
              -offset.z,
              offset.x,
              offset.y,
              offset.z,
            ]);

            const line = new Line2(
              geometry,
              new LineMaterial({
                color: colors[index],
                linewidth: 3,
                resolution,
              }),
            );
            const group = new THREE.Group();

            group.position.copy(centers[index]);
            group.add(line);
            scene.add(group);
            materials.push(line.material);
          }

          trackResolutionTarget(...materials);

          // Add 3 translucent planes
          const planeGeometry = new THREE.PlaneGeometry(3.8, 3.8);
          const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.2,
            depthWrite: false,
          });

          const plane1 = new THREE.Mesh(planeGeometry, planeMaterial);
          plane1.position.copy(
            centers[0].clone().add(centers[1]).multiplyScalar(0.5),
          );
          plane1.lookAt(
            plane1.position
              .clone()
              .add(direction.clone().cross(centers[1].clone().sub(centers[0]))),
          );
          scene.add(plane1);

          const plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
          plane2.position.copy(
            centers[0].clone().add(centers[2]).multiplyScalar(0.5),
          );
          plane2.lookAt(
            plane2.position
              .clone()
              .add(direction.clone().cross(centers[2].clone().sub(centers[0]))),
          );
          scene.add(plane2);

          const plane3 = new THREE.Mesh(planeGeometry, planeMaterial);
          plane3.position.copy(
            centers[1].clone().add(centers[2]).multiplyScalar(0.5),
          );
          plane3.lookAt(
            plane3.position
              .clone()
              .add(direction.clone().cross(centers[2].clone().sub(centers[1]))),
          );
          scene.add(plane3);
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
