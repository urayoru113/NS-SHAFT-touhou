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
    constructor() {
        this.keyMap = {
            enter : 13,
            shift : 16,
            left  : 37,
            up    : 38,
            right : 39,
            doen  : 40,
        };
        this.listenKey();
    }

    listenKey() {
        const self = this;
        window.addEventListener('keydown', function (e) { self.keydown(e) }, false);
        window.addEventListener('keyup', function (e) { self.keyup(e) }, false);
    }
    
    listener(__func__) {
        this.callback = __func__;
    }
    
    callback() {
        this.__func__();
    }

    keydown(e) {
        switch (e.keyCode || e.which) {
            case this.keyMap.enter: {
                if (this.event === 'title')
                    this.callback();
                break;
            }
        }
    }

    keyup(e) {
    }

}

class Game {
    constructor() {
        this.key = new Keyboard();
        this.canvas = document.querySelector('#NS-SHAFT');
        this.canvas.style = "margin:0 auto; display: block;";
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width * 650/850;
        this.height = this.canvas.height;
        this.onEvent = null;

    }

    init() {
       const self = this;
       this.bgmload(audio.title);
       this.bgmload(audio.background);
       this.soundload(audio.system1);
       this.setGlobalEvent('title');
       this.onEvent = this.onStart;
       this.key.listener(function () {
            self.onEvent();
       });
    }
    
    initStates() {
        this.record = {
            player : {
                item      : [],
                stamina   : 50,
                hp        : 100,
                speed     : 2,
                gold      : 0,
                sp        : 0,
                speedUp   : 1,
                posX      : 0,
                posY      : 0,
                width     : image.girl.width / 3,
                height    : image.girl.height / 4,
                imagex    : image.girl.width / 3,
                imagey    : 0,
                iconX     : 176,
                iconY     : 163,
                iconWidth : 200,
                iconHeight: 200,
                isSpeedUp : false,
                isDrop    : false,
                onLeft    : false,
                onRight   : false,
            },
        };
        
        this.characterPanelX = this.canvas.width * 650/850;
        this.characterPanelY = 0;
        this.characterPanelWidth  = this.canvas.width * 200/850;
        this.characterPanelHeight = this.canvas.height;
        this.statesPanelX = 0;
        this.statesPanelY = 0;
        this.statesPanelWidth  = this.canvas.width * 650/850;
        this.statesPanelHeight = this.canvas.height * 1/10;
    }
    
    initPlayer() {
        return {...this.record.player};
    }
    
        
    initPlatform() {
        const platform = {
            width  : 120,
            height : 25,
            x      : this.width - this.platform.width,
            y      : this.height + 2*this.platform.height,
            speed  : 3,
        }
        return platform;
    }
    
    setLevel(level) {
        if (level === 1) {
            this.platform = [];
            this.gravity = 5;
            this.level = 1;
            this.time = 1;
            this.score = 0;
            this.backgroundPosY = 0;
            this.backgroundSpeed = 0.5;
        }
    }
    
    onStart() {
        this.bgmstop(audio.title);
        this.soundplay(audio.system1);
        this.initStates();
        this.player = this.initPlayer();
        this.setLevel(1);
        this.sleep(800);
        this.bgmstart(audio.background);
        this.setGlobalEvent('start');
        this.setFPS(30);
        this.update();
    }
    
    update() {
        const FPS  = this.getFPS();
        const self = this;

        if (this.platform.length === 0) {

        }
        if (FPS && this.globalEvent === 'start'){
            setTimeout(function() {
                self.update();
            }, 1000/FPS);
        }
    }
    
    setFPS(fps) {
        this.fps = fps;
    }
    
    getFPS() {
        return this.fps;
    }
    
    drawCtx() {
        if (this.globalEvent === 'title') {
            const width  = this.width;
            const height = this.height;
            this.drawImg(image.title, 0, 0, width, height);
            this.drawImg(image.arrow, width/4, height/3 - 2, height/15, height/15);
            this.drawObj('start', width / 3, height / 3, width / 3, height / 15);
        }
        
        if (this.globalEvent === 'start'){
            //draw background
            const width    = this.width;
            const height   = this.height;
            const bgWidth  = image.background.width;
            const bgHeight = image.background.height;
            const bgY      = this.backgroundPosY;
            const bgSpeed  = this.backgroundSpeed;
            this.drawImg(image.background, 0, -Math.floor(bgY % bgHeight));
            this.backgroundPosY += bgSpeed;
            if (!(this.backgroundPosY % bgHeight)) this.backgroundPosY %= bgHeight;
            
            const characterPos = [
                this.characterPanelX,
                this.characterPanelY,
                this.characterPanelWidth,
                this.characterPanelHeight,
            ];
            const statesPos = [
                this.statesPanelX,
                this.statesPanelY,
                this.statesPanelWidth,
                this.statesPanelHeight
            ];
            this.drawImg(image.characterPanel, ...characterPos);
            this.drawImg(image.statesPanel, ...statesPos);
        }
        
        const self = this;
        requestAnimationFrame(function() {
            self.drawCtx();
        });
    }

    drawImg(...area) {
        this.ctx.drawImage(...area);
    }

    drawObj(...area) {
        const obj = area.shift();
        let w;
        let h;
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

    bgmload(music) {
        music.load;
        music.loop = true;
    }

    bgmpause(music) {
        muisc.pause;
    }

    bgmstart(music) {
        music.play();
    }

    bgmstop(music) {
        music.pause();
        music.current = 0.0;
    }
    
    soundload(music) {
        music.load;
    }
    
    soundplay(music) {
        music.play();
    }
    
    sleep(time) {
        const start = new Date().getTime();
        while ((new Date().getTime() - start) < time);
    }
    
    setGlobalEvent(event) {
        this.globalEvent = event;
        this.key.event = event
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
        characterPanel : "./image/character_panel1.jpg",
        statesPanel : "./image/states_panel3.jpg",
        statesFrame : "./image/states_frame.png",
        hp : "./image/hp.png",
        stamina : "./image/stamina.png",
        number : "./image/number.png",
        message2 : "./image/two_letter.png",
        message5 : "./image/five_letter.png",
        message6 : "./image/six_letter.png",
        icon : "./image/icon.png",
        iconFrame : "./image/icon_frame.png",
        itemFrame : "./image/item_frame.png",
        shopBackground : "./image/shop_background.jpg",
        potion1 : "./image/potion1.png",
        potion2 : "./image/potion2.png",
        cell : "./image/cell.png",
        arrowLeft : "./image/arrow_left.png",
        arrowRight : "./image/arrow_right.png",
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
        game.drawCtx();
        game.bgmstart(audio.title);
    };

    loadImage(imageSprites, function (imgs) {
        imageloaded = true;
        image = imgs;
        if (imageloaded && audioloaded) {
            init();
        }
    });

    loadAudio(audioSprites, function (auds) {
        audioloaded = true;
        audio = auds;
        if (imageloaded && audioloaded) {
            init();
        }
    });

};
