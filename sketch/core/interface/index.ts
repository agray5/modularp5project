import Package from "../package";
import p5 from "p5";

export interface Module {
  name: string
}

export interface Draw {
  draw: (pack?: Package) => void
}

export interface IsVector {
  toVector: () => p5.Vector
}