
// utils/coordinateConversion.js - Utility for coordinate system conversion
import proj4 from 'proj4';

// Define the projections for Morocco Lambert zones
// Note: These are example definitions and need to be adjusted for actual Morocco projections
const projections = {
  // Lambert Zone 1 (Morocco)
  1: '+proj=lcc +lat_1=33.3 +lat_0=33.3 +lon_0=-5.4 +k_0=0.999625 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356515 +units=m +no_defs',
  // Lambert Zone 2
  2: '+proj=lcc +lat_1=31.73 +lat_0=31.73 +lon_0=-5.4 +k_0=0.999615 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356515 +units=m +no_defs',
  // Lambert Zone 3
  3: '+proj=lcc +lat_1=29.7 +lat_0=29.7 +lon_0=-5.4 +k_0=0.999616 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356515 +units=m +no_defs',
  // Lambert Zone 4
  4: '+proj=lcc +lat_1=26.1 +lat_0=26.1 +lon_0=-5.4 +k_0=0.999616 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356515 +units=m +no_defs',
  // WGS84
  wgs84: '+proj=longlat +datum=WGS84 +no_defs'
};

// Convert from Lambert projected coordinates to WGS84 (lat/lng) for a specific zone
const lambertToWGS84 = (x, y, zoneNumber) => {
  if (!projections[zoneNumber]) {
    throw new Error(`Unsupported projection zone: ${zoneNumber}`);
  }
  
  const result = proj4(projections[zoneNumber], projections.wgs84, [x, y]);
  return { longitude: result[0], latitude: result[1] };
};

// Convert from WGS84 to Lambert projected coordinates for a specific zone
const wgs84ToLambert = (longitude, latitude, zoneNumber) => {
  if (!projections[zoneNumber]) {
    throw new Error(`Unsupported projection zone: ${zoneNumber}`);
  }
  
  const result = proj4(projections.wgs84, projections[zoneNumber], [longitude, latitude]);
  return { x: result[0], y: result[1] };
};

export const convertCoordinates = {
  lambertToWGS84,
  wgs84ToLambert
};

export default convertCoordinates;
