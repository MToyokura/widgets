import * as THREE from "three";

const LOW_POWER_PIXEL_RATIO = 1.25;
const STANDARD_PIXEL_RATIO = 2;

function getCheckboxControl(controlId: string) {
  const control = document.getElementById(controlId);

  if (!(control instanceof HTMLInputElement) || control.type !== "checkbox") {
    return null;
  }

  return control;
}

export function isCheckboxEnabled(controlId = "", fallback = false) {
  if (!controlId) {
    return fallback;
  }

  return getCheckboxControl(controlId)?.checked ?? fallback;
}

export function isLowPowerEnabled(controlId = "") {
  return isCheckboxEnabled(controlId, false);
}

export function isAntialiasEnabled(controlId = "") {
  return isCheckboxEnabled(controlId, true);
}

export function setRendererPerformanceMode(
  renderer: THREE.WebGLRenderer,
  lowPower: boolean,
) {
  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      lowPower ? LOW_POWER_PIXEL_RATIO : STANDARD_PIXEL_RATIO,
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

export function createLowPowerRenderer(
  wrapper: HTMLDivElement,
  lowPowerControlId = "",
  antialiasControlId = "",
) {
  const lowPower = isLowPowerEnabled(lowPowerControlId);
  const antialias = isAntialiasEnabled(antialiasControlId);
  const renderer = new THREE.WebGLRenderer({
    antialias,
    powerPreference: lowPower ? "low-power" : "default",
  });

  setRendererPerformanceMode(renderer, lowPower);
  wrapper.appendChild(renderer.domElement);

  return renderer;
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

export function observeLowPowerPreference(
  controlId: string,
  onChange: (lowPower: boolean) => void,
) {
  return observeCheckboxPreference(controlId, onChange);
}

export function observeAntialiasPreference(
  controlId: string,
  onChange: (antialias: boolean) => void,
) {
  return observeCheckboxPreference(controlId, onChange);
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
