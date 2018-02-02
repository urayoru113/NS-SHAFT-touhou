"use strict";

const log = function print(msg) { console.log(msg); };

var image;
var audio;

const loadImage = function funcLoadImage(source, callback) {
    let loaded = 0;
    let count = 0;
    let imgs = {};
    function load() {
        loaded++;
        if (loaded === count) {
            callback(imgs);
        }
    }
    for (let i in source) {
        if (source.hasOwnProperty(i)) {
            count++;
            imgs[i] = new Image();
            imgs[i].addEventListener( 'load', load, false);
            imgs[i].src = source[i];
        }
    }
};

const loadAudio = function funcLoadAudio(source, callback) {
    let loaded = 0;
    let count = 0;
    let auds = {};
    function load() {
        loaded++;
        if (loaded === count) {
            callback(auds);
        }
    }
    for (let i in source) {
        if (source.hasOwnProperty(i)) {
            count++;
            auds[i] = new Audio();
            auds[i].addEventListener( 'loadedmetadata', load, false);
            auds[i].src = source[i];
        }
    }
};

class Keyboard {
    constructor(caller) {
        this.callee = caller;
        this.key = {
            enter : 13,
            shift : 16,
            left  : 37,
            up    : 38,
            right : 39,
            doen  : 40,
        };
        this.listen();
    }

    listen() {
        const self = this;
        window.addEventListener('keydown', function (e) { self.keydown(e) }, false);
        window.addEventListener('keyup', function (e) { self.keyup(e) }, false);
    } 

    keydown(e) {
        switch (e.keyCode || e.which) {
            case this.key.enter: {
                log('enter');
            }
        }
    }
    
    keyup(e) {
    }

}

class Draw {
    constructor() {
    }
}

class Game {
    constructor() {
        this.globalEvent = 'title';
        this.canvas = document.querySelector('#NS-SHAFT');     
        this.canvas.style = "margin:0 auto; display: block;";
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width * 650/850;
        this.height = this.canvas.height;
    }

    init() {
       this.drawctx(); 
    }

    drawctx() {
        if (this.globalEvent === 'title') {
            const width = this.width;
            const height = this.height;

            this.drawImg(image.title, 0, 0, width, height);
            this.drawImg(image.arrow, width/4, height/3 - 2, height/15, height/15);
            this.drawObj('start', width / 3, height / 3, width / 3, height / 15);
        }
    }

    drawImg(...param) {
        const img = {
            source : param[0],
            x      : param[1],
            y      : param[2],
            w      : param[3],
            h      : param[4],
        };
        this.ctx.drawImage(...param);
    }

    drawObj(obj, x, y, width, height) {
        let area= [...arguments];
        let w;
        let h;
        area.shift();
        //five letters
        w = image.message5.width / 3;
        h = image.message5.height / 14;
        if (obj === 'start') {
            this.ctx.drawImage(image.message5, 0, 0, 1*w, 1*h, ...area);
        }
        if (obj === 'score') {
            this.ctx.drawImage(image.message5, 0, 0, 2*w, 5*h, ...area);
        }
    }
}

window.onload = function initLoader() {

    let imageloaded = false;
    let audioloaded = false;

    const imageSprites = {
        title : "./image/title.jpg",
        arrow : "./image/arrow.png",
        button : "./image/button.png",
        button1 : "./image/button1.png",
        background : "./image/background5.jpg",
        platform : "./image/platform.png",
        platform1 : "./image/platform1.png",
        platform2 : "./image/platform2.png",
        girl : "./image/girl.png",
        character_panel : "./image/character_panel1.jpg",
        states_panel : "./image/states_panel3.jpg",
        states_frame : "./image/states_frame.png",
        hp : "./image/hp.png",
        stamina : "./image/stamina.png",
        number : "./image/number.png",
        message2 : "./image/two_letter.png",
        message5 : "./image/five_letter.png",
        message6 : "./image/six_letter.png",
        icon : "./image/icon.png",
        icon_frame : "./image/icon_frame.png",
        item_frame : "./image/item_frame.png",
        shop_background : "./image/shop_background.jpg",
        potion1 : "./image/potion1.png",
        potion2 : "./image/potion2.png",
        cell : "./image/cell.png",
        arrow_left : "./image/arrow_left.png",
        arrow_right : "./image/arrow_right.png",
    };

    const audioSprites = {
        title : "./music/title.mp3",
        drop : "./music/drop.mp3",
        background : "./music/background.mp3",
        boom : "./music/boom.mp3",
        system1 : "./music/system1.mp3"
    };

    const init = function initGameManager() {
        const game = new Game();
        game.init();
    };

    loadImage(imageSprites, function (imgs) {
        log('Load image success');
        imageloaded = true;
        image = imgs;
        if (imageloaded && audioloaded) {
            init();
        }
    });

    loadAudio(audioSprites, function (auds) {
        log('Load audio success');
        audioloaded = true;
        audio = auds;
        if (imageloaded && audioloaded) {
            init();
        }
    });

};
