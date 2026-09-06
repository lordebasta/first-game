import type { Hit } from "./Hit";

export interface Hittable {
  readonly x: number;
  readonly y: number;
  receiveHit(hit: Hit): void;
}
