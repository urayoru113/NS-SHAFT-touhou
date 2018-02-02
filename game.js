/*jshint esversion: 6 */
'use strict';

var game;
var image = {};
var music = {};
var FPS = 30;
var globalEvent;

var loadMusic = function (sources, callback){
	let nb = 0;
	let loaded = 0;
	let mus = {};
	for (let i in sources){
		nb++;
		mus[i] = new Audio();
		mus[i].src = sources[i];				
	}
	callback(mus);
};

var loadImages = function(sources, callback){
	let nb = 0;
	let loaded = 0;
	let imgs = {};
	for (let i in sources){
		nb++;
		imgs[i] = new Image();
		
		imgs[i].src = sources[i];
		imgs[i].onload = function(){
			loaded++;
			if (loaded === nb){
				callback(imgs);
			}
		};
	}
};




var Player = function(){
	/*record states*/
	this.r_stamina = 50;
	this.r_hp = 100;
	this.r_speed = 2;
	this.r_gold = 0;
	this.r_sp = 0;
	this.r_item = [];
	

	this.x = 0;
	this.y = 0;
	
	
	this.stamina = this.r_stamina;
	this.hp = this.r_hp;
	this.move_speed = this.r_speed;
	this.gold = this.r_gold;
	this.sp = this.r_sp;
	this.item = this.r_item;
	
	this.width = image.girl.width / 3;
	this.height = image.girl.height / 4;
	this.image_x = image.girl.width / 3;
	this.image_y = 0;

	this.icon_x = 176;
	this.icon_y = 163;
	this.icon_width = 200;
	this.icon_height = 200;
	
	this.speed_up = 1;
	this.is_speed_up = false;
	this.is_drop = false;
	this.left = false;
	this.right = false;
	
	/**/

};



var Platform = function(){
	this.width = 120;
	this.height = 25;
	this.x = Math.random() * (game.width - this.width);
	this.y = game.height + this.height * 2;
	this.speed = 3;
};

var Shop = function(){
	this.type;
	this.num;
	this.x;
	this.y;
	this.width;
	this.height;
}

var Game = function(){
	
	this.start = function(){
		music.system1.load;
		music.system1.play();
		sleep(800);
		music.title.pause();
		music.title.current = 0.0;
		music.background.load;
		music.background.loop = true;
		music.background.play();
		this.level1();
		globalEvent = 'start';
		
		/*set move and speed up Interval*/
		this.setEvent();
		this.update();
	};
	
	this.shop_init = function(){
		this.shop_list = [];
		
		for(let i = 0; i < 2; i++){
			this.shop_list.push(new Shop());
			this.shop_list[i].type = i;
			this.shop_list[i].num = 0;
			this.shop_list[i].x;
			this.shop_list[i].y = this.height / 6 + this.height / 12;
			this.shop_list[i].width;
			this.shop_list[i].height;
		}
		
	};
	
	this.level1 = function(){	
	
		this.player = new Player();
			
		this.character_panel_x = this.canvas.width * 650 / 850;
		this.character_panel_y = 0;
		this.character_panel_width = this.canvas.width * 200 / 850;
		this.character_panel_height = this.canvas.height;
			
		this.states_panel_x = 0;
		this.states_panel_y = 0;
		this.states_panel_width = this.canvas.width * 650 / 850;
		this.states_panel_height = this.canvas.height / 10;
		
		this.platform = [];
		this.gravity = 5;
		this.level = 1;
		
		this.t = 1;
		this.score = 0;
			
		this.backgroundy = 0;
		this.background_speed = 0.5;
	};
	

	
	this.update = function(){
		
		/*creak platform*/
		if (this.platform.length === 0){/*creat player and first platform*/
			this.platform.push(new Platform());

			this.player.x = this.platform[0].x + this.platform[0].width / 2 - this.player.width / 2;
			this.player.y = this.platform[0].y - this.player.height;
		}
		else if (this.platform[this.platform.length - 1].y < this.height - this.height / 20){
			if (Math.random() > 0.925 || this.platform[this.platform.length - 1].y < this.height * 2 / 5){
				this.platform.push(new Platform());
			}
		}
		
		
		/*move platform*/
		for (let i in this.platform){
			this.platform[i].y -= this.platform[i].speed;
		}
		
		/*distory platform*/
		for (let i = 0; i < this.platform.length; i++){
			if (this.platform[i].y + this.platform[i].height < 0){
				this.platform.splice(i, 1);
				i--;
			}
		}
		
		/*player is drop*/
		if (this.player.is_drop){
			this.player.y += this.gravity * (this.t) * (this.t);
		}
		
		/*player is under the platform*/
		for (let i in this.platform){
			if (this.player.x + this.player.width * 2 / 3 > this.platform[i].x && this.player.x + this.player.width * 1 / 3 < this.platform[i].x + this.platform[i].width){
				if (this.player.y + this.player.height === this.platform[i].y + this.platform[i].speed){
					if (this.player.y <= this.states_panel_height){
						this.player.is_drop = true;
						this.t = 1;
						music.boom.load;
						music.boom.play();
						this.player.hp -= 10;
						break;
					}
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
				else if (this.player.y + this.player.height <= this.platform[i].y && this.player.y + this.player.height >= this.platform[i].y - this.gravity * (this.t + 0.04) * (this.t + 0.04) - this.platform[i].speed){
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
		
		/*player is speed up*/
		if (this.player.is_speed_up === true && this.player.stamina >= 1){
			this.player.stamina--;
		}
		if (this.player.stamina <= 1){
			if (this.player.is_speed_up === true){
				this.player.move_speed -= this.player.speed_up;
				this.player.is_speed_up = false;
			}
		}

		/*set image when player moving*/
		if (this.player.left === false && this.player.right === false){
			this.player.image_x = image.girl.width / 3;
			this.player.image_y = 0;		
		}
		if (this.player.left === true){
			this.player.image_x += this.player.width;
			this.player.image_x %= (3 * this.player.width);
			this.player.image_y = this.player.height;
		}
		if (this.player.right === true){
			this.player.image_x += this.player.width;
			this.player.image_x %= (3 * this.player.width);
			this.player.image_y = 2 * this.player.height;
		}
		
		
		this.score++;

		
		/* Game over */
		if (this.player.y + this.player.height >= this.height + 100){
			this.Gameover();
		}
		
		if (this.player.hp <= 0){
			this.Gameover();
		}
		
		/*complete*/
		if (Math.floor(this.score / 30) >= 0){
			//this.Completed();
		}
		
		
		if (FPS !== 0 && globalEvent === 'start'){
			let self = this;
			setTimeout(function(){self.update();}, 1000 / FPS);
		}
	};

	this.setEvent = function(){
		/*play move*/
		let self = this;
		const play_move = setInterval(
				function(){
					if (self.player.left){
						if (self.player.x > 0 && self.player.x < self.player.move_speed)
							self.player.x = 0;
						else if (self.player.x > 0)
							self.player.x -= self.player.move_speed;

					}
					if (self.player.right){
						if (self.player.x + self.player.width <= self.width && self.player.x + self.player.width >= self.width - self.player.move_speed)
							self.player.x = self.width - self.player.width;
						else if (self.player.x + self.player.width <= self.width)
							self.player.x += self.player.move_speed;
					}
						},10);
		/*set time to control gravity*/
		const play_drop = setInterval(function(){if (self.t < 2.5) self.t += 0.02;}, 1000/50);
	};
};

Game.prototype.title = function(){
	


	/*show title*/
	
	if (FPS !== 0 && globalEvent === 'title'){
		let self = this;
		setTimeout(function(){self.title();}, 1000 / FPS);
	}
};

Game.prototype.Completed = function(){
	if (this.level === 1){
		music.background.pause();
		music.background.current = 0.0;
		//music.shop
		globalEvent = 'shop';		
		this.shop();
	}
};

Game.prototype.shop = function(){
	
	function add(s){

	}
		if (FPS !== 0){
			let self = this;
			setTimeout(function(){self.shop();}, 1000 / FPS);
		}
};

Game.prototype.drawCtx = function(){
	
	if (globalEvent === 'title'){
		this.ctx.drawImage(image.title, 0, 0, this.width, this.height);
		this.draw('start', this.width / 3, this.height / 3, this.width / 3, this.height / 15);
		this.ctx.drawImage(image.arrow, this.width / 4, this.height / 3 - 2, this.height / 15, this.height / 15);
	}
	
	if (globalEvent === 'start'){
		/*draw background*/
		//this.ctx.clearRect(this.x, this.y, this.width, this.height);
		for (let i = 0; i < Math.ceil(this.height / image.background.height) + 1; i++){
			this.ctx.drawImage(image.background, 0, i * image.background.height - Math.floor(this.backgroundy % image.background.height));
		}
		
		this.backgroundy += this.background_speed;
		if (this.backgroundy === image.background.height){
			this.backgroundy %= image.background.height;
		}
		
		/*draw player*/
		this.ctx.drawImage(image.girl,
					this.player.image_x, this.player.image_y,
					this.player.width, this.player.height,
					this.player.x, this.player.y,
					this.player.width, this.player.height);

		/*draw platform*/
		for (let i in this.platform){
			this.ctx.drawImage(image.platform,
								this.platform[i].x, this.platform[i].y,
								this.platform[i].width, this.platform[i].height);
		}
		
	}
		

	
	if (globalEvent === 'shop'){
		/*draw shop background*/
		this.ctx.drawImage(image.shop_background, 0, 0, this.width, this.height);
		/*draw shop list one*/
		this.ctx.drawImage(image.potion1, this.width / 4, this.height / 6, this.width / 20, this.width / 15);
		this.ctx.drawImage(image.cell, this.width / 12, this.height / 6 , this.width / 10, this.width / 15);
		this.draw(String(this.shop_list[0].num), this.width / 12 + this.width / 60, this.height / 6 + this.width / 180, this.width / 15, this.width / 18);
		/*draw shop list two*/
		this.ctx.drawImage(image.potion2, this.width / 4, this.height / 4, this.width / 20, this.width / 15);
		this.ctx.drawImage(image.cell, this.width / 12, this.height / 4 , this.width / 10, this.width / 15);
		this.draw(String(this.shop_list[1].num), this.width / 12 + this.width / 60, this.height / 4 + this.width / 180, this.width / 15, this.width / 18);
		/*draw choice list*/
		//this
	}
	
	if (globalEvent !== 'title'){
				let num;
		/*draw character panel*/
		this.ctx.drawImage(image.character_panel, this.character_panel_x, this.character_panel_y, this.character_panel_width, this.character_panel_height);
		/*draw icon frame*/
		this.ctx.drawImage(image.icon_frame, this.character_panel_x + this.character_panel_width / 8, this.character_panel_height / 12, this.character_panel_width * 3 / 4, this.character_panel_width * 3 / 4);
		/*draw icon*/
		this.draw('icon_normal', this.character_panel_x + this.character_panel_width / 5, this.character_panel_height / 10, this.character_panel_width * 3 / 5, this.character_panel_width * 3 / 5);
		/*draw score*/
		this.ctx.font = "bold 25px Microsoft JhengHei ";
		this.ctx.fillText('score:', this.character_panel_x + this.character_panel_width / 8, this.character_panel_height / 3);
		num = String(Math.floor(this.score / 30)).split("");
		for (let i in num){
			this.draw(num[i], this.character_panel_x + this.character_panel_width / 2 + this.character_panel_width / 10 * i, this.character_panel_height / 3 - 25, this.character_panel_width / 10, this.character_panel_height / 20);
		}
		/*draw gold*/
		this.ctx.fillText('gold:', this.character_panel_x + this.character_panel_width / 8, this.character_panel_height / 3 + this.character_panel_height / 20 );
		num = String(this.player.gold).split("");
		for (let i in num){
			this.draw(num[i], this.character_panel_x + this.character_panel_width / 2 + this.character_panel_width / 10 * i, this.character_panel_height / 3 + this.character_panel_height / 20 - 25, this.character_panel_width / 10, this.character_panel_height / 20);
		}
		/*draw item frame*/
		this.ctx.drawImage(image.item_frame, this.character_panel_x + this.character_panel_width / 8, this.character_panel_height / 2, this.character_panel_width * 6 / 8, this.character_panel_width * 6 / 8);
		
		
		/*draw states panel*/
		this.ctx.drawImage(image.states_panel, this.states_panel_x, this.states_panel_y, this.states_panel_width, this.states_panel_height);
		/*hp letter*/
		this.draw('hp', this.states_panel_width / 20, this.states_panel_height / 10, this.states_panel_width / 10, this.states_panel_height * 9 / 10);
		/*hp*/
		this.ctx.drawImage(image.hp, 5, 0, (image.hp.width - 10) * this.player.hp / this.player.r_hp + 5, image.hp.height, this.states_panel_width / 6, this.states_panel_height / 3, this.states_panel_width / 4 * this.player.hp / this.player.r_hp, this.states_panel_height / 3);
		/*frame*/
		this.ctx.drawImage(image.states_frame, this.states_panel_width / 6, this.states_panel_height / 3, this.states_panel_width / 4, this.states_panel_height / 3 );
		/*stamina letter*/
		this.draw('energy', this.states_panel_width * 3 / 7, this.states_panel_height / 10, this.states_panel_width * 3 / 10, this.states_panel_height * 9 / 10);
		/*stanima*/
		this.ctx.drawImage(image.stamina, 5, 0, (image.hp.width - 10) * this.player.stamina / this.player.r_stamina + 5, image.hp.height, this.states_panel_width * 11 / 15, this.states_panel_height / 3, this.states_panel_width / 4 * this.player.stamina / this.player.r_stamina, this.states_panel_height / 3);
		/*frame*/
		this.ctx.drawImage(image.states_frame, this.states_panel_width * 11 / 15, this.states_panel_height / 3, this.states_panel_width / 4, this.states_panel_height / 3 );
	
	}
	
	/*update canvas*/
	let self = this;
		requestAnimationFrame(function(){
			self.drawCtx();
	});
};

Game.prototype.draw = function(obj, x, y, width, height){

	let h;
	let w;
	h = image.number.height / 2;
	w = image.number.width / 5;
	
	/*number*/
	if (obj === '0'){
		this.ctx.drawImage(image.number, 0, 0, w, h, x, y, width, height);
	}
	if (obj === '1'){
		this.ctx.drawImage(image.number, w, 0, w, h, x, y, width, height);
	}
	if (obj === '2'){
		this.ctx.drawImage(image.number, 2 * w, 0, w, h, x, y, width, height);
	}
	if (obj === '3'){
		this.ctx.drawImage(image.number, 3 * w, 0, w, h, x, y, width, height);
	}
	if (obj === '4'){
		this.ctx.drawImage(image.number, 4 * w, 0, w, h, x, y, width, height);
	}
	if (obj === '5'){
		this.ctx.drawImage(image.number, 0, h, w, h, x, y, width, height);
	}
	if (obj === '6'){
		this.ctx.drawImage(image.number, w, h, w, h, x, y, width, height);
	}
	if (obj === '7'){
		this.ctx.drawImage(image.number, 2 * w, h, w, h, x, y, width, height);
	}
	if (obj === '8'){
		this.ctx.drawImage(image.number, 3 * w, h, w, h, x, y, width, height);
	}
	if (obj === '9'){
		this.ctx.drawImage(image.number, 4 * w, h, w, h, x, y, width, height);
	}
	
	/*two letter*/
	h = image.message_2.height / 7;
	w = image.message_2.width / 5;
	
	if (obj === 'hp'){
		this.ctx.drawImage(image.message_2, 0, 3 * h, w, h, x, y, width, height);
	}
	
	/*five letter*/
	h = image.message_5.height / 14;
	w = image.message_5.width / 3;
	
	if (obj === 'score'){
		this.ctx.drawImage(image.message_5, 2 * w, 5 * h, w, h, x, y, width, height);
	}
	if (obj === 'start'){
		this.ctx.drawImage(image.message_5, 0, 0, w, h, x, y, width, height);
	}
	
	/*six letter*/
	h = image.message_6.height / 11;
	w = image.message_6.width / 2;
	
	if (obj === 'energy'){
		this.ctx.drawImage(image.message_6, w, 10 * h, w, h, x, y, width, height);
	}
	
	
	/*icon*/
	h = image.icon.height / 2;
	w = image.icon.width / 4;
	if (obj === 'icon_normal'){
		this.ctx.drawImage(image.icon, 0, 0, w, h, x, y, width, height);
	}

};


Game.prototype.keydown = function(e){

	if (globalEvent === 'title'){
		switch(e.keyCode||e.which){
			/*up*/
			case 38:
				break;
			/*down*/
			case 40:
				break;
			case 13:
				if (this.choice === 'start'){
					this.start();
				}
				break;
		}
	}
	
	if (globalEvent === 'start'){
		switch(e.keyCode || e.which){
			/*shift*/
			case 16:
				if (this.player.is_speed_up === false && this.player.stamina >= 1){
					this.player.move_speed += this.player.speed_up;
					this.player.is_speed_up = true;
				}
				break;
			/*left*/
			case 37:
				if (this.player.x <= 0){
					this.player.left = false;
					}
				else{
					this.player.left = true;
				}
				break;
			/*right*/
			case 39:
				if (this.player.x + this.player.width >= this.width){
					this.player.right = false;
					}
				else{
					this.player.right = true;
				}
				break;
		}
	}
};

Game.prototype.keyup = function(e){

	if (globalEvent === 'start'){
		switch(e.keyCode||e.which){
			case 16:
				if (this.player.is_speed_up === true){
					this.player.move_speed -= this.player.speed_up;
					this.player.is_speed_up = false;
				}
				break;
			/*left*/
			case 37:
				if (this.player.left === true){
					this.player.left = false;
				}
				break;
			/*right*/
			case 39:
				if (this.player.right === true){
					this.player.right = false;
				}
				break;
		}
	}
};

Game.prototype.Gameover = function(){
	this.level1();
};

function sleep(milliseconds) {
	const start = new Date().getTime();
	for (let i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
}

window.onload = function(){
	var sprites = {
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
		message_2 : "./image/two_letter.png",
		message_5 : "./image/five_letter.png",
		message_6 : "./image/six_letter.png",
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
	
	var music_source = {
		title : "./music/title.mp3",
		drop : "./music/drop.mp3",
		background : "./music/background.mp3",
		boom : "./music/boom.mp3",
		system1 : "./music/system1.mp3"
	};
	
	var init = function(){
		game = new Game();
		window.addEventListener('keydown', function(e){game.keydown(e);}, true);
		window.addEventListener('keyup', function(e){game.keyup(e);}, true);
		music.title.load;
		music.title.loop = true;
		music.title.play();
		game.canvas = document.querySelector('#NS-SHAFT');
		game.canvas.style = "margin:0 auto; display: block;";
		game.ctx = game.canvas.getContext("2d");
		game.x = 0;
		game.y = 0;
		game.width = game.canvas.width * 650 / 850;
		game.height = game.canvas.height;
		globalEvent = 'title';
		game.choice = 'start';
		game.shop_init();
		game.title();
		game.drawCtx();

	};


	loadMusic(music_source, function(mus){
		music = mus;
		});
	
	
	loadImages(sprites, function(imgs){
		image = imgs;
		init();
	});
};
