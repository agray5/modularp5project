//TODO: REMOVE

import p5 from "p5"
import PackageManager from "./core/packageManager";
import Systems from "./systems"
import Package from "./core/package";
import Line from "./modules/Line";
import Mouse from "./modules/Mouse";
import LineToMouse from "./modules/LineToMouse";
import Mover from "./creators/mover";

let packageManager: PackageManager;

function sketch (p: p5) {
    p.setup = function () {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.rectMode(p.CENTER);
        //colors = ColorHelper.getColorsArray(squares);
        packageManager = new PackageManager({sketch: p})
            .add(Mover(p))
    }

    p.draw = function () {

        p.background(255);
    
        packageManager.update(Systems);
        //packageManager.draw();
    }
    

/*
    p.mousePressed = function () {
        packageManager.mousePressed();
    }*/
}

new p5(sketch);
