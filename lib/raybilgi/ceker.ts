import {
  CekerEdge,
  CEKER_EDGES_EAST,
  CEKER_EDGES_WEST,
  LocoType,
  ROUTE_ESKISEHIR_HALKALI,
  ROUTE_HALKALI_ESKISEHIR,
  CEKER_LOCOMOTIVES
} from './ceker-data';

export interface CekerLocoResult {
  locomotive: LocoType;
  maxTonnage: number;
  limitingSections: CekerEdge[];
  missingData: boolean;
}

export type CekerResult = {
  success: true;
  direction: 'WEST' | 'EAST'; // WEST = Eskişehir -> Halkalı, EAST = Halkalı -> Eskişehir
  stations: string[];
  edges: CekerEdge[];
  locomotives: CekerLocoResult[];
} | {
  success: false;
  error: 'same_station' | 'undefined_route' | 'invalid_station';
};

export function resolveCekerRoute(start: string, end: string): CekerResult {
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

  let usedEdges: CekerEdge[] = [];

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
    // If multiple cover, pick the one with smallest span to be more specific
    coveringRoutes.sort((a, b) => {
      const spanA = activeRoute.indexOf(a.to) - activeRoute.indexOf(a.from);
      const spanB = activeRoute.indexOf(b.to) - activeRoute.indexOf(b.from);
      return spanA - spanB;
    });
    usedEdges = [coveringRoutes[0]];
  } else {
    // Step-by-step resolution
    let currentIdx = startIdx;

    while (currentIdx < endIdx) {
      const nextIdx = currentIdx + 1;
      let foundEdge: CekerEdge | null = null;

      for (const edge of activeEdges) {
        const rs = activeRoute.indexOf(edge.from);
        const re = activeRoute.indexOf(edge.to);
        if (rs !== -1 && re !== -1 && rs <= currentIdx && re >= nextIdx) {
          foundEdge = edge;
          break; // found a covering edge for this step
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
  }

  if (usedEdges.length === 0) {
    return { success: false, error: 'undefined_route' };
  }

  // Calculate limits for ALL locomotives in source order
  const locoResults: CekerLocoResult[] = [];

  for (const locoData of CEKER_LOCOMOTIVES) {
    const loco = locoData.id;
    let minTonnage = Infinity;
    let limitingSections: CekerEdge[] = [];
    let missingData = false;

    // Determine the minimum tonnage first
    for (const edge of usedEdges) {
      const val = edge.limits[loco];
      if (val === undefined || val === null) {
        missingData = true;
      } else {
        if (val < minTonnage) {
          minTonnage = val;
        }
      }
    }

    if (!missingData && minTonnage !== Infinity) {
      // Find ALL sections that tie for the minimum tonnage
      for (const edge of usedEdges) {
        if (edge.limits[loco] === minTonnage) {
          limitingSections.push(edge);
        }
      }
    }

    locoResults.push({
      locomotive: loco,
      maxTonnage: minTonnage,
      limitingSections,
      missingData: missingData || minTonnage === Infinity
    });
  }

  return {
    success: true,
    direction,
    stations: pathStations,
    edges: usedEdges,
    locomotives: locoResults
  };
}
