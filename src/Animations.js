let Animations = {
	morph: (curves, time /*time in seconds*/, fps /*frames per second*/,executewithin, executeafter = null) => {
		let k = 0;
		let tab1 = [], tab2 = [];
		let nbf = time*fps;
		var maininterval = window.setInterval(function(){
			if(k <= nbf){
				if(k == 0){
					for(let i = 0; i < curves[0].X.length; i++){
						tab1[i] = curves[0].X[i];
						tab2[i] = curves[0].Y[i];
					}
				}
				else{
					for(let i = 0; i < curves[0].X.length; i++){
						//console.log((curves[1].Y)[i] + (curves[0].Y)[i])/2
						tab1[i] = k*(curves[1].X[curves[1].X.length - 1 - i] - curves[0].X[i])/nbf + curves[0].X[i];
						let ai = (curves[0].Y[i] - curves[1].Y[curves[1].Y.length - 1 - i])/(curves[0].X[i] - curves[1].X[curves[1].X.length - 1 - i]);
						let bi = curves[0].Y[i] - ai*curves[0].X[i];
						tab2[i] = ai*tab1[i] + bi;
					}
				}						
				//console.log(tab2);
				executewithin(tab1, tab2);
				//(new curves[1]d(tab1, tab2, "#3A539B", 3)).draw();
				//console.log("Iteration number " + k);
			}
			else{
				window.clearInterval(maininterval);	
				//executeafter();
				//tab2 = [];	
			}
			k++;
		}, (time/nbf));
		return maininterval;
	},
};

export default Animations;