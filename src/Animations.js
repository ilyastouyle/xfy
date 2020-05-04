let Animations = {
	morph: (curves, frameNumber, nbf, executewithin, executeafter = null) => {
		let tab1 = [], tab2 = [];
		let k = frameNumber;
		let n = nbf;
		if(k <= nbf){
			if(k == 0){
				for(let i = 0; i < curves[0].X.length; i++){
					tab1[i] = curves[0].X[i];
					tab2[i] = curves[0].Y[i];
				}
			}
			else{
				for(let i = 0; i < curves[0].X.length; i++){
					tab1[i] = k*(curves[1].X[i] - curves[0].X[i])/n + curves[0].X[i];
					tab2[i] = k*(curves[1].Y[i] - curves[0].Y[i])/n + curves[0].Y[i];
				}
			}				
		executewithin(tab1, tab2);
		}
	},
};

export default Animations;