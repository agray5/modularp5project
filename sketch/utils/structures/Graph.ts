import { without, map, prop, flatten, compose, call } from 'ramda'
import { forceArray } from '../list';
import { capitalize } from '../string';

export class OneWayNode<T> {
  to: TwoWayNode<T>[];

  constructor () {
    this.to = [];
  } 

  add (node: TwoWayNode<T>) {
    this.to.push(node);
    return this;
  }

  remove (node: TwoWayNode<T>) {
   this.to = without([node], this.to);
   return this;
  }
}

export type Callback<T, E> = (currentValue: T, index: number, type: E) => void

type Level = "top" | "bottom"
export class TwoWayNode<T> {
  element: T
  top: OneWayNode<T>[];
  bottom: OneWayNode<T>[];
  next: TwoWayNode<T> | null;
  prev: TwoWayNode<T> | null;

  constructor (item: T) {
    this.element = item;
    this.top = [];
    this.bottom = [];
    this.next = null;
    this.prev = null;
  }

  add(end: Level, node: OneWayNode<T>) {
    switch(end){
      case "top": this.top.push(node); break;
      case "bottom": this.bottom.push(node); break;
    }

    return this;
  }

  remove(end: Level, node: OneWayNode<T>) {
    switch(end){
      case "top": this.top = without([node], this.top); break;
      case "bottom": this.bottom = without([node], this.bottom); break;
    }

    return  this;
  }

  /** Remove all references to this node in graph and its references */
  delete () {
    this.top.forEach(node => {
      node.remove(this);
    });
    this.bottom.forEach(node => {
      node.remove(this);
    });

    this.element = null;
    this.bottom = null;
    this.top = null;
    this.next = null;
    this.prev = null;
  }


}


type addElementOptions<T> = {top?: string | string[], bottom?: string | string[], element: T};
type getElementOptions = {level: Level, key: string};
/**
 * A double entry graph. Two maps are specified, a top and a bottom.
 * Each element in both maps are Nodes.
 * 
 * This provides us a quick way to access objects from different contexts.
 * Adding, and finding are quick. Removing is slow. 
 * 
 * Elements in a graph are iterable.
 * Insertion order will be kept.
 */
export default class Graph<T> {
  top: Record<string, OneWayNode<T>>;
  bottom: Record<string, OneWayNode<T>>;
  head: null | TwoWayNode<T>;
  tail: null | TwoWayNode<T>;

  constructor () {
    this.top = {};
    this.bottom = {};
    this.head = null;
    this.tail = null;
  }

  private validateKey (key: string, obj: Record<string, OneWayNode<T>>, suppressWarn = false) {
    if (obj[key]) {
      !suppressWarn && console.warn(key, "is already present in graph.");
      return false;
    }

    return true;
  }

  private validateElement (key: string, obj: Record<string, OneWayNode<T>>, suppressWarn = false) {
    if (!obj[key]) {
      !suppressWarn && console.warn(key, "is not present in graph.");
      return false;
    }

    return true;
  }


  addTop (key: string, suppressWarn = false) {
    if(this.validateKey(key, this.top, suppressWarn)) {
      this.top[key] = new OneWayNode<T>();
    }
    
    return this;
  }

  addBottom (key: string, suppressWarn = false) {
    if(this.validateKey(key, this.bottom, suppressWarn)) {
      this.bottom[key] = new OneWayNode<T>();
    }

    return this;
  }

  // unbiased adding to graph
  private addElementToGraph (level: Level, key: string, element: T | T[]) {
    if(!this.validateElement(key, this[level]))
      this[`add${capitalize(level)}`](key);

    const elements = forceArray(element);
    elements.forEach(element => {
      let node = this.find(element);
      
      //Set up node if it does not exist
      if (!node) {
        node = new TwoWayNode<T>(element);

        //Chain node
        node.prev = this.tail;
        if(this.tail) this.tail.next = node;

        if(!this.head) this.head = node;
        this.tail = node;
      }

      //Add node to given record
      this[level][key].add(node);
      
      //wire node to level
      node.add(level, this[level][key]);
    });
  }

  private find(obj: T, next = this.head): null | TwoWayNode<T> {
    if(!next) return null;
    else if (next.element === obj) return next;
    else if (this.tail.element === obj) return this.tail;
    else return this.find(obj, next.next);
  }

  addElementTop (key: string, element: T | T[]){
    this.addElementToGraph('top', key, element);

    return this;
  }

  addElementBottom (key: string, element: T | T[]) {
    this.addElementToGraph('bottom', key, element);

    return this;
  }

  add (options: addElementOptions<T>) {
    const {top, bottom, element} = options;
    const tops = forceArray(top);
    const bottoms = forceArray(bottom);

    tops.forEach(key => key && this.addTop(key, true).addElementTop(key, element));
    bottoms.forEach(key => key && this.addBottom(key, true).addElementBottom(key, element));

    return this; 
  }

  addAll (optionsArr: addElementOptions<T>[]) {
    optionsArr.forEach(option => this.add(option));

    return this;
  }

  getTop (key: string) {
    return this.top[key].to.map(node => node.element);
  }

  getBottom (key: string) {
    return this.bottom[key].to.map(node => node.element);
  }

  getSiblings (options: getElementOptions) {
    const {level, key} = options;
    const otherLevel = level=="top"?"bottom":"top";

    return this[level][key].to.map(node => ({
        data: node.element, 
        siblings: compose(map(prop("element")), flatten, map(prop("to")))(node[otherLevel])
      })
    );
  }


  /** Return elements according to options */
  get (options: getElementOptions ): T
  get (options: getElementOptions[]): T[]
  get (options: getElementOptions | getElementOptions[]): T | T[] {
    if(!Array.isArray(options)){
      const {level, key} = options;

      switch (level) {
        case "top": return this.getTop(key);
        case "bottom": return this.getBottom(key);
      }
    }

    //@ts-ignore
    return options.map(option => this.get(option));
  }

  /** Return all elements in graph in insertion order. */
  getAll () {
    const returns: T[] = [];
    for(const element of this) {
      returns.push(element);
    }
    return returns;
  }


  [Symbol.iterator]() { 
    let next = this.head;
    return {
      next () {
        const value = next?.element;
        next = next?.next;

        return {done: !!next, value};
      }
    }
  }
}

