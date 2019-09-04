/*jslint node: true */
/*jshint esversion: 6 */
"use strict";

const log = function print(...msg) {
    for (let i = 0; i < msg.length; i++) {
        console.log(msg[i]);
    }
};

var image;
var audio;

const loadImage = function funcLoadImage(source, callback) {
    let loaded = 0;
    let count = 0;
    let imgs = {};
    function load() {
        loaded++;
        if (loaded == count) {
            callback(imgs);
        }
    }
    for (let i in source) {
        if (source.hasOwnProperty(i)) {
            count++;
            imgs[i] = new Image();
            imgs[i].addEventListener('load', load, false);
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
        if (loaded == count) {
            callback(auds);
        }
    }
    for (let i in source) {
        if (source.hasOwnProperty(i)) {
            count++;
            auds[i] = new Audio();
            auds[i].addEventListener('loadedmetadata', load, false);
            auds[i].src = source[i];
        }
    }
};

class Game {
    constructor() {
        this.canvas = document.querySelector('#NS-SHAFT');
        this.canvas.style = "margin:0 auto; display: block;";
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width*650/850;
        this.height = this.canvas.height;
        this.keyMap = {
            enter : 13,
            shift : 16,
            esc   : 27,
            left  : 37,
            up    : 38,
            right : 39,
            down  : 40,
        };
        this.level = 1;
        this.listenKey();
    }

    onTitle() {
        this.setGlobalEvent('title');
        this.bgmplay(audio.title);
    }

    init() {
        this.record = {
            player : {
                item      : [],
                energy    : 100,
                hp        : 100,
                speed     : 1.5,
                gold      : 0,
                sp        : 0,
                speedUp   : 1,
                x         : 0,
                y         : 0,
                width     : image.girl.width/3,
                height    : image.girl.height/4,
                imageX    : image.girl.width/3,
                imageY    : 0,
                iconX     : 176,
                iconY     : 163,
                iconWidth : 200,
                iconHeight: 200,
                isSpeedUp : false,
                isLeft    : false,
                isRight   : false,
                isDrop    : false,
            }
        };

        this.characterPanelX = this.canvas.width*650/850;
        this.characterPanelY = 0;
        this.characterPanelWidth = this.canvas.width*200/850;
        this.characterPanelHeight = this.canvas.height;
        this.statesPanelX = 0;
        this.statesPanelY = 0;
        this.statesPanelWidth = this.canvas.width*650/850;
        this.statesPanelHeight = this.canvas.height*1/10;

        this.platformType = {
            0: {
                type    : 0,
                width   : this.width/5,
                height  : this.height/28,
                x       : this.width - this.width/5,
                y       : this.height + this.height/14,
                speed   : this.height/450
            },
            1: {
                /*recover 10 hp */
                type    : 1,
                width   : this.width/5,
                height  : this.height/28,
                x       : this.width - this.width/5,
                y       : this.height + this.height/14,
                speed   : this.height/700*6,
                activate: true
            },
            2: {
                /*recover 10 energy */
                type    : 2,
                width   : this.width/5,
                height  : this.height/28,
                x       : this.width - this.width/5,
                y       : this.height + this.height/14,
                speed   : this.height/700*6,
                activate: true
            }
        }
    }

    createPlayer() {
        const player = Object.assign({}, this.record.player);
        return player;
    }


    createPlatform() {
        if (this.level == 1) {
            const platform = Object.assign({}, this.platformType[0]);
            platform.x *= Math.random();
            return platform;
        }
        if (this.level == 2) {
            const platform = Object.assign({}, this.platformType[0])
            platform.speed = this.height/600
            platform.x *= Math.random();
            return platform;
        }
        if (this.level == 3) {
            const platform = Object.assign({}, this.platformType[0])
            platform.width = this.width/80*Math.random() + 1;
            platform.x = this.width - platform.width,
            platform.x *= Math.random();
            return platform;
        }
    }

    setLevel(level) {
        this.time = 0;
        this.platform = [];
        this.gravity = this.height/120;
        this.resetDropTime();
        this.score = 0;
        this.backgroundPosY = 0;
        this.backgroundSpeed = this.height/2800;
    }

    onStart() {
        this.setGlobalEvent('start');
        this.soundplay(audio.system1);
        this.init();
        this.player = this.createPlayer();
        this.setLevel(this.level);
        this.sleep(800);
        this.player = this.createPlayer();
        this.platform.push(this.createPlatform());
        this.player.x = this.platform[0].x + this.platform[0].width/2 - this.player.width/2;
        this.player.y = this.platform[0].y - this.player.height;
        this.setEvent();
        this.bgmplay(audio.background);
        this.update();
    }

    onLevel() {
        this.setGlobalEvent('level');
    }

    update() {
        const self = this;
        this.player.isDrop = true;
        this.player.dropSpeed = this.gravity*this.player.dropTime;

        if (this.level == 1) {
            if (this.platform[this.platform.length - 1].y < this.height - this.height/20){
                if (Math.random() > 0.96 || this.platform[this.platform.length - 1].y < this.height * 2/5){
                    this.platform.push(this.createPlatform());
                }
            }
        }
        if (this.level == 2) {
            if (this.platform[this.platform.length - 1].y < this.height + this.height/14 - 1){
                if (Math.random() > 0.8){
                    this.platform.push(this.createPlatform());
                }
            }
        }
        if (this.level == 3) {
            if (this.platform[this.platform.length - 1].y < this.height + this.height/14 - 1){
                if (Math.random() > 0.92){
                    this.platform.push(this.createPlatform());
                }
            }
        }

        for (let i = 0; i < this.platform.length; i++) {
            if (this.platform[i].y + this.platform[i].height < 0){
                this.platform.splice(i--, 1);
            }
        }

        /*player is under the platform*/
        for (let i = 0; i < this.platform.length; i++){
            if (this.player.x + this.player.width*2/3 > this.platform[i].x &&
                this.player.x + this.player.width*1/3 < this.platform[i].x + this.platform[i].width) {
                if (this.player.y + this.player.height == this.platform[i].y) {
                    this.platform[i].y -= this.platform[i].speed;
                    this.player.y = this.platform[i].y - this.player.height;
                    this.player.isDrop = false;
                    this.resetDropTime();
                }
                else if (this.player.y + this.player.height <= this.platform[i].y &&
                         this.player.y + this.player.height >= this.platform[i].y - this.player.dropSpeed - this.platform[i].speed) {
                    this.platform[i].y -= this.platform[i].speed;
                    this.player.y = this.platform[i].y - this.player.height;
                    this.player.isDrop = false;
                    this.resetDropTime();
                    this.soundplay(audio.drop);
                }
                else {
                    this.platform[i].y -= this.platform[i].speed;
                }
                this.score += 10;
            }
            else {
                this.platform[i].y -= this.platform[i].speed;
            }
        }

        if (this.player.y < this.statesPanelHeight) {
            this.player.y = this.statesPanelHeight;
            this.player.isDrop = true;
            this.resetDropTime();
            this.soundplay(audio.boom);
            this.player.hp -= 10;
        }

        /*player is droping*/
        if (this.player.isDrop) {
            this.player.dropTime += 1/60;
            this.player.y += this.player.dropSpeed;
        }

        /*recover energy natively */
        if (this.player.energy < this.record.player.energy){
            this.player.energy += 0.2;
        }

        /*player is speed-up*/
		if (this.player.isSpeedUp && this.player.energy >= 1){
			this.player.energy--;
		}

		/*player doesn't have energy */
		if (this.player.energy < 1){
			if (this.player.isSpeedUp){
				this.player.speed -= this.player.speedUp;
				this.player.isSpeedUp = false;
			}
		}

		this.score++;

        if (this.globalEvent == 'start'){
            setTimeout(function() {
                self.update();
            }, 1000/60);
        }

    }

    setEvent() {
        let self = this;
        this.moveEvent = setInterval(
            function(){
                if (self.player.isLeft){
                    if (self.player.x < self.player.speed) self.player.x = 0;
                    if (self.player.x > 0) self.player.x -= self.player.speed;
                }
                if (self.player.isRight){
                    if (self.player.x + self.player.width <= self.width &&
                        self.player.x + self.player.width >= self.width - self.player.speed)
                        self.player.x = self.width - self.player.width;
                    else if (self.player.x + self.player.width <= self.width)
                        self.player.x += self.player.speed;
                }
            },10);
        this.moveAnime = setInterval(
            function() {
                if (self.player.isLeft && !self.player.isRight) {
                    self.player.imageX += self.player.width;
                    self.player.imageX %= (3 * self.player.width);
                    self.player.imageY = self.player.height;
                }
                if (!self.player.isLeft && self.player.isRight) {
                    self.player.imageX += self.player.width;
                    self.player.imageX %= (3 * self.player.width);
                    self.player.imageY = 2 * self.player.height;
                }
                if (self.player.isLeft && self.player.isRight ||
                    !self.player.isLeft && !self.player.isRight) {
                    self.player.imageX = image.girl.width/3;
                    self.player.imageY = 0;
                }
        }, 1000/18);
    }

    drawCtx() {
        const self = this;
        const width    = this.width;
        const height   = this.height;

        if (this.globalEvent == 'title') {
            const width  = this.width;
            const height = this.height;
            this.ctx.drawImage(image.title, 0, 0, width, height);
            if (this.titleSelected == "start") {
                this.ctx.drawImage(image.arrow, width/4, height/3, height/15, height/15);
            } else if (this.titleSelected == "level") {
                this.ctx.drawImage(image.arrow, width/4, height/3 + height/10, height/15, height/15);
            }
            this.drawObj('start', width/3, height/3, width/3, height/15);
            this.drawObj('level', width/3, height/3 + height/10, width/3, height/15);
        }

        if (this.globalEvent == 'start'){
            /*draw background */
            const bgWidth  = image.background.width;
            const bgHeight = image.background.height;
            const bgY      = this.backgroundPosY;
            const bgSpeed  = this.backgroundSpeed;

            for (let i = 0; i < Math.ceil(height/bgHeight) + 1; i++){
			    this.ctx.drawImage(image.background, 0, i*bgHeight - Math.floor(bgY%bgHeight));
		    }
            this.backgroundPosY += bgSpeed;
            if ((this.backgroundPosY%bgHeight) == 0) this.backgroundPosY %= bgHeight;

            for (let p of this.platform) {
                this.ctx.drawImage(
                    image.platform,
                    p.x,
                    p.y,
                    p.width,
                    p.height
                );
            }

            /*draw player */
            this.ctx.drawImage(
                image.girl,
                this.player.imageX,
                this.player.imageY,
                this.player.width,
                this.player.height,
                this.player.x,
                this.player.y,
                this.player.width,
                this.player.height
            );

            this.ctx.drawImage(
                image.characterPanel,
                this.characterPanelX,
                this.characterPanelY,
                this.characterPanelWidth,
                this.characterPanelHeight
            );

            this.ctx.drawImage(
                image.statesPanel,
                this.statesPanelX,
                this.statesPanelY,
                this.statesPanelWidth,
                this.statesPanelHeight
            );

            /*hp letter*/
            this.drawObj(
                'hp',
                this.statesPanelWidth/20,
                this.statesPanelHeight/10,
                this.statesPanelWidth/10,
                this.statesPanelHeight*9/10
            );

            /*hp bar*/
            this.ctx.drawImage(
                image.hp,
                5,
                0,
                (image.hp.width - 10)*this.player.hp/this.record.player.hp + 5,
                image.hp.height,
                this.statesPanelWidth/6,
                this.statesPanelHeight/3,
                this.statesPanelWidth/4*this.player.hp/this.record.player.hp,
                this.statesPanelHeight/3
            );

            /*hp frame*/
		    this.ctx.drawImage(
		        image.statesFrame,
		        this.statesPanelWidth/6,
		        this.statesPanelHeight/3,
		        this.statesPanelWidth/4,
		        this.statesPanelHeight/3
		    );

            /*energy letter*/
		    this.drawObj(
                'energy',
                this.statesPanelWidth*3/7,
                this.statesPanelHeight/10,
                this.statesPanelWidth*3/10,
                this.statesPanelHeight*9/10
            );

            /*energy bar*/
            this.ctx.drawImage(
                image.energy,
                5,
                0,
                (image.energy.width - 10)*this.player.energy/this.record.player.energy + 5,
                image.hp.height,
                this.statesPanelWidth*11/15,
                this.statesPanelHeight/3,
                this.statesPanelWidth/4*this.player.energy/this.record.player.energy,
                this.statesPanelHeight/3
            );

            /*energy frame*/
		    this.ctx.drawImage(
		        image.statesFrame,
		        this.statesPanelWidth*11/15,
		        this.statesPanelHeight/3,
		        this.statesPanelWidth/4,
		        this.statesPanelHeight/3
		    );

		    this.ctx.font = "bold 25px Microsoft JhengHei ";
		    this.ctx.fillText(
		        'score:',
		        this.characterPanelX + this.characterPanelWidth/8,
		        this.characterPanelHeight/3
            );

            let i = 0;
            for (let num of String(this.score)) {
                this.drawObj(
                    num,
                    this.characterPanelX + this.characterPanelWidth/2 + this.characterPanelWidth/10*i,
                    this.characterPanelHeight/3 - 25,
                    this.characterPanelWidth/10,
                    this.characterPanelHeight/20
                );
                i++;
            }
        }

        if (this.globalEvent == "level") {
            this.ctx.drawImage(image.title, 0, 0, width, height);
            this.ctx.drawImage(image.arrowLeft, height/10, height*2/5, height/5, height/5);
            this.ctx.drawImage(image.arrowRight, width*7/10, height*2/5, height/5, height/5);
            if (this.level == 1) {
                this.ctx.drawImage(image.number1, width*4/10, height*2/5, width/5, height/5);
            }
            if (this.level == 2) {
                this.ctx.drawImage(image.number2, width*4/10, height*2/5, width/5, height/5);
            }
            if (this.level == 3) {
                this.ctx.drawImage(image.number3, width*4/10, height*2/5, width/5, height/5);
            }
        }


        requestAnimationFrame(function() {
            self.drawCtx();
        });
    }

    drawObj(...area) {
        const obj = area.shift();

        let w;
        let h;

        /*single number */
        h = image.number.height/2;
	    w = image.number.width/5;

        if (obj == '0'){
            this.ctx.drawImage(image.number, 0, 0, w, h, ...area);
        }
        if (obj == '1'){
            this.ctx.drawImage(image.number, w, 0, w, h, ...area);
        }
        if (obj == '2'){
            this.ctx.drawImage(image.number, 2*w, 0, w, h, ...area);
        }
        if (obj == '3'){
            this.ctx.drawImage(image.number, 3*w, 0, w, h, ...area);
        }
        if (obj == '4'){
            this.ctx.drawImage(image.number, 4*w, 0, w, h, ...area);
        }
        if (obj == '5'){
            this.ctx.drawImage(image.number, 0, h, w, h, ...area);
        }
        if (obj == '6'){
            this.ctx.drawImage(image.number, w, h, w, h, ...area);
        }
        if (obj == '7'){
            this.ctx.drawImage(image.number, 2*w, h, w, h, ...area);
        }
        if (obj == '8'){
            this.ctx.drawImage(image.number, 3*w, h, w, h, ...area);
        }
        if (obj == '9'){
            this.ctx.drawImage(image.number, 4*w, h, w, h, ...area);
        }

        /*two letter*/
        h = image.message2.height/7;
        w = image.message2.width/5;

        if (obj == 'hp'){
            this.ctx.drawImage(image.message2, 0, 3*h, w, h, ...area);
        }

        /*five letters */
        w = image.message5.width/3;
        h = image.message5.height/14;

        if (obj == 'score'){
		    this.ctx.drawImage(image.message5, 2*w, 5*h, w, h, ...area);
	    }
	    if (obj == 'start'){
		    this.ctx.drawImage(image.message5, 0, 0, w, h, ...area);
	    }
	    if (obj == 'level'){
		    this.ctx.drawImage(image.message5, w, 3*h, w, h, ...area);
	    }

        /*six letter*/
        h = image.message6.height/11;
        w = image.message6.width/2;

        if (obj == 'energy'){
            this.ctx.drawImage(image.message6, w, 10*h, w, h, ...area);
        }


        /*icon*/
        h = image.icon.height/2;
        w = image.icon.width/4;
        if (obj == 'icon_normal'){
            this.ctx.drawImage(image.icon, 0, 0, w, h, ...area);
        }
    }

    resetDropTime() {
        this.player.dropTime = 0.5;
    }

    bgmload(music) {
        music.loop = true;
    }

    bgmpause(music) {
        music.pause();
    }

    bgmstart(music) {
        this.bgmload(music);
        music.play();
        this.bgm = music;
    }

    bgmstop(music) {
        music.pause();
        music.current = 0.0;
    }

    bgmplay(music) {
        if (this.bgm) {
            this.bgmstop(this.bgm);
        }
        this.bgmstart(music);
    }

    soundplay(music) {
        music.play();
    }

    sleep(time) {
        const start = new Date().getTime();
        while ((new Date().getTime() - start) < time);
    }


    listenKey() {
        const self = this;
        window.addEventListener('keydown', function (e) { self.keydown(e); }, false);
        window.addEventListener('keyup', function (e) { self.keyup(e); }, false);
    }

    callback() {
        this.__func__();
    }

    keydown(e) {
        switch (e.keyCode || e.which) {
            case this.keyMap.enter: {
                if (this.globalEvent == 'title') {
                    if (this.titleSelected == 'start') {
                        this.onStart();
                        break;
                    }
                    if (this.titleSelected == 'level') {
                        this.onLevel();
                        break;
                    }
                    break;
                }
                if (this.globalEvent == 'level') {
                    this.onStart();
                    break;
                }
                break;
            }
            case this.keyMap.left: {
                if (this.globalEvent == 'start') {
                    this.player.isLeft = true;
                    break;
                }
                if (this.globalEvent == 'level') {
                    if (this.level > 1) {
                        this.level--;
                        break;
                    }
                    break;
                }
                break;
            }
            case this.keyMap.right: {
                if (this.globalEvent == 'start') {
                    this.player.isRight = true;
                    break;
                }
                if (this.globalEvent == 'level') {
                    if (this.level < 3) {
                        this.level++;
                        break;
                    }
                    break;
                }
                break;
            }
            case this.keyMap.shift: {
                if (this.globalEvent == 'start') {
                    if (!this.player.isSpeedUp) {
                        this.player.speed += this.player.speedUp;
                        this.player.isSpeedUp = true;
                        break;
                    }
                    break;
                }
                break;
            }
            case this.keyMap.up: {
                if (this.globalEvent == 'title') {
                    if (this.titleSelected != "start") {
                        this.titleSelected = "start";
                        break;
                    }
                    break;
                }
                break;
            }
            case this.keyMap.down: {
                if (this.globalEvent == 'title') {
                    if (this.titleSelected != "level") {
                        this.titleSelected = "level";
                        break;
                    }
                    break;
                }
                break;
            }
            case this.keyMap.esc: {
                if (this.globalEvent == 'level') {
                    this.onTitle();
                    break;
                }
                break;
            }
        }
    }

    keyup(e) {
        switch (e.keyCode || e.which) {
            case this.keyMap.left: {
                if (this.globalEvent == 'start')
                    this.player.isLeft = false;
                break;
            }
            case this.keyMap.right: {
                if (this.globalEvent == 'start')
                    this.player.isRight = false;
                break;
            }
            case this.keyMap.shift: {
                if (this.globalEvent == 'start') {
                    if (this.player.isSpeedUp) {
                        this.player.speed -= this.player.speedUp;
                        this.player.isSpeedUp = false;
                    }
                }
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
        title: "./image/title.jpg",
        arrow: "./image/arrow.png",
        button: "./image/button.png",
        button1: "./image/button1.png",
        background : "./image/background5.jpg",
        platform: "./image/platform.png",
        platform1: "./image/platform1.png",
        platform2: "./image/platform2.png",
        girl: "./image/girl.png",
        characterPanel: "./image/character_panel.jpg",
        statesPanel: "./image/states_panel3.jpg",
        statesFrame: "./image/states_frame.png",
        hp: "./image/hp.png",
        energy: "./image/energy.png",
        number: "./image/number.png",
        message2: "./image/two_letter.png",
        message5: "./image/five_letter.png",
        message6: "./image/six_letter.png",
        icon: "./image/icon.png",
        iconFrame: "./image/icon_frame.png",
        itemFrame: "./image/item_frame.png",
        shopBackground: "./image/shop_background.jpg",
        potion1: "./image/potion1.png",
        potion2: "./image/potion2.png",
        cell: "./image/cell.png",
        arrowLeft: "./image/arrow_left.png",
        arrowRight: "./image/arrow_right.png",
        number0: "./image/number/0.png",
        number1: "./image/number/1.png",
        number2: "./image/number/2.png",
        number3: "./image/number/3.png",
        number4: "./image/number/4.png",
        number5: "./image/number/5.png",
        number6: "./image/number/6.png",
        number7: "./image/number/7.png",
        number8: "./image/number/8.png",
        number9: "./image/number/9.png",
    };

    const audioSprites = {
        title: "./music/title.mp3",
        drop: "./music/drop.mp3",
        background: "./music/background.mp3",
        boom: "./music/boom.mp3",
        system1: "./music/system1.mp3"
    };

    const init = function initGameManager() {
        const game = new Game();
        game.titleSelected = "start";
        game.onTitle();
        game.drawCtx();
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
