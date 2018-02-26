var rl = function reinforcementLearning(){
    
    this.numInput;
    this.numHidden = [];
    this.numOutput;
    
    this.loop = 0;
    this.step = 0;
    this.batchsize = 20;
    this.episode = 20;
    this.learningRate = 0.025;
    this.lastlayer = [];
    this.action = [];
    this.reward = [];
    this.states = [];
    
    this.weight = {
        IntputHidden : [],    /*input  to hidden*/
        HiddenHidden : [],    /*hidden to hidden*/
        HiddenOutput : [],    /*hidden to output*/
        
        bestIntputHidden : [],
        bestHiddenOutput : [],

        bestscore : 0,

    }
    
    this.neuron = {
        input  : [],
        hidden : [],
        output : [],
        
        bestOutput : [],
        
        errorInput : [],
        errorHidden : [],
        errorOutput : []
    }
}

rl.prototype.sigmoid = function(x) {
    return 1 / (1 + Math.exp(-x));
} 
    
rl.prototype.tanh = function(x){
    return 1 / (1 + Math.tanh(x));
}
    
rl.prototype.ReLU = function(x){
    return (a > 0)? a : 0;
}

rl.prototype.softmax = function(lastlayer) {
    const logits = lastlayer.map((num) => Math.exp(num));
    const sum = logits.reduce((accumulator, num) => accumulator + num);
    const mean = logits.map((num) => num/sum);
    return mean;
}

rl.prototype.remean = function(lastlayer) {
    const sum = lastlayer.reduce((accumulator, num) => accumulator + num);
    const mean = lastlayer.map((num) => num/sum);
    return mean;
}

rl.prototype.network = function(){
    

    this.numInput = arguments[0];
    for (let i = 1; i < arguments.length - 1; i++){
        this.numHidden.push(arguments[i]);
    }
    this.numOutput = arguments[arguments.length - 1];
    
    /*generate weight form input to hidden_begin*/
    for (let i = 0; i < this.numInput; i++){
        this.weight.IntputHidden[i] = [];
        for (let j = 0; j < this.numHidden[0]; j++){
            this.weight.IntputHidden[i].push(2*Math.random() - 1);
        }
    }
    
    /*generate weight form hidden_begin to hidden_end*/
    for (let i = 0; i < this.numHidden.length - 1; i++){
        this.weight.HiddenHidden[i] = [];
        for (let j = 0; j < this.numHidden[i]; j++){
            this.weight.HiddenHidden[i][j] = [];
            for (let k = 0; k < this.numHidden[i + 1]; k++){
                this.weight.HiddenHidden[i][j].push(2*Math.random() - 1);
            }
        }
    }
    
    /*generate weight form hidden_end to output*/
    for (let i = 0; i < this.numHidden[this.numHidden.length - 1]; i++){
        this.weight.HiddenOutput[i] = [];
        for (let j = 0; j < this.numOutput; j++){
            this.weight.HiddenOutput[i].push(2*Math.random() - 1);
        }
    }

}

rl.prototype.compute = function(userdata){
    this.neuron.input = userdata;
    
    for (let i = 0; i < this.numHidden.length; i++){
        this.neuron.hidden[i] = [];
        for (let j = 0; j < this.numHidden[i]; j++){
            this.neuron.hidden[i][j] = 0;
        }
    }
    
    for (let i = 0; i < this.numOutput; i++){
        this.neuron.output[i] = 0;
    }
    
    for (let i = 0; i < this.numHidden[0]; i++){
        for (let j = 0; j < this.numInput; j++){
            this.neuron.hidden[0][i] += this.neuron.input[j] * this.weight.IntputHidden[j][i];
        }
        this.neuron.hidden[0][i] = this.sigmoid(this.neuron.hidden[0][i]);
    }
    
    for (let i = 0; i < this.numHidden.length - 1 ; i++){
        for (let j = 0; j < this.numHidden[i + 1]; j++){
            for (let k = 0; k < this.numHidden[i]; k++){
                this.neuron.hidden[i + 1][j] += this.neuron.hidden[i][k] * this.weight.HiddenHidden[i][k][j];
            }
            this.neuron.hidden[i + 1][j] = this.sigmoid(this.neuron.hidden[i + 1][j]);
        }
    }
    
    for (let i = 0; i < this.numOutput; i++){
        for (let j = 0; j < this.numHidden[this.numHidden.length - 1]; j++){
            this.neuron.output[i] += this.neuron.hidden[this.numHidden.length - 1][j] * this.weight.HiddenOutput[j][i];
        }
        this.neuron.output[i] = this.sigmoid(this.neuron.output[i]);
    }
    
    return this.neuron.output;
}

rl.prototype.train = function(intput, bestout){
    
    this.neuron.output = this.compute(intput);
    this.neuron.bestOutput = bestout;
    
    
    for (let l = 0; l < this.episode; l++){
    /*calculate error*/ 
        this.neuron.errorOutput = [];
        this.neuron.errorHidden = [];
        
        for (let i = 0; i < this.numHidden.length; i++){
            this.neuron.errorHidden[i] = [];
        }
        
        for (let i = 0; i < this.numOutput; i++){
            this.neuron.errorOutput.push(this.neuron.output[i] * (1 - this.neuron.output[i]) 
                                          * (this.neuron.bestOutput[i] - this.neuron.output[i]));
        }
        
        for (let i = 0; i < this.numHidden[this.numHidden.length - 1]; i++){
            let outError = 0;
            for (let j = 0; j < this.numOutput; j++){
                outError += this.neuron.errorOutput[j] * this.weight.HiddenOutput[i][j];
            }
            this.neuron.errorHidden[this.numHidden.length - 1].
            push(outError * this.neuron.hidden[this.neuron.hidden.length - 1][i] *
                (1 - this.neuron.hidden[this.numHidden.length - 1][i]));
        }
        
        for (let i = this.numHidden.length - 2; i >= 0; i--){
            for (let j = 0; j < this.numHidden[i]; j++){
                let hiddenError = 0;
                for (let k = 0; k < this.numHidden[i + 1]; k++){
                    hiddenError += this.neuron.errorHidden[i + 1][k] * this.weight.HiddenHidden[i][j][k];
                }
                this.neuron.errorHidden[i].push(hiddenError * this.neuron.hidden[i][j] * (1 - this.neuron.hidden[i][j]));

            }
        }
    /*********************/
    
        for (let i = 0; i < this.numHidden[0]; i++){
            for (let j = 0; j < this.numInput; j++){
                this.weight.IntputHidden[j][i] += this.learningRate * this.neuron.errorHidden[0][i] * this.neuron.input[j];
            }
        }
        
        
        for (let i = 0; i < this.numHidden.length - 1; i++){
            for (let j = 0; j < this.numHidden[i + 1]; j++){
                for (let k = 0; k < this.numHidden[i]; k++){
                    this.weight.HiddenHidden[i][k][j] += this.learningRate * this.neuron.errorHidden[i + 1][j] * this.neuron.hidden[i][k];
                }
            }
        }
        
        
        for (let i = 0; i < this.numOutput; i++){
            for (let j = 0; j < this.numHidden; j++){
                this.weight.HiddenOutput[j][i] += this.learningRate * this.neuron.errorOutput[i] * this.neuron.hidden[this.neuron.hidden.length - 1][j];
            }
        }
    }
    
}

rl.prototype.mcpg = function MonteCarloPolicyGradient() {
    let baseline = this.reward.reduce((acculator, num) => acculator + num)/this.episode/4;
    for(let episode = 0; episode < this.episode; episode++) {
        for(let step = 0; step < this.step[episode]; step++) {
            this.compute(this.states[episode][step]);
            let lastlayer = this.lastlayer;
            let action = this.action;
            this.neuron.errorOutput = [];
            this.neuron.errorHidden = [];
            
            for (let i = 0; i < this.numHidden.length; i++){
                this.neuron.errorHidden[i] = [];
            }
            
            for (let i = 0; i < this.numOutput; i++){
                this.neuron.errorOutput.push(1 - lastlayer[episode][step][i]);
            }
            
            for (let i = 0; i < this.numHidden[this.numHidden.length - 1]; i++){
                let outError = 0;
                for (let j = 0; j < this.numOutput; j++){
                    outError += this.neuron.errorOutput[j]*this.weight.HiddenOutput[i][j];
                }
                this.neuron.errorHidden[this.numHidden.length - 1].
                push(outError*this.neuron.hidden[this.neuron.hidden.length - 1][i] *
                (1 - this.neuron.hidden[this.numHidden.length - 1][i]));
            }
            
            for (let i = this.numHidden.length - 2; i >= 0; i--){
                for (let j = 0; j < this.numHidden[i]; j++){
                    let hiddenError = 0;
                    for (let k = 0; k < this.numHidden[i + 1]; k++){
                        hiddenError += this.neuron.errorHidden[i + 1][k] * this.weight.HiddenHidden[i][j][k];
                    }
                    this.neuron.errorHidden[i].push(hiddenError*this.neuron.hidden[i][j]*(1 - this.neuron.hidden[i][j]));
                }
            }
            
            
            for (let i = 0; i < this.numHidden[0]; i++){
                for (let j = 0; j < this.numInput; j++){
                    this.weight.IntputHidden[j][i] += this.learningRate*this.neuron.errorHidden[0][i]*this.neuron.input[j]*(this.reward[episode] - baseline);
                }
            }
            
            for (let i = 0; i < this.numHidden.length - 1; i++){
                for (let j = 0; j < this.numHidden[i + 1]; j++){
                    for (let k = 0; k < this.numHidden[i]; k++){
                        this.weight.HiddenHidden[i][k][j] += this.learningRate*this.neuron.errorHidden[i + 1][j]*this.neuron.hidden[i][k]*(this.reward[episode] - baseline);
                    }
                }
            }
            
            
            for (let i = 0; i < this.numOutput; i++){
                for (let j = 0; j < this.numHidden; j++){
                    if (this.action[i])
                        this.weight.HiddenOutput[j][i] += this.learningRate*this.neuron.errorOutput[i]*this.neuron.hidden[this.neuron.hidden.length - 1][j]*(this.reward[episode] - baseline);
                }
            }
        }
    }
    log(this.neuron);
    log(this.weight);
}

rl.prototype.pool = function maxPooling(ctx, img, size) {
    let w = Math.floor(img.width/size);
    let h = Math.floor(img.height/size);
    let newImg = ctx.createImageData(w, h);
    let RGBA = [];
    let R = 0;
    let G = 0;
    let B = 0;
    let offsetR;
    let offsetG;
    let offsetB;
    let i;
    let j;
    let m;
    let n;
    for (i = 0; i < w; i++) {
        for (j = 0; j < h; j++) {
            for (m = 0; m < size; m++) {
                for (n = 0; n < size; n++) {
                    offsetR = ((i*size + m)*img.width + (j*size + n))*4 + 0;
                    offsetG = ((i*size + m)*img.width + (j*size + n))*4 + 1;
                    offsetB = ((i*size + m)*img.width + (j*size + n))*4 + 2;
                    R = (R > img.data[offsetR]) ? R : img.data[offsetR];
                    G = (G > img.data[offsetG]) ? G : img.data[offsetG];
                    B = (B > img.data[offsetB]) ? B : img.data[offsetB];
                }
            }
            newImg.data[(i*w + j)*4 + 0] = R;
            newImg.data[(i*w + j)*4 + 1] = G;
            newImg.data[(i*w + j)*4 + 2] = B;
            newImg.data[(i*w + j)*4 + 3] = 255;
            R = 0;
            G = 0;
            B = 0;
        }
    }
    return newImg;
}
