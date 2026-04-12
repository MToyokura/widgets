import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const PERFORMANCE_PIXEL_RATIO_CAP = 1.25;
const DEFAULT_PIXEL_RATIO_CAP = 2;

type Vector3Tuple = [x: number, y: number, z: number];

type ResolutionTarget = {
  resolution: {
    set: (width: number, height: number) => void;
  };
};

export type ManagedThreeSceneContext = {
  wrapper: HTMLDivElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  pixelRatioCapControlId: string;
  antialiasControlId: string;
  addCleanup: (cleanup: () => void) => void;
  addRenderHook: (renderHook: () => void) => void;
  addResizeHook: (resizeHook: (width: number, height: number) => void) => void;
  trackResolutionTarget: (...targets: ResolutionTarget[]) => void;
  render: () => void;
};

type ManagedThreeSceneOptions = {
  background?: THREE.ColorRepresentation;
  cameraPosition: Vector3Tuple;
  cameraLookAt?: Vector3Tuple;
  configureControls?: (controls: OrbitControls) => void;
  setup: (context: ManagedThreeSceneContext) => void;
};

type ReferencePlaneOptions = {
  size?: number;
  segments?: number;
  planeColor?: THREE.ColorRepresentation;
  opacity?: number;
  gridColor?: THREE.ColorRepresentation;
  gridSecondaryColor?: THREE.ColorRepresentation;
};

const THREE_SCENE_WRAPPER_CLASS = ".threejs-viz";

function getCheckboxControl(controlId: string) {
  const control = document.getElementById(controlId);

  if (!(control instanceof HTMLInputElement) || control.type !== "checkbox") {
    return null;
  }

  return control;
}

function getRangeControl(controlId: string) {
  const control = document.getElementById(controlId);

  if (!(control instanceof HTMLInputElement) || control.type !== "range") {
    return null;
  }

  return control;
}

function getNumericInputValue(
  control: HTMLInputElement | null,
  fallback: number,
) {
  const value = Number(control?.value ?? Number.NaN);

  return Number.isFinite(value) ? value : fallback;
}

export function getThreeSceneWrapper(containerId: string) {
  const wrapper = document.querySelector(
    `#${containerId} ${THREE_SCENE_WRAPPER_CLASS}`,
  );

  return wrapper instanceof HTMLDivElement ? wrapper : null;
}

export function getThreeSceneWrappers(containerId: string) {
  return Array.from(
    document.querySelectorAll(`#${containerId} ${THREE_SCENE_WRAPPER_CLASS}`),
  ).filter(
    (wrapper): wrapper is HTMLDivElement => wrapper instanceof HTMLDivElement,
  );
}

export function isCheckboxEnabled(controlId = "", fallback = false) {
  if (!controlId) {
    return fallback;
  }

  return getCheckboxControl(controlId)?.checked ?? fallback;
}

export function isPixelRatioCapEnabled(controlId = "") {
  return isCheckboxEnabled(controlId, false);
}

export function isAntialiasEnabled(controlId = "") {
  return isCheckboxEnabled(controlId, true);
}

export function getRangeControlValue(controlId = "", fallback = 0) {
  if (!controlId) {
    return fallback;
  }

  return getNumericInputValue(getRangeControl(controlId), fallback);
}

export function setRendererPixelRatioCap(
  renderer: THREE.WebGLRenderer,
  pixelRatioCapEnabled: boolean,
) {
  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      pixelRatioCapEnabled
        ? PERFORMANCE_PIXEL_RATIO_CAP
        : DEFAULT_PIXEL_RATIO_CAP,
    ),
  );
}

export function initializeThreeScene(
  wrapper: HTMLDivElement,
  setup: () => void | (() => void),
) {
  let observer: IntersectionObserver | null = null;
  let cleanup: (() => void) | undefined;

  const start = () => {
    if (wrapper.dataset.ready === "true") {
      return;
    }

    wrapper.dataset.ready = "true";
    observer?.disconnect();
    observer = null;
    cleanup = setup() ?? undefined;
  };

  const clear = () => {
    cleanup?.();
    cleanup = undefined;
    wrapper.replaceChildren();
    delete wrapper.dataset.ready;
  };

  const remount = () => {
    clear();
    start();
  };

  const destroy = () => {
    observer?.disconnect();
    observer = null;

    if (wrapper.dataset.ready === "true") {
      clear();
    }
  };

  if (wrapper.dataset.ready === "true") {
    return { remount, destroy };
  }

  if (!("IntersectionObserver" in window)) {
    start();
    return { remount, destroy };
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        start();
      }
    },
    { rootMargin: "160px 0px" },
  );

  observer.observe(wrapper);

  return { remount, destroy };
}

export function createPreferenceAwareRenderer(
  wrapper: HTMLDivElement,
  pixelRatioCapControlId = "",
  antialiasControlId = "",
) {
  const pixelRatioCapEnabled = isPixelRatioCapEnabled(pixelRatioCapControlId);
  const antialiasEnabled = isAntialiasEnabled(antialiasControlId);
  const renderer = new THREE.WebGLRenderer({
    antialias: antialiasEnabled,
    powerPreference: pixelRatioCapEnabled ? "low-power" : "default",
  });

  setRendererPixelRatioCap(renderer, pixelRatioCapEnabled);
  wrapper.appendChild(renderer.domElement);

  return renderer;
}

export function addReferencePlane(
  scene: THREE.Scene,
  options: ReferencePlaneOptions = {},
) {
  const size = options.size ?? 4.4;
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({
      color: options.planeColor ?? 0xf8fafc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: options.opacity ?? 0.5,
    }),
  );

  plane.rotation.x = -Math.PI / 2;

  const grid = new THREE.GridHelper(
    size,
    options.segments ?? 8,
    options.gridColor ?? 0x94a3b8,
    options.gridSecondaryColor ?? 0xcbd5e1,
  );

  scene.add(plane);
  scene.add(grid);

  return { plane, grid };
}

export function mountManagedThreeScene(
  wrapper: HTMLDivElement,
  options: ManagedThreeSceneOptions,
) {
  let sceneHandle: ReturnType<typeof initializeThreeScene> | undefined;

  const mountScene = () => {
    const pixelRatioCapControlId = wrapper.dataset.pixelRatioCapControlId || "";
    const antialiasControlId = wrapper.dataset.antialiasControlId || "";
    const scene = new THREE.Scene();

    scene.background = new THREE.Color(options.background ?? 0xe0e0e0);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(...options.cameraPosition);

    if (options.cameraLookAt) {
      camera.lookAt(...options.cameraLookAt);
    }

    const renderer = createPreferenceAwareRenderer(
      wrapper,
      pixelRatioCapControlId,
      antialiasControlId,
    );
    const controls = new OrbitControls(camera, renderer.domElement);
    const cleanupCallbacks: Array<() => void> = [];
    const renderHooks: Array<() => void> = [];
    const resizeHooks: Array<(width: number, height: number) => void> = [];
    const resolutionTargets: ResolutionTarget[] = [];

    options.configureControls?.(controls);

    const render = () => {
      for (const renderHook of renderHooks) {
        renderHook();
      }

      renderer.render(scene, camera);
    };

    options.setup({
      wrapper,
      scene,
      camera,
      renderer,
      controls,
      pixelRatioCapControlId,
      antialiasControlId,
      addCleanup: (cleanup) => {
        cleanupCallbacks.push(cleanup);
      },
      addRenderHook: (renderHook) => {
        renderHooks.push(renderHook);
      },
      addResizeHook: (resizeHook) => {
        resizeHooks.push(resizeHook);
      },
      trackResolutionTarget: (...targets) => {
        resolutionTargets.push(...targets);
      },
      render,
    });

    const resize = (width: number, height: number) => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);

      for (const target of resolutionTargets) {
        target.resolution.set(width, height);
      }

      for (const resizeHook of resizeHooks) {
        resizeHook(width, height);
      }

      render();
    };

    controls.addEventListener("change", render);

    const stopPixelRatioCapObserver = observePixelRatioCapPreference(
      pixelRatioCapControlId,
      (pixelRatioCapEnabled) => {
        setRendererPixelRatioCap(renderer, pixelRatioCapEnabled);
        render();
      },
    );
    const stopAntialiasObserver = observeAntialiasPreference(
      antialiasControlId,
      () => {
        sceneHandle?.remount();
      },
    );
    const resizeObserver = observeWrapperSize(wrapper, resize);

    return () => {
      controls.dispose();
      stopPixelRatioCapObserver?.();
      stopAntialiasObserver?.();
      resizeObserver.disconnect();

      for (let index = cleanupCallbacks.length - 1; index >= 0; index -= 1) {
        cleanupCallbacks[index]();
      }

      disposeSceneResources(scene);
      disposeRenderer(renderer);
    };
  };

  sceneHandle = initializeThreeScene(wrapper, mountScene);

  return sceneHandle;
}

export function observeCheckboxPreference(
  controlId: string,
  onChange: (enabled: boolean) => void,
) {
  const control = getCheckboxControl(controlId);

  if (!control) {
    return null;
  }

  const handleChange = () => {
    onChange(control.checked);
  };

  control.addEventListener("change", handleChange);

  return () => {
    control.removeEventListener("change", handleChange);
  };
}

export function observePixelRatioCapPreference(
  controlId: string,
  onChange: (pixelRatioCapEnabled: boolean) => void,
) {
  return observeCheckboxPreference(controlId, onChange);
}

export function observeAntialiasPreference(
  controlId: string,
  onChange: (antialias: boolean) => void,
) {
  return observeCheckboxPreference(controlId, onChange);
}

export function observeRangePreference(
  controlId: string,
  onChange: (value: number) => void,
) {
  const control = getRangeControl(controlId);

  if (!control) {
    return null;
  }

  const handleChange = () => {
    onChange(getNumericInputValue(control, 0));
  };

  control.addEventListener("input", handleChange);
  control.addEventListener("change", handleChange);

  return () => {
    control.removeEventListener("input", handleChange);
    control.removeEventListener("change", handleChange);
  };
}

export function observeWrapperSize(
  wrapper: HTMLDivElement,
  onResize: (width: number, height: number) => void,
) {
  let previousWidth = 0;
  let previousHeight = 0;

  const resize = () => {
    const bounds = wrapper.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));

    if (width === previousWidth && height === previousHeight) {
      return;
    }

    previousWidth = width;
    previousHeight = height;
    onResize(width, height);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(wrapper);
  requestAnimationFrame(resize);

  return resizeObserver;
}

function disposeMaterial(
  material: THREE.Material | THREE.Material[] | undefined,
) {
  if (Array.isArray(material)) {
    for (const entry of material) {
      entry.dispose();
    }
    return;
  }

  material?.dispose();
}

export function disposeSceneResources(scene: THREE.Scene) {
  scene.traverse((object) => {
    const renderable = object as THREE.Object3D & {
      geometry?: { dispose?: () => void };
      material?: THREE.Material | THREE.Material[];
    };

    renderable.geometry?.dispose?.();
    disposeMaterial(renderable.material);
  });
}

export function disposeRenderer(renderer: THREE.WebGLRenderer) {
  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement.remove();
}
