import Package from "./package";

export default class PackageManager {
  packages!: Record<string, Package>;

  constructor(packages: Record<string, Package> = {}) {
    this.packages = packages;
  }

  add (pack: Package) {
    this.packages[pack.id] = pack;
    return this;
  }

  remove (pack: Package) {
    delete this.packages[pack.id];
    return this;
  }

  update () {
    Object
      .keys(this.packages)
      .forEach(key => this.packages[key].update())
    return this;
  }

  draw () {
    Object
      .keys(this.packages)
      .forEach(key => this.packages[key].draw())
    return this;
  }
}