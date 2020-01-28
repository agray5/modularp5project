import uuid from "uuid/v4";
import p5 from "p5"
import Package from "./package";
import { onEach } from "../utils";
import Graph, { getElementOptions } from "../utils/structures/Graph";
import { Module } from "./interface";
import { forceArray } from "../utils/list";

export type System = (pm: PackageManager) => void
export default class PackageManager {
  //Package id on top, Component name on bottom
  map: Graph<Module>
  sketch: p5;

  constructor({sketch}: {sketch: p5}) {
    this.map = new Graph();
    this.sketch = sketch;
  }

  add (mods: Module[]) {
    const id = uuid();
    this.map.addElementTop(id, mods);
    mods.forEach(mod => this.map.addElementBottom(mod.name, mod));

    return this;
  }

  /** Get modules by package id or get siblings of a mod.
   * @returns An object indexed by gotten module names
   */
  get (id: string | Module) {
    const mods = (typeof id === 'string')? 
      this.map.getTop(id) :
      this.map.getSiblings(id, 'bottom')

    return mods.reduce((obj, item) => {
      obj[item.name] = item;
      return obj;
    }, ({} as Record<string, Module>));
  }

  getByMod (names: string | string[]) {
    const mods = forceArray(names);
    const uMods = new Set<Module>();

    mods.forEach(name => {
      const query:getElementOptions = {level: "bottom", key: name};
      this
        .map
        .get(query)
        .forEach(mod => uMods.add(mod))
    });

    return Array.from(uMods);
  }



  remove (id) {
    //TODO: this.map.remove
    //this.map.remove
    return this;
  }

  update (systems: System[]) {
    systems.forEach(system => system(this));
  }

  
}