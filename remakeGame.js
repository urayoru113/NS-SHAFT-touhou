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

class Game {
    constructor() {
        this.canvas = document.querySelector('#NS-SHAFT');
        this.canvas.style = "margin:0 auto; display:block;";
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width * 650/850;
        this.height = this.canvas.height;
        this.keyMap = {
            enter : 13,
            shift : 16,
            left  : 37,
            up    : 38,
            right : 39,
            down  : 40,
        };
        this.listenKey();
        
        this.nn = new rl();
        this.nn.network(16, 24, 20, 3);
        this.maxScore = 0;
        this.generation = 0;
    }

    onTitle() {
       this.setGlobalEvent('title');
       this.setFPS(30);
       this.bgmload(audio.title);
       this.bgmload(audio.background);
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
                x         : 0,
                y         : 0,
                width     : image.girl.width / 3,
                height    : image.girl.height / 4,
                imageX    : image.girl.width / 3,
                imageY    : 0,
                iconX     : 176,
                iconY     : 163,
                iconWidth : 200,
                iconHeight: 200,
                onSpeedUp : false,
                onLeft    : false,
                onRight   : false,
                isDrop    : false,
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
    
    initGame() {
        this.initStates();
        this.player = this.initPlayer();
        this.platform[0] = this.initPlatform();
        this.player.x = this.platform[0].x + this.platform[0].width/2 - this.player.width/2;
        this.player.y = this.platform[0].y - this.player.height;
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
        this.setGlobalEvent('start');
        this.bgmstop(audio.title);
        this.soundplay(audio.system1);
        this.sleep(800);
        this.bgmstart(audio.background);
        this.setEvent();
        this.mlModel();
        this.setLevel(1);
        this.initGame();
        this.update();
    }
    
    update() {
        const self = this;
        this.player.isDrop = true;
        
        if (this.platform[this.platform.length - 1].y < this.height - this.height/20){
            if (Math.random() > 0.925 || this.platform[this.platform.length - 1].y < this.height * 2/5){
                this.platform[this.platform.length] = this.initPlatform();
            }
        }

        for (let i = 0; i < this.platform.length; i++) {
            if (this.platform[i].y + this.platform[i].height < 0){
                this.platform.splice(i--, 1);
            }
        }
       
        for (let i = 0; i < this.platform.length; i++){
            if (this.player.x + this.player.width*2/3 > this.platform[i].x &&
                this.player.x + this.player.width*1/3 < this.platform[i].x + this.platform[i].width) {
                if (this.player.y + this.player.height === this.platform[i].y) {
                    this.platform[i].y -= this.platform[i].speed;
                    this.player.y = this.platform[i].y - this.player.height;
                    this.player.isDrop = false;
                    this.time = 1;
                }
                else if (this.player.y + this.player.height <= this.platform[i].y &&
                         this.player.y + this.player.height >= this.platform[i].y - this.dropSpeed()*this.time - this.platform[i].speed) {
                    this.platform[i].y -= this.platform[i].speed;
                    this.player.y = this.platform[i].y - this.player.height;
                    this.player.isDrop = false;
                    this.time = 1;
                    this.soundplay(audio.drop);
                }
                else {
                    this.platform[i].y -= this.platform[i].speed;
                }
            }
            else {
                this.platform[i].y -= this.platform[i].speed;
            }
        }
        
        if (this.player.y < this.statesPanelHeight) {
            this.player.y = this.statesPanelHeight;
            this.player.isDrop = true;
            this.time = 1;
            this.soundplay(audio.boom);
            this.player.hp -= 10;
        }
        
        if (this.player.isDrop) this.player.y += this.dropSpeed()*this.time;
        
        //player moving
        if (this.player.onLeft && !this.player.onRight) {
            this.player.imageX += this.player.width;
            this.player.imageX %= (3 * this.player.width);
            this.player.imageY = this.player.height;
        }
        
        if (!this.player.onLeft && this.player.onRight) {
            this.player.imageX += this.player.width;
            this.player.imageX %= (3 * this.player.width);
            this.player.imageY = 2 * this.player.height;
        }
        if (this.player.onLeft & this.player.onRight ||
            !this.player.onLeft & !this.player.onRight) {
            this.player.imageX = image.girl.width/3;
            this.player.imageY = 0;
        }
        
        if(this.player.y > this.height + this.height/14) {
            this.gameover();
        }
        
        this.score++;
        this.maxScore = this.score > this.maxScore? this.score : this.maxScore;
        
        if (this.globalEvent === 'start'){
            setTimeout(function() {
                self.update();
            }, 1000/self.getFPS());
        }
    }
    
    gameover() {
        this.nn.reward[this.nn.episode] = this.score;
        this.nn.episode++;
        if (this.nn.episode >= this.nn.trainEpisode) {
            for (let i = 0; i < 5; i++)
                this.nn.mcpg();
            clearInterval(this.nn.model);
            this.mlModel();
        }
        this.generation++;
        this.setLevel(1);
        this.initGame();
    }

    drawCtx() {
        const self = this;
        const nn = new rl();
        if (this.globalEvent === 'title') {
            const width  = this.width;
            const height = this.height;
            this.drawImg(image.title, 0, 0, width, height);
            this.drawImg(image.arrow, width/4, height/3 - 2, height/15, height/15);
            this.drawObj('start', width/3, height/3, width/3, height/15);
        }

        if (this.globalEvent === 'start'){
            //draw background
            const width    = this.width;
            const height   = this.height;
            const bgWidth  = image.background.width;
            const bgHeight = image.background.height;
            const bgY      = this.backgroundPosY;
            const bgSpeed  = this.backgroundSpeed;
            for (let i = 0; i < Math.ceil(this.height / image.background.height) + 1; i++)
                this.drawImg(image.background, 0, i*image.background.height - Math.floor(bgY % bgHeight));
            this.backgroundPosY += bgSpeed;
            if (!(this.backgroundPosY % bgHeight)) this.backgroundPosY = 0;

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
            
            const player = [
                this.player.imageX,
                this.player.imageY,
                this.player.width,
                this.player.height,
                this.player.x,
                this.player.y,
                this.player.width,
                this.player.height
            ];
            
            for (let i in this.platform) {
                const platform = [
                                this.platform[i].x,
                                this.platform[i].y,
                                this.platform[i].width,
                                this.platform[i].height,
                ];
                this.drawImg(image.platform, ...platform);
            }
            
            this.ctx.drawImage(image.girl, ...player);
            this.drawImg(image.characterPanel, ...characterPos);
            this.drawImg(image.statesPanel, ...statesPos);
        }


        requestAnimationFrame(function() {
            self.drawCtx();
        });
    }
    
    mlModel() {
        const self = this;
        this.nn.trainEpisode = 20;
        this.nn.episode = 0;
        this.nn.step = [];
        this.nn.reward = [];
        this.nn.action = [];
        this.nn.states = [];
        this.nn.lastlayer = [];
        for (let i = 0; i < this.nn.episode; i++) {
            this.nn.step[i] = 0;
            this.nn.reward[i] = [];
            this.nn.action[i] = [];
            this.nn.states[i] = [];
            this.nn.lastlayer[i] = [];
        }
        this.nn.model = setInterval(function () {
            let nn = self.nn;
            let inputs = [];
            inputs[0] = self.player.x/self.width;
            inputs[1] = (self.player.y - self.statesPanelHeight)/(self.height - self.statesPanelHeight);
            for (let i = 0; i < 7; i++) {
                inputs[i*2 + 2] = self.platform[i]? self.platform[i].x/(self.width - self.width/5) : -1;
                inputs[i*2 + 3] = self.platform[i]? (self.platform[i].y - self.statesPanelHeight)/(self.height - self.statesPanelHeight) : -1;
            }
            const gen = nn.compute(inputs);
            const outputs = nn.remean(gen);
            const action = Math.random();
            nn.lastlayer[nn.episode] = gen;
            nn.states[nn.episode] = inputs;
            if (action < outputs[0]) {
                self.player.onLeft = true;
                self.player.onRight = false;
                nn.action.push([1, 0, 0]);
            } else if (action < (outputs[0] + outputs[1])) {
                self.player.onLeft = false;
                self.player.onRight = true;
                nn.action.push([0, 1, 0]);
            } else {
                self.player.onLeft = false;
                self.player.onRight = false;
                nn.action.push([0, 0, 1]);
            }
            nn.step[nn.episode]++;
            if (nn.step[nn.episode] >= 1e5) {
                self.nn.reward[self.nn.episode] = self.score;
                self.nn.episode++;
                for (let i = 0; i < 5; i++)
                    self.nn.mcpg();
                clearInterval(self.nn.model);
                self.mlModel();
            }
            document.getElementById("maxScore").innerText = "maxScore: " + Math.floor(self.maxScore/self.getFPS());
            document.getElementById("score").innerText = "score: " + Math.floor(self.score/self.getFPS());
            document.getElementById("generation").innerText = "generation: " + self.generation;;
            let layerOut = document.getElementsByClassName("layerOut");
            for (let i = 0; i < 3; i++) {
                if (i == 0)
                    layerOut[i].innerText = "layerOut" + i + " -> left : " + gen[i];
                else if (i == 1)
                    layerOut[i].innerText = "layerOut" + i + " -> right: " + gen[i];
                else
                    layerOut[i].innerText = "layerOut" + i + " -> stand: " + gen[i];
            }
        }, 3000/self.getFPS());
        
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
        
    setEvent() {
        let self = this;
        const moving = setInterval(
                function(){
                    if (self.player.onLeft){
                        if (self.player.x < self.player.speed) self.player.x = 0;
                        if (self.player.x > 0) self.player.x -= self.player.speed;
                    }
                    if (self.player.onRight){
                        if (self.player.x + self.player.width <= self.width &&
                            self.player.x + self.player.width >= self.width - self.player.speed)
                            self.player.x = self.width - self.player.width;
                        else if (self.player.x + self.player.width <= self.width)
                            self.player.x += self.player.speed;
                    }
                        }, 300/self.getFPS());
        /*set time to control gravity*/
        const drop = setInterval(function(){
            if (self.time < 2.5) self.time += 0.02;
        }, 600/self.getFPS());
    }
    
    setFPS(fps) {
        this.fps = fps;
    }

    getFPS() {
        return this.fps || 1e10;
    }
    
    dropSpeed(v) {
        if (v) {
            this.time = v / this.gravity;
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


    listenKey() {
        const self = this;
        window.addEventListener('keydown', function (e) { self.keydown(e) }, false);
        window.addEventListener('keyup', function (e) { self.keyup(e) }, false);
    }

    callback() {
        this.__func__();
    }

    keydown(e) {
        switch (e.keyCode || e.which) {
            case this.keyMap.enter: {
                if (this.globalEvent === 'title')
                    this.onStart();
                break;
            }
            case this.keyMap.left: {
                if (this.globalEvent === 'start')
                    this.player.onLeft = true;
                break;
            }
            case this.keyMap.right: {
                if (this.globalEvent === 'start')
                    this.player.onRight = true;
                break;
            }
        }
    }

    keyup(e) {
        switch (e.keyCode || e.which) {
            case this.keyMap.left: {
                if (this.globalEvent === 'start')
                    this.player.onLeft = false;
                break;
            }
            case this.keyMap.right: {
                if (this.globalEvent === 'start')
                    this.player.onRight = false;
                break;
            }
        }
    }
    
    setGlobalEvent(event) {
        this.globalEvent = event;
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
        game.onTitle();
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
