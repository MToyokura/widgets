export type Point = { x: number; y: number };

export const RIGHT_ANGLE_SIZE = 18;

export function distance(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function unitVector(from: Point, to: Point) {
  const length = distance(from, to);

  if (length === 0) return { x: 0, y: 0 };

  return {
    x: (to.x - from.x) / length,
    y: (to.y - from.y) / length,
  };
}

export function getTrianglePath(p1: Point, p2: Point, p3: Point) {
  return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} Z`;
}

export function getPointOnCircle(
  center: Point,
  radius: number,
  angle: number,
): Point {
  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle),
  };
}

export function projectPointToCircle(
  center: Point,
  radius: number,
  point: Point,
): Point {
  const angle = Math.atan2(point.y - center.y, point.x - center.x);

  return getPointOnCircle(center, radius, angle);
}

export function getRightAnglePath(
  a: Point,
  b: Point,
  vertex: Point,
  markerLimit = RIGHT_ANGLE_SIZE,
) {
  const markerSize = Math.min(
    markerLimit,
    distance(vertex, a) * 0.35,
    distance(vertex, b) * 0.35,
  );

  if (markerSize < 1) return "";

  const toA = unitVector(vertex, a);
  const toB = unitVector(vertex, b);
  const cornerA = {
    x: vertex.x + toA.x * markerSize,
    y: vertex.y + toA.y * markerSize,
  };
  const cornerB = {
    x: cornerA.x + toB.x * markerSize,
    y: cornerA.y + toB.y * markerSize,
  };
  const cornerC = {
    x: vertex.x + toB.x * markerSize,
    y: vertex.y + toB.y * markerSize,
  };

  return `M ${cornerA.x} ${cornerA.y} L ${cornerB.x} ${cornerB.y} L ${cornerC.x} ${cornerC.y}`;
}
