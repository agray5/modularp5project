import uuid from "uuid/v4";
import Package from "./package";
import { onEach } from "../utils";
<<<<<<< Updated upstream
=======
import Graph from "../utils/structures/Graph";
import Module from "./module";
import { forceArray } from "../utils/list";
>>>>>>> Stashed changes

export type System = (pm: PackageManager) => void
export default class PackageManager {
  //Package id on top, Component name on bottom
  map: Graph<Module>
  systems: Array<System>

  constructor({systems}: {systems: Array<System>}) {
    this.map = new Graph();
    this.systems = systems;
  }

  add (mods: Module[]) {
    const id = uuid();
    this.map.addElementTop(id, mods);
    mods.forEach(mod => this.map.addElementBottom(mod.name, mod));

    return this;
  }

  /** Get modules by package id */
  get (id: string) {
    return this.map.getTop(id);
  }

<<<<<<< Updated upstream
  update () {
    onEach(this.packages, key => this.packages[key].update())
    return this;
  }

  draw () {
    onEach(this.packages, key => this.packages[key].draw())
    return this;
  }

  mousePressed () {
    onEach(this.packages, key => this.packages[key].mousePressed())
=======
  //TODO: ALLOW MODIFICATION OF ALL MODULES IN A PACKAGE (GET SIBLINGS)
  getByMod (names: string | string[]) {
    const mods = forceArray(names);
    const uMods = new Set<Module>();

    mods.forEach(name => {
      this
        .map
        .getBottom(name)
        .forEach(mod => uMods.add(mod))
    });

    return Array.from(uMods);
  }

  remove (id) {
    //TODO
    //this.map.remove
>>>>>>> Stashed changes
    return this;
  }

  update () {
    this.systems.forEach(system => system(this));
  }

  
}