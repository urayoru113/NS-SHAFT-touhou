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
            width  : this.width/5,
            height : this.height/28,
            x      : this.width - this.width/5,
            y      : this.height + this.height/14,
            speed  : this.height/700 * 3,
        }
        platform.x *= Math.random();
        return platform;
    }

    setLevel(level) {
        if (level === 1) {
            this.platform = [];
            this.gravity = this.height/140;
            this.level = 1;
            this.time = 1;
            this.score = 0;
            this.backgroundPosY = 0;
            this.backgroundSpeed = this.height/1400;
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
        this.player = this.initPlayer();
        this.platform[0] = this.initPlatform();
        this.update();

    }

    update() {
        const FPS  = this.getFPS();
        const self = this;


        for (let i = 0; i < this.platform.length; i++){
            this.platform[i].y -= this.platform[i].speed;
        }

        if (FPS && this.globalEvent === 'start'){
            setTimeout(function() {
                self.update();
            }, 1000/FPS);
        }
    }
    
    detect() {
        if (this.player.isDrop) this.player.y += dropSpeed()*this.time;
        
        if (this.platform[this.platform.length - 1].y < this.height - this.height/20){
            if (Math.random() > 0.925 || this.platform[this.platform.length - 1].y < this.height * 2/5){
                this.platform[this.platform.length] = this.initPlatform();
            }
        }
        
        if (this.player.y <= this.statesPanelHeight) {
            this.player.isDrop = true;
            this.time = 1;
            this.soundPlay(music.boom);
            this.player.hp -= 10;
            break;
        }

        for (let i = 0; i < this.platform.length; i++) {
            if (this.platform[i].y + this.platform[i].height < 0){
                this.platform.splice(i--, 1);
            }
        }
       /* 
        for (let i = 0; i < this.platform.length; i++){
            if (this.player.x + this.player.width*2/3 > this.platform[i].x &&
                this.player.x + this.player.width*1/3 < this.platform[i].x + this.platform[i].width) {
                if (this.player.y + this.player.height === this.platform[i].y){
                    this.player.y -= this.platform[i].speed;
                    this.player.is_drop = false;
                    this.t = 1;
                    if (this.player.left === false && this.player.right === false){
                        if (this.player.stamina < 50){
                            this.player.stamina += 0.1;
                        }
                    }
                    break;
                }
                else if (this.player.y + this.player.height <= this.platform[i].y &&
                         this.player.y + this.player.height >= this.platform[i].y - this.gravity * (this.t + 0.04) * (this.t + 0.04) - this.platform[i].speed){
                    this.player.y = this.platform[i].y - this.player.height;
                    this.player.is_drop = false;
                    this.t = 1;
                    music.drop.load;
                    music.drop.play();
                    break;
                }
            }
            else{
                this.player.is_drop = true;
            }
        }
             */
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

            for (let i in this.platform) {
                const platform = [
                                this.platform[i].x,
                                this.platform[i].y,
                                this.platform[i].width,
                                this.platform[i].height
                ];
                this.drawImg(image.platform, ...platform);
            }

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
    
    
    setFPS(fps) {
        this.fps = fps;
    }

    getFPS() {
        return this.fps;
    }
    
    dropSpeed(v) {
        if (v) {
            this.time = v / this.time;
        } else {
            return this.gravity * this.time;
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

    soundplay(music) {
        music.load;
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
