var neuroevolution = function(){
    
    this.numInput;
    this.numHidden = [];
    this.numOutput;
    
    this.loop = 0;
    this.learningRate = 0.3;
    
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
    
    this.sigmoid = function(x){
        return 1 / (1 + Math.exp(-x));
    }
    
    this.tanh = function(x){
        return 1 / (1 + Math.tanh(x));
    }
    
    this.ReLU = function(x){
        return (a > 0)? a : 0;
    }
}

neuroevolution.prototype.network = function(){
    

    this.numInput = arguments[0];
    for (let i = 1; i < arguments.length - 1; i++){
        this.numHidden.push(arguments[i]);
    }
    this.numOutput = arguments[arguments.length - 1];
    
    /*generate weight form input to hidden_begin*/
    for (let i = 0; i < this.numInput; i++){
        this.weight.IntputHidden[i] = [];
        for (let j = 0; j < this.numHidden[0]; j++){
            this.weight.IntputHidden[i].push(2 * Math.random() - 1);
        }
    }
    
    /*generate weight form hidden_begin to hidden_end*/
    for (let i = 0; i < this.numHidden.length - 1; i++){
        this.weight.HiddenHidden[i] = [];
        for (let j = 0; j < this.numHidden[i]; j++){
            this.weight.HiddenHidden[i][j] = [];
            for (let k = 0; k < this.numHidden[i + 1]; k++){
                this.weight.HiddenHidden[i][j].push(2 * Math.random() - 1);
            }
        }
    }
    
    /*generate weight form hidden_end to output*/
    for (let i = 0; i < this.numHidden[this.numHidden.length - 1]; i++){
        this.weight.HiddenOutput[i] = [];
        for (let j = 0; j < this.numOutput; j++){
            this.weight.HiddenOutput[i].push(2 * Math.random() - 1);
        }
    }

}

neuroevolution.prototype.compute = function(userdata){
    
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
            //console.log('3:' + this.weight.IntputHidden[j][i]);
        }
        this.neuron.hidden[0][i] = this.sigmoid(this.neuron.hidden[0][i]);
    }
    
    for (let i = 0; i < this.numHidden.length - 1 ; i++){
        for (let j = 0; j < this.numHidden[i + 1]; j++){
            for (let k = 0; k < this.numHidden[i]; k++){
                this.neuron.hidden[i + 1][j] += this.neuron.hidden[i][k] * this.weight.HiddenHidden[i][k][j];
                //console.log('4:' + this.neuron.hidden[i][k]);
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

neuroevolution.prototype.train = function(intput, bestout, loop){
    
    this.neuron.output = this.compute(intput);
    this.neuron.bestOutput = bestout;
    
    
    for (let l = 0; l < loop; l++){
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
                    //console.log('5:' + this.neuron.errorHidden[i + 1][k]);
                    //console.log('6:' + this.weight.HiddenHidden[i][j][k]);
                }
                this.neuron.errorHidden[i].push(hiddenError * this.neuron.hidden[i][j] * (1 - this.neuron.hidden[i][j]));
                //console.log('7:' + this.neuron.hidden[i][j]);
                //console.log('8:' + this.neuron.errorHidden[i]);
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
                    //console.log('9:' + this.weight.HiddenHidden[i][k][j]);
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


