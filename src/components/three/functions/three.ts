import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";

const PERFORMANCE_PIXEL_RATIO_CAP = 1.25;
const DEFAULT_PIXEL_RATIO_CAP = 2;

type Vector3Tuple = [x: number, y: number, z: number];
type Vector3Input = Vector3Tuple | THREE.Vector3;

type ResolutionTarget = {
  resolution: {
    set: (width: number, height: number) => void;
  };
};

type ManagedThreeSceneContext = {
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
  cameraPosition: Vector3Input;
  cameraLookAt?: Vector3Input;
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

export function setSegment(
  geometry: LineGeometry,
  start: THREE.Vector3,
  end: THREE.Vector3,
) {
  geometry.setPositions([start.x, start.y, start.z, end.x, end.y, end.z]);
}

// Optimization: Pre-allocate array size for slightly better memory handling
export function createCirclePoints(radius: number, y: number, segments = 96) {
  const points = new Array<THREE.Vector3>(segments);

  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    points[index] = new THREE.Vector3(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius,
    );
  }

  return points;
}

// Improvement: Generic control getter reduces code duplication
function getControl(controlId: string, type: "checkbox" | "range") {
  const control = document.getElementById(controlId);
  if (!(control instanceof HTMLInputElement) || control.type !== type) {
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

function isCheckboxEnabled(controlId = "", fallback = false) {
  if (!controlId) return fallback;
  return getControl(controlId, "checkbox")?.checked ?? fallback;
}

function isPixelRatioCapEnabled(controlId = "") {
  return isCheckboxEnabled(controlId, false);
}

function isAntialiasEnabled(controlId = "") {
  return isCheckboxEnabled(controlId, true);
}

export function getRangeControlValue(controlId = "", fallback = 0) {
  if (!controlId) return fallback;
  return getNumericInputValue(getControl(controlId, "range"), fallback);
}

function setRendererPixelRatioCap(
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

function initializeThreeScene(
  wrapper: HTMLDivElement,
  setup: () => void | (() => void),
) {
  let observer: IntersectionObserver | null = null;
  let cleanup: (() => void) | undefined;

  const start = () => {
    if (wrapper.dataset.ready === "true") return;

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

  if (wrapper.dataset.ready === "true") return { remount, destroy };

  if (!("IntersectionObserver" in window)) {
    start();
    return { remount, destroy };
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) start();
    },
    { rootMargin: "160px 0px" },
  );

  observer.observe(wrapper);

  return { remount, destroy };
}

function createPreferenceAwareRenderer(
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

function applyVector3(
  camera: THREE.PerspectiveCamera,
  input: Vector3Input,
  method: "set" | "lookAt",
) {
  if (Array.isArray(input)) {
    if (method === "set") camera.position.set(...input);
    else camera.lookAt(...input);
  } else {
    if (method === "set") camera.position.copy(input);
    else camera.lookAt(input);
  }
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
    applyVector3(camera, options.cameraPosition, "set");
    if (options.cameraLookAt) {
      applyVector3(camera, options.cameraLookAt, "lookAt");
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = createPreferenceAwareRenderer(
        wrapper,
        pixelRatioCapControlId,
        antialiasControlId,
      );
    } catch (error) {
      console.warn("WebGL not supported or failed to initialize", error);
      return () => {};
    }

    const controls = new OrbitControls(camera, renderer.domElement);

    // Improvement: Using Sets ensures no duplicate hook registrations
    const cleanupCallbacks = new Set<() => void>();
    const renderHooks = new Set<() => void>();
    const resizeHooks = new Set<(width: number, height: number) => void>();
    const resolutionTargets = new Set<ResolutionTarget>();

    options.configureControls?.(controls);

    const render = () => {
      for (const renderHook of renderHooks) renderHook();
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
      addCleanup: (cleanup) => cleanupCallbacks.add(cleanup),
      addRenderHook: (renderHook) => renderHooks.add(renderHook),
      addResizeHook: (resizeHook) => resizeHooks.add(resizeHook),
      trackResolutionTarget: (...targets) => {
        targets.forEach((t) => resolutionTargets.add(t));
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
      () => sceneHandle?.remount(),
    );

    const resizeObserver = observeWrapperSize(wrapper, resize);

    return () => {
      controls.dispose();
      stopPixelRatioCapObserver?.();
      stopAntialiasObserver?.();
      resizeObserver.disconnect();

      for (const cleanup of cleanupCallbacks) cleanup();

      disposeSceneResources(scene);
      disposeRenderer(renderer);
    };
  };

  sceneHandle = initializeThreeScene(wrapper, mountScene);
  return sceneHandle;
}

function observeCheckboxPreference(
  controlId: string,
  onChange: (enabled: boolean) => void,
) {
  const control = getControl(controlId, "checkbox");
  if (!control) return null;

  const handleChange = () => onChange(control.checked);
  control.addEventListener("change", handleChange);

  return () => control.removeEventListener("change", handleChange);
}

function observePixelRatioCapPreference(
  controlId: string,
  onChange: (pixelRatioCapEnabled: boolean) => void,
) {
  return observeCheckboxPreference(controlId, onChange);
}

function observeAntialiasPreference(
  controlId: string,
  onChange: (antialias: boolean) => void,
) {
  return observeCheckboxPreference(controlId, onChange);
}

export function observeRangePreference(
  controlId: string,
  onChange: (value: number) => void,
) {
  const control = getControl(controlId, "range");
  if (!control) return null;

  const handleChange = () => onChange(getNumericInputValue(control, 0));
  control.addEventListener("input", handleChange);
  control.addEventListener("change", handleChange);

  return () => {
    control.removeEventListener("input", handleChange);
    control.removeEventListener("change", handleChange);
  };
}

function observeWrapperSize(
  wrapper: HTMLDivElement,
  onResize: (width: number, height: number) => void,
) {
  let previousWidth = 0;
  let previousHeight = 0;

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      // Using clientRect allows accurate CSS sub-pixel rendering considerations
      const bounds = entry.target.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));

      if (width === previousWidth && height === previousHeight) return;

      previousWidth = width;
      previousHeight = height;
      onResize(width, height);
    }
  });

  resizeObserver.observe(wrapper);
  return resizeObserver;
}

function disposeMaterial(
  material: THREE.Material | THREE.Material[] | undefined,
) {
  if (!material) return;
  const materials = Array.isArray(material) ? material : [material];

  for (const entry of materials) {
    entry.dispose();

    // Improvement: Also dispose of textures attached to the material (Prevents Memory Leaks)
    for (const key in entry) {
      const value = (entry as any)[key];
      if (
        value &&
        typeof value === "object" &&
        "minFilter" in value &&
        value.dispose
      ) {
        value.dispose();
      }
    }
  }
}

function disposeSceneResources(scene: THREE.Scene) {
  scene.traverse((object) => {
    const renderable = object as THREE.Mesh;
    if (renderable.geometry) renderable.geometry.dispose();
    if (renderable.material) disposeMaterial(renderable.material);
  });
}

function disposeRenderer(renderer: THREE.WebGLRenderer) {
  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement.remove();
}
