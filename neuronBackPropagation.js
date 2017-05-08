var neuroevolution = function(){
	
	var numInput;
	var numHidden;
	var numOutput;
	
	var loop = 0;
	
	var learningRate = 0.3;
	
	this.weight = {
		intohd : [],    /*input to hidden*/
		hdtoou : [],    /*hidden to output*/
		
		bestIntohd : [],
		bestHdtoou : [],
		
		tmpintohd : [],
		tmphdtoou : [],
		
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
		return (a > 0)?a : 0;
	}
	
	this.network = function(input, hidden, output){
		
		numInput = input;
		numHidden = hidden;
		numOutput = output;
		
		/*generate weight*/
		for (i = 0; i < numInput; i++){
			this.weight.intohd[i] = [];
			for (j = 0; j < numHidden; j++){
				this.weight.intohd[i].push(2 * Math.random() - 1);
			}
		}
		
		for (i = 0; i < numHidden; i++){
			this.weight.hdtoou[i] = [];
			for (j = 0; j < numOutput; j++){
				this.weight.hdtoou[i].push(2 * Math.random() - 1);
			}
		}

	}
	
	this.compute = function(userdata){
		
		this.neuron.input = userdata;
		
		for (i = 0; i < numHidden; i++){
			this.neuron.hidden[i] = 0;
		}
		
		for (i = 0; i < numOutput; i++){
			this.neuron.output[i] = 0;
		}
		
		for(i = 0; i < numHidden; i++){
			for(j = 0; j < numInput; j++){
				this.neuron.hidden[i] += this.neuron.input[j] * this.weight.intohd[j][i];
			}
			this.neuron.hidden[i] = this.sigmoid(this.neuron.hidden[i]);
		}
		
		for(i = 0; i < numOutput; i++){
			for(j = 0; j < numHidden; j++){
				this.neuron.output[i] += this.neuron.hidden[j] * this.weight.hdtoou[j][i];
			}
			this.neuron.output[i] = this.sigmoid(this.neuron.output[i]);
		}



		return this.neuron.output;
	}

	this.update = function(userInput, useroutput, bestout){
		

		
/*
		if(this.weight.bestscore == 0){
			
			var hiddenData = [];
			this.neuron.bestOutput = [];
			
			for(i = 0; i < numHidden; i++){
				var tmp = 0;
				for(j = 0; j < numInput; j++){
					tmp += userInput[j] * this.weight.intohd[j][i];
				}
				hiddenData.push(tmp);
			}
			
			for(i = 0; i < numOutput; i++){
				var tmp = 0;
				for(j = 0; j < numHidden; j++){
					tmp += hiddenData[j] * this.weight.hdtoou[j][i];
				}
				this.neuron.bestOutput.push(tmp);
			}

			for(i = 0; i < numInput; i++){
				this.weight.bestIntohd[i] = [];
				this.weight.tmpintohd[i] = [];
			}
			
			for(i = 0; i < numHidden; i++){
				this.weight.bestHdtoou[i] = [];
				this.weight.tmphdtoou[i] = [];
			}
			
			this.weight.bestscore = score;
			
			for (i = 0; i < numHidden; i++)
				for(j = 0; j < numInput; j++){
					this.weight.bestIntohd[j].push(this.weight.intohd[j][i]);
				}
				
			for (i = 0; i < numOutput; i++)
				for(j = 0; j < numHidden; j++){
					this.weight.bestHdtoou[j].push(this.weight.hdtoou[j][i]);
				}
				
			this.network(numInput, numHidden, numOutput);
		
			
			return;
		}
*/
		/*calculate error*/	

		
		this.neuron.output = [];
		
		for(i = 0; i < numOutput; i++)
			this.neuron.output.push(useroutput[i]);
		
		this.neuron.bestOutput = [];
		
		for(i = 0; i < numOutput; i++)
			this.neuron.bestOutput.push(bestout[i]);
		
		
		{
			this.neuron.errorOutput = [];
			this.neuron.errorHidden = [];
		
			for(i = 0; i < numOutput; i++){
				this.neuron.errorOutput.push(this.neuron.output[i] * (1 - this.neuron.output[i]) 
											  * (this.neuron.bestOutput[i] - this.neuron.output[i]));
			}
		
			for(i = 0; i <numHidden; i++){
				var outError = 0;
				for(j = 0; j < numOutput; j++){
					outError += this.neuron.errorOutput[j] * this.weight.hdtoou[i][j];
				}
				this.neuron.errorHidden.push(outError * this.neuron.hidden[i] * (1 - this.neuron.hidden[i]));
			}
		}
		/*********************/
		


			for(i = 0; i < numHidden; i++){
				for(j = 0; j < numInput; j++){
					this.weight.intohd[j][i] += learningRate * this.neuron.errorHidden[i] * this.neuron.input[j];
				}
			}
			
			for(i = 0; i < numOutput; i++){
				for(j = 0; j < numHidden; j++){
					this.weight.hdtoou[j][i] += learningRate * this.neuron.errorOutput[i] * this.neuron.hidden[j];
				}
			}
			/*
			for(i = 0; i < numHidden; i++){
				for(j = 0; j < numInput; j++){
					console.log('inhd w' + j + '' + i + ' ' + this.weight.intohd[j][i]);
				}	
			}
			
			for(i = 0; i < numOutput; i++){
				for(j = 0; j < numHidden; j++){
					console.log('hdou w' + j + '' + i + ' ' + this.weight.hdtoou[j][i]);
				}	
			}
			*/
			return;
	}
	
	this.train = function(intput, bestout, loop){
		
		this.neuron.output = this.compute(intput);
		this.neuron.bestOutput = bestout;
		
		
		for(k = 0; k < loop; k++){
		/*calculate error*/	
			this.neuron.errorOutput = [];
			this.neuron.errorHidden = [];
		
			for(i = 0; i < numOutput; i++){
				this.neuron.errorOutput.push(this.neuron.output[i] * (1 - this.neuron.output[i]) 
											  * (this.neuron.bestOutput[i] - this.neuron.output[i]));
			}
		
			for(i = 0; i <numHidden; i++){
				var outError = 0;
				for(j = 0; j < numOutput; j++){
					outError += this.neuron.errorOutput[j] * this.weight.hdtoou[i][j];
				}
				this.neuron.errorHidden.push(outError * this.neuron.hidden[i] * (1 - this.neuron.hidden[i]));
			}
		/*********************/
		
			for(i = 0; i < numHidden; i++){
				for(j = 0; j < numInput; j++){
					this.weight.intohd[j][i] += learningRate * this.neuron.errorHidden[i] * this.neuron.input[j];
				}
			}
			
			for(i = 0; i < numOutput; i++){
				for(j = 0; j < numHidden; j++){
					this.weight.hdtoou[j][i] += learningRate * this.neuron.errorOutput[i] * this.neuron.hidden[j];
				}
			}
			

			
		}
	}
}


