let Functions = {
	drawYAxis: function drawYAxis(x, color, cheight, context){
		context.beginPath();
		context.strokeStyle = color;
		context.lineWidth = 1;
		context.moveTo(x, 0);		
		context.lineTo(x, cheight);
		context.stroke();
	},
	drawXAxis: function drawXAxis(y, color, cwidth, context){
		context.beginPath();
		context.strokeStyle = color;
		context.lineWidth = 1;
		context.moveTo(0, y);
		context.lineTo(cwidth, y);
		context.moveTo(cwidth, y);
		context.stroke();
	},
	vdash: function vdash(x, y, height, context){
		context.beginPath();
		context.lineWidth = 2;
		context.moveTo(x, y);
		context.lineTo(x, y+height);
		context.moveTo(x, y);
		context.lineTo(x, y-height);
		context.stroke();
		context.lineWidth = 1;
	},
	hdash: function hdash(x, y, width, context){
		context.beginPath();
		context.lineWidth = 2;
		context.moveTo(x, y);
		context.lineTo(x+width, y);
		context.moveTo(x, y);
		context.lineTo(x-width, y);
		context.stroke();
		context.lineWidth = 1;
	},
	subdivide: function subdivide(x_0, x_n, n, tab){
		if(x_0 > x_n){
			for(let i=0; i<=n; i++){
				tab[i] = parseFloat((x_0 - i*(x_0-x_n)/n).toPrecision(12)); 
			}
		}
		else{
			for(let i=0; i<=n; i++){
				tab[i] = parseFloat((x_0 + i*(x_n-x_0)/n).toPrecision(12)); 
			}
		}
	},
	xstep: function xstep(curves){
		let d = 0, mn = this.Minimum(curves[0].X), mx = this.Maximum(curves[0].X);
		for(let i = 1; i < curves.length; i++){
			if(mn > this.Minimum(curves[i].X)){
				mn = this.Minimum(curves[i].X)
			}
		}
		for(let i = 1; i < curves.length; i++){
			if(mx < this.Maximum(curves[i].X)){
				mx = this.Maximum(curves[i].X)
			}
		}
		if(Math.abs(mn) >= Math.abs(mx)){
			if(Math.abs(mn) >= 2){
				while(Math.abs(mn) > 2*d){
					d++;
				}
				return d/10;
			}
			else{
				while(Math.abs(mn) > 2*Math.pow(10, d)){
					d--;
				}
				return Math.pow(10, d - 1);
			}	
		}
		else{
			if(Math.abs(mx) >= 2){
				while(Math.abs(mx) > 2*d){
					d++;
				}
				return d/10;
			}
			else{
				while(Math.abs(mx) > 2*Math.pow(10, d)){
					d--;
				}
				return Math.pow(10, d - 1);
			}	
		}
	},
	ystep: function ystep(min, max, curves){
		let d = 0, mn = this.Minimum(curves[0].Y), mx = this.Maximum(curves[0].Y);
		for(let i = 1; i < curves.length; i++){
			if(mn > this.Minimum(curves[i].Y)){
				mn = this.Minimum(curves[i].Y)
			}
		}
		for(let i = 1; i < curves.length; i++){
			if(mx < this.Maximum(curves[i].Y)){
				mx = this.Maximum(curves[i].Y)
			}
		}
		if(Math.abs(mn) >= Math.abs(mx)){
			if(Math.abs(mn) >= 2){
				while(Math.abs(mn) > 2*d){
					d++;
				}
				return d/5;
			}
			else{
				while(Math.abs(mn) > 2*Math.pow(10, d)){
					d--;
				}
				return Math.pow(10, d - 1);
			}	
		}
		else{
			if(Math.abs(mx) >= 2){
				while(Math.abs(mx) > 2*d){
					d++;
				}
				return d/5;
			}
			else{
				while(Math.abs(mx) > 2*Math.pow(10, d)){
					d--;
				}
				return Math.pow(10, d - 1);
			}	
		}
		/*if(Math.abs(mn) >= 2 && Math.abs(mx) >= 2){
			if(Math.abs(mn) >= Math.abs(mx)){
				while(Math.abs(mn) > 2*d){
					d++;
				}
				return d/5;
			}
			else{
				while(Math.abs(mx) > 2*d){
					d++;
				}
				return d/5;
			}

		else{
			if(Math.abs(mn) >= Math.abs(mx)){
				while(Math.abs(mn) > 2*Math.pow(10, d)){
					d--;
				}
				return Math.pow(10, d - 1);
			}
			else{
				while(Math.abs(mx) > 2*Math.pow(10, d)){
					d--;
				}
				return Math.pow(10, d - 1);
			}
		}*/
	},
	drawOnX: function drawOnX(x, y, xstep, m, thestep, context){
		for(let i = 1; i <= m; i++){
			this.drawYAxis(origin.x + i*thestep, "#DADFE1");
		}
		context.strokeStyle = "#1F3A93";
		context.beginPath();
		for(let i = 0; i <= m+1; i++){
			this.vdash(x + thestep*i, y, 3);
			if(i !== 0 && i%(this.afterComma(xstep)+this.beforeComma(xstep)) === 0){
				this.vdash(x + thestep*i, y, 5);
				context.fillText((i*xstep).toFixed(this.afterComma(xstep)), x + (thestep*i) - 8 - 3*(this.afterComma(xstep)), y + 14, 28 + 3*(this.beforeComma(xstep) + this.afterComma(xstep)));
			}
		}
		context.stroke();
	},
	drawOnY: function drawOnY(x, y, ystep, m, thestep, context){
		for(let i = 1; i <= m; i++){
			this.drawXAxis(origin.y - i*thestep, "#DADFE1");
		}
		context.beginPath();
		context.strokeStyle = "#1F3A93";
		if(ystep < (Math.exp(15))){
			for(let i = 0; i <= m; i++){
				this.hdash(x, y - thestep*i, 3);
				if(i !== 0 && i%2 === 0){
					context.fillText((i*ystep).toFixed(this.afterComma(ystep)), x + 10, y + 2 - (thestep*i), 28 + 3*(this.beforeComma(ystep) + this.afterComma(ystep)));
				}
			}
		}
		else{
			for(let i = 0; i <= m; i++){
				this.hdash(x, y - thestep*i, 3);
				if(i === 10){
					//Infinity
					context.fillText("\u221E", x, y + 2 - (thestep*i), 28);
				}
			}
		}
		context.stroke();
	},
	drawOnMinusX: function drawOnMinusX(x, y, xstep, m, thestep, context){
		for(let i = 1; i <= m + 1; i++){
			this.drawYAxis(origin.x - i*thestep, "#DADFE1");
		}
		context.beginPath();
		context.strokeStyle = "#1F3A93";
		for(let i = 1; i <= m + 1; i++){
			this.vdash(x - thestep*i, y, 3);
			if(i !== 0 && i%(this.afterComma(xstep)+this.beforeComma(xstep)) === 0){
				context.fillText("-" + (i*xstep).toFixed(this.afterComma(xstep)), x - 12 - (thestep*i) - 3*(this.afterComma(xstep)), y + 14, 28 + 3*(this.beforeComma(xstep) + this.afterComma(xstep)));
			}
		}
		context.stroke();
	},
	drawOnMinusY: function drawOnMinusY(x, y, ystep, m, thestep, context){
		for(let i = 1; i <= m; i++){
			this.drawXAxis(origin.y + i*thestep, "#DADFE1");
		}
		context.strokeStyle = "#1F3A93";
		context.beginPath();
		for(let i = 1; i<=m; i++){
			this.hdash(x, y + thestep*i, 3);
			if(i%2 === 0){
				context.fillText(-(i*ystep).toFixed(this.afterComma(ystep)), x + 8, y + (thestep*i), 28 + 3*(this.beforeComma(ystep) + this.afterComma(ystep)));
			}
		}
		context.stroke();
	},
	Xcoord: function Xcoord(p, xstep, thestep, x){
		if(p > 0){
			return x + thestep*(p/xstep);
		}
		else{
			return x - thestep*(Math.abs(p)/xstep);
		}
	},
	Ycoord: function Ycoord(p, ystep, thestep, y){
		if(p > 0){	
			return y - (thestep*(p/ystep));
		}
		else{
			return y + (thestep*(Math.abs(p)/ystep));	
		}
	},
	Maximum: function Maximum(values){
		let max;
		if(values[0] === undefined){
			max = 0;
		}
		else if(isNaN(values[0])){
			max = 0;
		}
		else{
			max = values[0];
		}
		for(let i = 0; i < values.length; i++){
			if(values[i] === undefined){}
			else if(isNaN(values[0])){}
			else{
				if(max < values[i]){
					max = values[i];
				}
			}
		}
		return max;
	},
	//Returns the minimum on a range of values
	Minimum: function Minimum(values){
		let min;
		if(values[0] === undefined){
			min = 0;
		}
		else if(isNaN(values[0])){
			min = 0;
		}
		else{
			min = values[0];
		}
		for(let i = 0; i < values.length; i++){
			if(values[i] === undefined){}
			else if(isNaN(values[0])){}
			else{
				if(min > values[i]){
					min = values[i];
				}
			}
		}
		return min;
	},
	drawRect: function drawRect(x, y, height, width, context){
		context.moveTo(x, y);
		context.lineTo(x, y-height);
		context.lineTo(x + width, y-height);
		context.lineTo(x + width, y);
	},
	//For drawing the riemann rectangles
	drawRiemann: function drawRiemann(width, a, b, n, funct, xstep, ystep, originx, originy, rectanglecolor, context){
		let subdivision = [];
		context.beginPath();
		context.lineWidth = width;
		if(n > 0){
			this.subdivide(a, b, n, subdivision);
			context.beginPath();
			context.strokeStyle = rectanglecolor;
			for(let i = 0; i < subdivision.length - 1; i++){
				this.drawRect(this.Xcoord(subdivision[i], xstep, originx), originy, originy - this.Ycoord(funct((subdivision[i] + subdivision[i+1])/2), ystep, originy), this.Xcoord(subdivision[i+1], xstep, originx) - this.Xcoord(subdivision[i], xstep, originx));
			}
			n = 0;
			context.stroke();
		}else{

		}
	},
	//Takes the width, of the line to draw with, the table of values and their images, x,y steps and the color
	drawCurve: function drawCurve(w, values, images, xstep, ystep, x, y, color, context){
		context.beginPath();
		context.strokeStyle = color;
		context.moveTo(x, y);
		context.lineWidth = w;
		if(ystep < Math.exp(12)){
			for(let i = 0; i < values.length; i++){
				if(!isNaN(images[i])){
					context.moveTo(this.Xcoord(values[i], xstep, x), this.Ycoord(images[i], ystep, y));
					context.lineTo(this.Xcoord(values[i+1], xstep, x), this.Ycoord(images[i+1], ystep, y));
				}
			}
		}
		else{
			for(let i = 0; i <= values.length; i++){
				context.moveTo(this.Xcoord(values[i], xstep, x), this.Ycoord(images[i], ystep, y));
				context.lineTo(this.Xcoord(values[i+1], xstep, x), this.Ycoord(images[i+1], ystep, y));
			}
		}
		context.stroke();
		context.lineWidth = 1;
	},
	evaluateInput: function evaluateInput(input){
		let str = (input).replace(/([^\[]*)\^([^\]]*)/g, function(match, p1, p2, offset, string){return "Math.pow("+ p1.slice(0, -1 )+", "+p2.slice(1, p2.length)+")"; }).replace(/\[/g, "(").replace(/\]/g, ")");
		str = str.replace(/(?!a)\bsin(?!h)\b/g, "Math.sin").replace(/(?!a)\bcos(?!h)\b/g, "Math.cos").replace(/(?!a)\btan(?!h)\b/g, "Math.tan");
		str = str.replace(/sinh/g, "Math.sinh").replace(/cosh/g, "Math.cosh").replace(/tanh/g, "Math.tanh");
		str = str.replace(/asin/g, "Math.asin").replace(/acos/g, "Math.acos").replace(/atan/g, "Math.atan");
		str = str.replace(/exp/g, "Math.exp");
		str = str.replace(/ln/g, "Math.log");
		return str;
	},
	//Stay is a boolean parameter, if it is set to false then the status is shown then hidden, and if it is set to true the status stays till a next update
	afterComma: function afterComma(x){	
		let counter = 1;
		while(x.toFixed(counter) !== x){
			counter++;
		}
		return counter;
	},
	beforeComma: function beforeComma(x){
		let counter  = 1;
		while(x > Math.pow(10, counter)){
			counter++;
		}
		return counter;
	},
	getRandomArbitrary: function getRandomArbitrary(min, max) {
		return Math.random() * (max - min) + min;
	},
	ord: function ord(p, x){
		let i = 0;
		if(x === 0){
			return -1000;
		}
		if(x % p !== 0){
			return 0;
		}
		else{
			while(x % Math.pow(p, i) === 0){
				i++;
			}
			return i-1;
		}
	}
};

export default Functions;