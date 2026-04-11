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

export function getAngleArcPath(
  a: Point,
  vertex: Point,
  b: Point,
  markerLimit = RIGHT_ANGLE_SIZE,
) {
  const markerRadius = Math.min(
    markerLimit,
    distance(vertex, a) * 0.3,
    distance(vertex, b) * 0.3,
  );

  if (markerRadius < 1) return "";

  const startAngle = Math.atan2(a.y - vertex.y, a.x - vertex.x);
  const endAngle = Math.atan2(b.y - vertex.y, b.x - vertex.x);
  let delta = endAngle - startAngle;

  if (delta <= -Math.PI) delta += Math.PI * 2;
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (Math.abs(delta) < 0.01) return "";

  const start = {
    x: vertex.x + Math.cos(startAngle) * markerRadius,
    y: vertex.y + Math.sin(startAngle) * markerRadius,
  };
  const end = {
    x: vertex.x + Math.cos(endAngle) * markerRadius,
    y: vertex.y + Math.sin(endAngle) * markerRadius,
  };
  const sweepFlag = delta > 0 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${markerRadius} ${markerRadius} 0 0 ${sweepFlag} ${end.x} ${end.y}`;
}

export function getAngleDegrees(a: Point, vertex: Point, b: Point) {
  const vectorA = {
    x: a.x - vertex.x,
    y: a.y - vertex.y,
  };
  const vectorB = {
    x: b.x - vertex.x,
    y: b.y - vertex.y,
  };
  const magnitude =
    Math.hypot(vectorA.x, vectorA.y) * Math.hypot(vectorB.x, vectorB.y);

  if (magnitude === 0) return 0;

  const cosine = (vectorA.x * vectorB.x + vectorA.y * vectorB.y) / magnitude;
  const clampedCosine = Math.max(-1, Math.min(1, cosine));

  return (Math.acos(clampedCosine) * 180) / Math.PI;
}

export function getAngleLabelPosition(
  a: Point,
  vertex: Point,
  b: Point,
  distanceFromVertex = RIGHT_ANGLE_SIZE + 26,
): Point {
  const toA = unitVector(vertex, a);
  const toB = unitVector(vertex, b);
  const bisector = {
    x: toA.x + toB.x,
    y: toA.y + toB.y,
  };
  const length = Math.hypot(bisector.x, bisector.y);

  if (length === 0) {
    return {
      x: vertex.x,
      y: vertex.y + distanceFromVertex,
    };
  }

  return {
    x: vertex.x + (bisector.x / length) * distanceFromVertex,
    y: vertex.y + (bisector.y / length) * distanceFromVertex,
  };
}
