import { point, featureCollection, lineString } from "@turf/helpers";

export const pointToPoint = toConvert => {
  const asFeature = point(toConvert.coordinates);
  return { ...asFeature, properties: toConvert };
};

export const pointsToFeatureCollection = points => {
  if (!points.length) return featureCollection([]);
  return featureCollection(points.map(p => pointToPoint(p)));
};

export const trailToLine = toConvert => {
  const asFeature = lineString(toConvert.points.map(p => p.coordinates));
  return { ...asFeature, properties: toConvert };
};

export const trailsToFeatureCollection = trails => {
  if (!trails.length) return featureCollection([]);
  return featureCollection(trails.map(t => trailToLine(t)));
};
