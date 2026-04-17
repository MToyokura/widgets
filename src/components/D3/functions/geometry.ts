export interface Point {
  x: number;
  y: number;
}

const DEFAULT_ANGLE_MARKER_SIZE = 18;
const TWO_PI = Math.PI * 2;

// ==========================================
// 1. Core Math & Vector Geometry
// ==========================================

function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function unitVector(from: Point, to: Point): Point {
  const length = distance(from, to);
  if (length === 0) return { x: 0, y: 0 };

  return {
    x: (to.x - from.x) / length,
    y: (to.y - from.y) / length,
  };
}

export function getCentroid(points: Point[]): Point {
  const len = points.length;
  if (len === 0) return { x: 0, y: 0 };

  let x = 0;
  let y = 0;

  for (const point of points) {
    x += point.x;
    y += point.y;
  }

  return { x: x / len, y: y / len };
}

export function addPoints(...points: Point[]): Point {
  return points.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
    { x: 0, y: 0 },
  );
}

// ==========================================
// 2. Transformations
// ==========================================

export function translatePoint(point: Point, offset: Point): Point {
  return {
    x: point.x + offset.x,
    y: point.y + offset.y,
  };
}

export function getPointerAngle(point: Point, center: Point): number {
  return Math.atan2(point.y - center.y, point.x - center.x);
}

export function rotatePoint(point: Point, center: Point, angle: number): Point {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);

  return {
    x: center.x + dx * cosAngle - dy * sinAngle,
    y: center.y + dx * sinAngle + dy * cosAngle,
  };
}

export function reflectPointAcrossLine(
  point: Point,
  linePoint: Point,
  lineAngle: number,
): Point {
  const dx = point.x - linePoint.x;
  const dy = point.y - linePoint.y;
  const ux = Math.cos(lineAngle);
  const uy = Math.sin(lineAngle);

  const parallelMagnitude = dx * ux + dy * uy;
  const parallelX = ux * parallelMagnitude;
  const parallelY = uy * parallelMagnitude;

  const perpendicularX = dx - parallelX;
  const perpendicularY = dy - parallelY;

  return {
    x: linePoint.x + parallelX - perpendicularX,
    y: linePoint.y + parallelY - perpendicularY,
  };
}

export function getOppositePoint(point: Point, center: Point): Point {
  return {
    x: center.x - (point.x - center.x),
    y: center.y - (point.y - center.y),
  };
}

// ==========================================
// 3. Simple SVG Path Generators
// ==========================================

export function getLinePath(start: Point, end: Point): string {
  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
}

export function getLinePathThroughPoint(
  point: Point,
  angle: number,
  halfLength: number,
): string {
  const dx = Math.cos(angle) * halfLength;
  const dy = Math.sin(angle) * halfLength;

  return getLinePath(
    { x: point.x - dx, y: point.y - dy },
    { x: point.x + dx, y: point.y + dy },
  );
}

function getPolylinePath(points: Point[]): string {
  if (points.length === 0) return "";

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

export function getPolygonPath(points: Point[]): string {
  if (points.length === 0) return "";
  return `${getPolylinePath(points)} Z`;
}

export function getTrianglePath(p1: Point, p2: Point, p3: Point): string {
  return getPolygonPath([p1, p2, p3]);
}

export function getConnectorPath(
  originalPoints: Point[],
  transformedPoints: Point[],
): string {
  return originalPoints
    .map((point, index) => {
      const transformedPoint = transformedPoints[index];
      return transformedPoint ? getLinePath(point, transformedPoint) : "";
    })
    .filter(Boolean)
    .join(" ");
}

export function getInscribedLinesPath(
  a: Point,
  b: Point,
  vertex: Point,
): string {
  return `${getLinePath(vertex, a)} ${getLinePath(vertex, b)}`;
}

export function getCentralLinesPath(a: Point, vertex: Point, b: Point): string {
  return getPolylinePath([a, vertex, b]);
}

// ==========================================
// 4. Arcs & Circles
// ==========================================

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

export function getSignedMinorAngleDelta(
  startAngle: number,
  endAngle: number,
): number {
  let delta = (endAngle - startAngle) % TWO_PI;
  if (delta <= -Math.PI) delta += TWO_PI;
  if (delta > Math.PI) delta -= TWO_PI;
  return delta;
}

export function getCircleArcPath(
  center: Point,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const delta = getSignedMinorAngleDelta(startAngle, endAngle);

  if (Math.abs(delta) < 0.01) return "";

  const start = getPointOnCircle(center, radius, startAngle);
  const end = getPointOnCircle(center, radius, endAngle);
  const sweepFlag = delta > 0 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 ${sweepFlag} ${end.x} ${end.y}`;
}

export function getAngleArcPath(
  a: Point,
  vertex: Point,
  b: Point,
  markerLimit = DEFAULT_ANGLE_MARKER_SIZE,
): string {
  const markerRadius = Math.min(
    markerLimit,
    distance(vertex, a) * 0.3,
    distance(vertex, b) * 0.3,
  );

  if (markerRadius < 1) return "";

  const startAngle = Math.atan2(a.y - vertex.y, a.x - vertex.x);
  const endAngle = Math.atan2(b.y - vertex.y, b.x - vertex.x);

  return getCircleArcPath(vertex, markerRadius, startAngle, endAngle);
}

export function getRightAnglePath(
  a: Point,
  b: Point,
  vertex: Point,
  markerLimit = DEFAULT_ANGLE_MARKER_SIZE,
): string {
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

function getCounterclockwiseDelta(
  startAngle: number,
  endAngle: number,
): number {
  return (((endAngle - startAngle) % TWO_PI) + TWO_PI) % TWO_PI;
}

function getArcSignedDeltaExcludingAngle(
  startAngle: number,
  endAngle: number,
  excludedAngle: number,
): number {
  const ccwDelta = getCounterclockwiseDelta(startAngle, endAngle);

  if (ccwDelta < 0.01 || Math.abs(ccwDelta - TWO_PI) < 0.01) return 0;

  const excludedDelta = getCounterclockwiseDelta(startAngle, excludedAngle);
  const excludedOnCounterclockwiseArc =
    excludedDelta > 0.01 && excludedDelta < ccwDelta - 0.01;

  return excludedOnCounterclockwiseArc ? ccwDelta - TWO_PI : ccwDelta;
}

export function getCircleArcPathExcludingAngle(
  center: Point,
  radius: number,
  startAngle: number,
  endAngle: number,
  excludedAngle: number,
): string {
  const signedDelta = getArcSignedDeltaExcludingAngle(
    startAngle,
    endAngle,
    excludedAngle,
  );

  if (Math.abs(signedDelta) < 0.01) return "";

  const start = getPointOnCircle(center, radius, startAngle);
  const end = getPointOnCircle(center, radius, endAngle);
  const largeArcFlag = Math.abs(signedDelta) > Math.PI ? 1 : 0;
  const sweepFlag = signedDelta > 0 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
}

export function getCentralAngleArcPath(
  center: Point,
  startAngle: number,
  endAngle: number,
  excludedAngle: number,
  markerRadius = DEFAULT_ANGLE_MARKER_SIZE,
): string {
  return getCircleArcPathExcludingAngle(
    center,
    markerRadius,
    startAngle,
    endAngle,
    excludedAngle,
  );
}

// ==========================================
// 5. Angle Utilities & Labels
// ==========================================

export function getCentralAngleDegrees(
  startAngle: number,
  endAngle: number,
  excludedAngle: number,
): number {
  return (
    (Math.abs(
      getArcSignedDeltaExcludingAngle(startAngle, endAngle, excludedAngle),
    ) *
      180) /
    Math.PI
  );
}

export function getAngleDegrees(a: Point, vertex: Point, b: Point): number {
  if (distance(vertex, a) === 0 || distance(vertex, b) === 0) return 0;

  const vA = unitVector(vertex, a);
  const vB = unitVector(vertex, b);
  const cosine = vA.x * vB.x + vA.y * vB.y;

  const clampedCosine = Math.max(-1, Math.min(1, cosine));

  return (Math.acos(clampedCosine) * 180) / Math.PI;
}

export function getRadialLabelPosition(
  point: Point,
  center: Point,
  offset = 24,
): Point {
  const direction = unitVector(center, point);

  return {
    x: point.x + direction.x * offset,
    y: point.y + direction.y * offset,
  };
}

export function getCentralAngleLabelPosition(
  center: Point,
  startAngle: number,
  endAngle: number,
  excludedAngle: number,
  distanceFromCenter = 44,
): Point {
  const signedDelta = getArcSignedDeltaExcludingAngle(
    startAngle,
    endAngle,
    excludedAngle,
  );
  const midpointAngle = startAngle + signedDelta / 2;

  return getPointOnCircle(center, distanceFromCenter, midpointAngle);
}

export function getAngleLabelPosition(
  a: Point,
  vertex: Point,
  b: Point,
  distanceFromVertex = DEFAULT_ANGLE_MARKER_SIZE + 26,
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

export function getDoubleAngleDotPositions(
  a: Point,
  vertex: Point,
  b: Point,
  distanceFromVertex = 18,
  spacing = 10,
  dotRadius = 4,
): [Point, Point] {
  const midpoint = getAngleLabelPosition(a, vertex, b, distanceFromVertex);
  const dx = midpoint.x - vertex.x;
  const dy = midpoint.y - vertex.y;
  const directionLength = Math.hypot(dx, dy) || 1;

  const minimumSpacing = Math.min(spacing, Math.max(3, dotRadius * 0.5));

  const offsetX = (dx / directionLength) * minimumSpacing;
  const offsetY = (dy / directionLength) * minimumSpacing;

  return [
    { x: midpoint.x + offsetX, y: midpoint.y + offsetY },
    { x: midpoint.x - offsetX, y: midpoint.y - offsetY },
  ];
}
