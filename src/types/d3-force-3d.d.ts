// Just the parts of d3-force-3d the map layout uses; the package ships no types.
declare module "d3-force-3d" {
  type SimNode = { id: string; x?: number; y?: number; z?: number };
  type SimLink<L> = L & { source: string | SimNode; target: string | SimNode };

  interface Force {
    (alpha: number): void;
  }
  interface LinkForce<L> extends Force {
    id(fn: (n: SimNode) => string): this;
    distance(fn: (l: SimLink<L>) => number): this;
  }
  interface ManyBodyForce extends Force {
    strength(s: number): this;
  }
  interface Simulation {
    force(name: string, force: Force | null): this;
    stop(): this;
    tick(iterations?: number): this;
  }

  export function forceSimulation(nodes: SimNode[], numDimensions?: 1 | 2 | 3): Simulation;
  export function forceLink<L extends object>(links: SimLink<L>[]): LinkForce<L>;
  export function forceManyBody(): ManyBodyForce;
  export function forceCenter(): Force;
}
