import {
  CekerEdge,
  CEKER_EDGES_EAST,
  CEKER_EDGES_WEST,
  LocoType,
  ROUTE_ESKISEHIR_HALKALI,
  ROUTE_HALKALI_ESKISEHIR
} from './ceker-data';

export type CekerResult = {
  success: true;
  direction: 'WEST' | 'EAST'; // WEST = Eskişehir -> Halkalı, EAST = Halkalı -> Eskişehir
  stations: string[];
  edges: CekerEdge[];
  limitingEdge: CekerEdge;
  minTonnage: number;
} | {
  success: false;
  error: 'same_station' | 'undefined_route' | 'invalid_station';
};

export function resolveCekerRoute(start: string, end: string, loco: LocoType): CekerResult {
  if (start === end) {
    return { success: false, error: 'same_station' };
  }

  // Determine direction from manual arrays
  let direction: 'WEST' | 'EAST' | null = null;
  let activeRoute: string[] = [];
  let activeEdges: CekerEdge[] = [];

  const westStartIdx = ROUTE_ESKISEHIR_HALKALI.indexOf(start);
  const westEndIdx = ROUTE_ESKISEHIR_HALKALI.indexOf(end);

  const eastStartIdx = ROUTE_HALKALI_ESKISEHIR.indexOf(start);
  const eastEndIdx = ROUTE_HALKALI_ESKISEHIR.indexOf(end);

  if (westStartIdx !== -1 && westEndIdx !== -1 && westStartIdx < westEndIdx) {
    direction = 'WEST';
    activeRoute = ROUTE_ESKISEHIR_HALKALI;
    activeEdges = CEKER_EDGES_WEST;
  } else if (eastStartIdx !== -1 && eastEndIdx !== -1 && eastStartIdx < eastEndIdx) {
    direction = 'EAST';
    activeRoute = ROUTE_HALKALI_ESKISEHIR;
    activeEdges = CEKER_EDGES_EAST;
  }

  if (!direction) {
    return { success: false, error: 'invalid_station' };
  }

  const startIdx = activeRoute.indexOf(start);
  const endIdx = activeRoute.indexOf(end);
  const pathStations = activeRoute.slice(startIdx, endIdx + 1);

  // First, check if there is a single edge covering the entire selected route
  let coveringRoutes: CekerEdge[] = [];
  for (const edge of activeEdges) {
    const rs = activeRoute.indexOf(edge.from);
    const re = activeRoute.indexOf(edge.to);
    if (rs !== -1 && re !== -1 && rs <= startIdx && re >= endIdx) {
      coveringRoutes.push(edge);
    }
  }

  if (coveringRoutes.length > 0) {
    // If multiple cover, pick the one with smallest span to be more specific, mimicking legacy sort behavior:
    // covering_routes.sort(key=lambda x: abs(MR_NORM.index(x['to']) - MR_NORM.index(x['from'])))
    coveringRoutes.sort((a, b) => {
      const spanA = activeRoute.indexOf(a.to) - activeRoute.indexOf(a.from);
      const spanB = activeRoute.indexOf(b.to) - activeRoute.indexOf(b.from);
      return spanA - spanB;
    });
    
    const edge = coveringRoutes[0];
    return {
      success: true,
      direction,
      stations: pathStations,
      edges: [edge],
      limitingEdge: edge,
      minTonnage: edge.limits[loco]
    };
  }

  // Step-by-step resolution mimicking legacy `while current_idx != end_idx:`
  const usedEdges: CekerEdge[] = [];
  let currentIdx = startIdx;

  while (currentIdx < endIdx) {
    const nextIdx = currentIdx + 1;
    let foundEdge: CekerEdge | null = null;

    for (const edge of activeEdges) {
      const rs = activeRoute.indexOf(edge.from);
      const re = activeRoute.indexOf(edge.to);
      if (rs !== -1 && re !== -1 && rs <= currentIdx && re >= nextIdx) {
        foundEdge = edge;
        break; // found a covering edge for this tiny step
      }
    }

    if (!foundEdge) {
      // Gap detected!
      return { success: false, error: 'undefined_route' };
    }

    if (!usedEdges.includes(foundEdge)) {
      usedEdges.push(foundEdge);
    }
    
    currentIdx = nextIdx;
  }

  if (usedEdges.length === 0) {
    return { success: false, error: 'undefined_route' };
  }

  // Calculate limiting section
  let minTonnage = Infinity;
  let limitingEdge = usedEdges[0];

  for (const edge of usedEdges) {
    const val = edge.limits[loco];
    if (val < minTonnage) {
      minTonnage = val;
      limitingEdge = edge;
    }
  }

  return {
    success: true,
    direction,
    stations: pathStations,
    edges: usedEdges,
    limitingEdge,
    minTonnage
  };
}
