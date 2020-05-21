import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCog, faSave, faAngleUp, faAngleDown, faAngleLeft, faAngleRight, faPencilAlt, faSearchPlus, faSearchMinus, faArrowLeft, faArrowRight, faArrowUp, faArrowDown, faPlus, faPlay, faPause, faStop } from '@fortawesome/free-solid-svg-icons';
import Functions from './Library';
import Animations from './Animations';
import { SketchPicker } from 'react-color';
import './stylesheets/App.css';

//Number of subdivisions of X (and thus Y) and Number of subdivisions for delimiters  
let nbSubdiv = 500, nbSubdivDelim = 50;
let curves = [[], []], animations = [], delimiters = [];
//Global variables linked to canvas (for execution, pausing and stopping animation)
let frameDuration = 0, totalDuration = 0, k = 0, mainLoop = 0, paused = false;

//Function for finding animation involving given curve indices
function findInd(cInd){
	let indice = [];
	animations.forEach((el, ind) => {
		el.curvInd.forEach((element, index) => {
			if(element[0] === cInd[0] && element[1] === cInd[1]){
				indice[0] = ind;
				indice[1] = index;
			};
		});
	});
	return indice;
}
//Function for computing and return delimiters, takes in :
//delimiter width, index, place of delimiter between 0 & nbSubdiv, 
//and number of subdivisions of the delimiter curve (the line), dashes, color
function createDelim(width, cInd, x, nbS, dashes, color){
	let expression = Functions.evaluateInput(curves[cInd[0]][cInd[1]].expressions[0]);
	let y =  (!isNaN(eval(expression))) ? eval(expression) : 0 ;
	let delimiterX = Functions.subdivide(x, x, nbS);
	let delimiterY = Functions.subdivide(0, y, nbS);
	return ({
				x: x,
				width: width,
				delimiterX: delimiterX,
				delimiterY: delimiterY,
				color: color,
				dashes: dashes
			});
}
class Curve2d{
	constructor(X, Y, color, width, dashes, delimiters) {
		this.X = X;
		this.Y = Y;
		this.color = "#f3f1f3";
		this.width = width;
		this.dashes = dashes;
		this.expressions = [null, null, null, null];
		this.delimiters=[];
	}
}
class Animation{
	/* 
		type: type of animation (Integer) 
		anchor: starting point in time (Float)
		duration: duration of animation in seconds (Float)
		fps: frames per second (Integer)
		curvInd: the curves involved in the animation ([[0 or 1, index],[...],...])
	*/
	constructor(type, anchor, duration, fps, curvInd){
		this.type = type;
		this.curvInd = curvInd;
		this.animCurves = [];
		this.anchor = anchor;
		this.duration = duration;
		this.fps = fps;
	}
	execute(steps, thestep, canvasDim, frameNumber, context, executeBefore = () => {} ){
		for(let i = 0; i < this.curvInd.length; i++){
			this.animCurves.push(curves[this.curvInd[i][0]][this.curvInd[i][1]]);
		}
		switch(this.type){
			//no animation
			case 0:
				executeBefore();
				let delim = this.animCurves[0].delimiters;
				Functions.drawCurve(this.animCurves[0].width, this.animCurves[0].dashes, this.animCurves[0].X, this.animCurves[0].Y, steps, thestep, canvasDim[0]/2, canvasDim[1]/2, this.animCurves[0].color, context);
				//let delimitercreateDelim(2, this.curvInd[0], 0, 50, [1, 1], this.animCurves[0].color);
				//Draw Delimiters
				for(let i = 0; i < this.animCurves[0].delimiters.length; i++){
					Functions.drawCurve(delim[i].width, delim[i].dashes, delim[i].delimiterX, delim[i].delimiterY, steps, thestep, canvasDim[0]/2, canvasDim[1]/2, delim[i].color, context);	
				}
				//Functions.drawCurve(2, [1, 2], this.delimitersLX, this.delimitersLY, steps, thestep, canvasDim[0]/2, canvasDim[1]/2, this.animCurves[0].color, context);
				//Functions.drawCurve(2, [1, 2], this.delimitersRX, this.delimitersRY, steps, thestep, canvasDim[0]/2, canvasDim[1]/2, this.animCurves[0].color, context);
				break;
			//morph curve1 into curve2 
			case 1:
				Animations.morph(this.animCurves, frameNumber, this.duration*this.fps, (tab1, tab2) => {
					executeBefore();
					Functions.drawCurve(this.animCurves[0].width, this.animCurves[0].dashes, tab1, tab2, steps, thestep, canvasDim[0]/2, canvasDim[1]/2, this.animCurves[0], context);
				});
				break;
		}
	}
};

class ColorPicker extends React.Component{
	state = {
	    displayColorPicker: false,
	    color: this.props.color,
  	};

  	handleClick = () => {
    	this.setState({ displayColorPicker: !this.state.displayColorPicker })
  	};

	handleClose = () => {
		this.setState({ displayColorPicker: false })
	};

 	handleChange = (color) => {
 		let colorRgb = color.rgb;
    	this.setState({ color: color.hex}, () => this.props.update(color.hex))
  	};

	render() {
		const styles = {
	        view:{
	        	backgroundColor: this.state.color,
	        },
	        popover:{
	          	position: "absolute",
	          	zIndex: "2",
	          	marginTop: "1.5%",
	          	borderRadius: "10px"
	        }
	    };
	    return (
	      		<span className="colorWrapper">
		        	<span style={styles.wrapper}>
		        		<input style={styles.view} onClick={this.handleClick} />
		        		<button style={styles.button} onClick={this.handleClick}><FontAwesomeIcon style={styles.icon} icon={(this.state.displayColorPicker) ? faAngleUp : faAngleDown } /></button>
	        		</span>
	        		{ this.state.displayColorPicker ? <div style={styles.popover}>
	          			<SketchPicker color={this.state.color} onChange={this.handleChange} />
	        		</div> : null }
	      		</span>
	    		)
	}
}
class Delimiter extends React.Component{
	constructor(props) {
	  	super(props);
	
		this.state = {
			x: this.props.x,
			width: this.props.width,
			dashes: this.props.dashes,
			color: this.props.color
		};
	}
	handleDashInput = (e) => {
		if(e.target.value == ""){
			this.setState({dashes: ["a", this.state.dashes[1]]});
		}
		else{
			if(!isNaN(e.target.value)){ 
				this.setState({dashes: [parseInt(e.target.value), this.state.dashes[1]]});
			}
		}
	}
	handleSpacingInput = (e) => {
		if(e.target.value == ""){
			this.setState({dashes: [this.state.dashes[0], "a"]});
		}
		else{
			if(!isNaN(e.target.value)){ 
				this.setState({dashes: [this.state.dashes[0], parseInt(e.target.value)]});
			}
		}
	}
	handleXChange = (e) => {
		if(e.target.value == ""){
			this.setState({x: "a"});
		}
		else{
			if(!isNaN(e.target.value) || e.target.value == "-" || e.target.value == ".") {
				this.setState({x: (isNaN(e.target.value)) ? e.target.value : parseFloat(e.target.value)});
			}
		}
	}
	handleWChange = (e) => {
		if(e.target.value == ""){
			this.setState({width: "a"});
		}
		else{
			if(!isNaN(e.target.value)) {
				this.setState({width: parseInt(e.target.value)});
			}
		}
	}
	thickerW = () => {
		this.setState({width: (this.state.width + 1)});
	}
	thinnerW = () => {
		if(this.state.width > 1){ 
			this.setState({width: (this.state.width - 1)});
		}
	}
	handleColorChange = (color) => {
		this.setState({color: color});
	}
	delete = () => {
		this.props.delete(this.props.ind);
	}
	componentDidUpdate = () => {
		this.props.update(this.props.ind, this.state);
	}
	render(){
		return (<div className="delimWrapper">
					<div className="inpWrapper xPosition">
						<input className="xPosition" value={(this.state.x == "a") ? "" : this.state.x} onChange={this.handleXChange}/>
					</div>
					<div className="inpWrapper thickness">
						<input className="width" value={(this.state.width == "a") ? "" : this.state.width} onChange={this.handleWChange} maxLength="3" />
					</div>
					<button className="thicker" onClick={this.thickerW}><b>+</b></button>
					<button className="thinner" onClick={this.thinnerW}><b>-</b></button>
					<div className="inpWrapper dashes">
						<input className="dash" placeholder="1" value={(this.state.dashes[0] == "a") ? "" : this.state.dashes[0]} onChange={this.handleDashInput}/>
					</div>
					<div className="inpWrapper spacing">
						<input className="spacing" placeholder="0" value={(this.state.dashes[1] == "a") ? "" : this.state.dashes[1]} onChange={this.handleSpacingInput}/>
					</div>
					<ColorPicker update={this.handleColorChange} color={this.state.color}/> 
					<button className="delete" onClick={this.delete}><FontAwesomeIcon icon={faTimes} /></button>
				</div>);
	}
}
//Wrapper Curve: Template for Functional and Parameterized Curves
class WrCurve extends React.Component{
	constructor(props) {
		super(props);
		this.state = { cEdit: 0, modified: [false, false, false, false], error: false };
		//animations.push(new Animation(0, 1, 1, [[this.props.type, this.props.cindex]]));
	}
	componentDidMount(){
		window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, "parameters"]);
	}
	componentDidUpdate(){
		this.input.focus();
		this.input.value = curves[this.props.type][this.props.cindex].expressions[this.state.cEdit - 1];
	}
	previous = () => {
		this.setState({ cEdit: (this.state.cEdit - 1) % 5});
		this.input.value = "";
	};
	next = () => {
		this.setState({modified: this.state.modified.map((el, ind) => {
			if(ind == (this.state.cEdit - 1)) return true;
		})});
		try{
			let expressions = curves[this.props.type][this.props.cindex].expressions;
			let x = 0;
			let test = parseFloat(eval(Functions.evaluateInput(this.input.value)));
			if(!isNaN(test)){
				this.setState({ cEdit: (this.state.cEdit + 1) % 5}, () => {
					if(this.props.type === 0){
						if(!!expressions[1] && !!expressions[2]){
							curves[this.props.type][this.props.cindex].X = Functions.subdivide(parseFloat(expressions[1]), parseFloat(expressions[2]), nbSubdiv);
							for(let i = 0; i < curves[this.props.type][this.props.cindex].X.length; i++){
								let x = (curves[this.props.type][this.props.cindex].X)[i];
								curves[this.props.type][this.props.cindex].Y[i] = eval(Functions.evaluateInput(expressions[0]));
							}
						}
					}
					else{
						if(!!expressions[1] && !!expressions[2] && !!expressions[3]){
							//Subdivided t parameter values tab
							let tab1 = Functions.subdivide(parseFloat(expressions[2]), parseFloat(expressions[3]), nbSubdiv);
							for(let i = 0; i < tab1.length; i++){
								let t = tab1[i];
								curves[this.props.type][this.props.cindex].X[i] = eval(Functions.evaluateInput(expressions[0]));
								curves[this.props.type][this.props.cindex].Y[i] = eval(Functions.evaluateInput(expressions[1]));
							}
						}	
					}
				});
				this.input.value = "";
				this.setState({error: false});
			}
			else{
				this.setState({error: true});
			}
		}
		catch(error){
			this.setState({error: true});
		}
	};
	edit = () => {
		this.setState({ cEdit: 1});
	};	
	save = () => {
		this.setState({modified: this.state.modified.map((el, ind) => {
			if(ind == (this.state.cEdit - 1)) return true;
		})});
		try{
			let expressions = curves[this.props.type][this.props.cindex].expressions;
			let x = 0;
			let test = parseFloat(eval(Functions.evaluateInput(this.input.value)));
			if(!isNaN(test)){
				if(this.props.type === 0){
					if(!!expressions[1] && !!expressions[2]){
						curves[this.props.type][this.props.cindex].X = Functions.subdivide(parseFloat(expressions[1]), parseFloat(expressions[2]), nbSubdiv);
						for(let i = 0; i < curves[this.props.type][this.props.cindex].X.length; i++){
							let x = (curves[this.props.type][this.props.cindex].X)[i];
							curves[this.props.type][this.props.cindex].Y[i] = eval(Functions.evaluateInput(expressions[0]));
						}
					}
				}
				else{
					if(!!expressions[1] && !!expressions[2] && !!expressions[3]){
						//Subdivided t parameter values tab
						let tab1 = Functions.subdivide(parseFloat(expressions[2]), parseFloat(expressions[3]), nbSubdiv);
						for(let i = 0; i < tab1.length; i++){
							let t = tab1[i];
							curves[this.props.type][this.props.cindex].X[i] = eval(Functions.evaluateInput(expressions[0]));
							curves[this.props.type][this.props.cindex].Y[i] = eval(Functions.evaluateInput(expressions[1]));
						}
					}	
				}
				this.input.value = "";
				this.setState({cEdit: 0, error: false});
			}
			else{
				this.setState({error: true});
			}
		}
		catch(error){
			this.setState({error: true});
		}
	};
	handleInputChange = (event) => {
		curves[this.props.type][this.props.cindex].expressions[this.state.cEdit - 1] = event.target.value;
		let x = 0;
		let test;
		try{
			test = parseFloat(eval(Functions.evaluateInput(event.target.value)));
		}
		catch(error){
		}
		if(isNaN(test) && event.target.value != "" && this.state.modified[this.state.cEdit - 1]){
			this.setState({error: true});
		}
		else{
			this.setState({error: false});
		}
	}
	inputHandler = (e) => {
		if(e.which === 13) this.next();
	};
	render(){
		let inputClasses = [], placeholders = [], labels = [];
		let selected = ((this.props.currentSett[0] == this.props.type) && (this.props.currentSett[1] == this.props.cindex));
		if(this.props.type === 0){
			inputClasses = ["f", "selected f", "selected value", "selected value", "selected value"]; 
			placeholders = ["cos(sin(x))", "cos(sin(x))", "-1", "1", "100"];
			labels = ["f_{ " + (this.props.cindex + 1) + " }(x)", "a", "b", "n"];
		}else{
			inputClasses = ["x", "selected x", "selected y", "selected value", "selected value"]
			placeholders = ["cos(t)", "cos(t)", "sin(t)", "-4", "4"];
			labels = ["x_{ " + (this.props.cindex + 1) + " }(t)", "y_{ " + (this.props.cindex + 1) + " }(t)", "a", "b"];
		} 
		return (<span className="input" style={{opacity: (selected) ? 0.4 : 1, pointerEvents: (selected) ? "none" : "auto" }}>
					<div>
						<button className="openS" onClick={() => {if(!this.props.settStatus) this.props.showSett([this.props.type, this.props.cindex])}} style={{display: (this.state.cEdit) ? "none" : "inline"}}><FontAwesomeIcon icon={faCog}/></button>
						<button className="save" onClick={this.save} style={{display: (this.state.cEdit) ? "inline" : "none"}}><FontAwesomeIcon icon={faSave}/></button>
						<button className="previous" onClick={this.previous} style={{display: (this.state.cEdit > 1) ? "inline" : "none"}}><FontAwesomeIcon icon={faAngleLeft} size="lg"/></button>
						<label style={{display: (this.state.cEdit < 2) ? "inline" : "none"}}>&#92;({labels[0]}&#92;)</label>
						<label style={{display: (this.state.cEdit === 2) ? "inline" : "none"}}>&#92;({labels[1]}&#92;)</label>
						<label style={{display: (this.state.cEdit === 3) ? "inline" : "none"}}>&#92;({labels[2]}&#92;)</label>
						<label style={{display: (this.state.cEdit === 4) ? "inline" : "none"}}>&#92;({labels[3]}&#92;)</label>
						<input className={inputClasses[this.state.cEdit] + " " + ((this.state.error) ? "error" : "")} type="text" ref={(input) => { this.input = input; }} onKeyUp={this.inputHandler} placeholder={placeholders[this.state.cEdit]} onChange={this.handleInputChange}/>
						<button className="next" onClick={this.next} style={{display: (this.state.cEdit) ? "inline" : "none"}}><FontAwesomeIcon icon={faAngleRight} size="lg"/></button>
						<button className="edit" onClick={this.edit} style={{display: (this.state.cEdit) ? "none" : "inline"}}><FontAwesomeIcon icon={faPencilAlt}/></button>
					</div>
					<div className="delete" style={{display: (this.state.cEdit || this.props.settStatus) ? "none" : "inline"}}>
						<button className="delete" onClick={() => {this.props.delete([this.props.type, this.props.cindex])}}><FontAwesomeIcon icon={faTimes}/></button>
					</div>
				</span>);
	}
}
class Settings extends React.Component {
	constructor(props){
		super(props);
		let ind = this.props.currentSett;
		delimiters = curves[ind[0]][ind[1]].delimiters;
		this.state = {
			ind: ind,
			thickness: curves[ind[0]][ind[1]].width,
			dashes: curves[ind[0]][ind[1]].dashes,
			delimiters: delimiters,
			color: curves[ind[0]][ind[1]].color,
			anchor: animations[(findInd(ind))[0]].anchor,
			duration: animations[(findInd(ind))[0]].duration,
			animType: animations[(findInd(ind))[0]].type
		};
	}
	componentDidMount(){
		window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, "settWrapper"]);
	}
	save = () => {
		let ind = this.state.ind;
		delimiters = delimiters.map(el => createDelim(el.width, this.state.ind, el.x, nbSubdivDelim, el.dashes, el.color));
		curves[ind[0]][ind[1]].width = this.state.thickness;
		curves[ind[0]][ind[1]].color = this.state.color;
		curves[ind[0]][ind[1]].dashes = this.state.dashes;
		curves[ind[0]][ind[1]].delimiters = delimiters;
		animations[findInd(ind)[0]].anchor = this.state.anchor;
		animations[findInd(ind)[0]].duration = this.state.duration;
		this.props.hide();
	}
	addDelimiter = () => {
		delimiters.push({x: 0, width: 2, dashes: [1, 2], color: "#FFFFFF"});
		this.setState({delimiters: delimiters});
	}
	updateDelim = (index, data) => {
		delimiters[index] = data;
	}
	deleteDelim = (ind) => {
		delimiters.splice(ind, 1);
		this.setState({delimiters: delimiters});
	}
	//<SketchPicker color={(!!this.state.color.hex) ? this.state.color.hex : this.state.color} onChangeComplete={(color) => this.setState({color: color})}/>
	//<ColorPicker color={this.state.curveColor} update={(color) => this.setState({curveColor: color})} />
	render(){
		let ind = this.state.ind;
		return (<div id="settWrapper">
					<nav id="centerControls">
						<span className="title">
							<label>Settings</label>
						</span>
						<span className="buttons">
							<button onClick={this.reset}> Reset </button>
							<button onClick={this.save}> Save </button>
						</span>
					</nav>
					<div id="fsettings">
						<div className="row">
							<div className="subrow curve">
								<label>Curve characteristics</label>
								<div className="wrapper">
									<div className="subwrapper">	
										<label>Thickness</label>																																																																				
										<input type="text" className="thickness" value={this.state.thickness} onChange={(e) => {if(!isNaN(e.target.value) && e.target.value != "") this.setState({thickness: parseInt(e.target.value)})}} maxLength="3" />
										<button className="thicker" onClick={() => this.setState({thickness: (this.state.thickness+1)})}><b>+</b></button>
										<button className="thinner" onClick={() => {if(this.state.thickness > 1) this.setState({thickness: (this.state.thickness-1)})}}><b>-</b></button>
									</div>
									<div className="subwrapper">	
										<label>Dash:Spacing</label>
										<input className="dash" placeholder="1" value={(this.state.dashes[0] == -1) ? "" : this.state.dashes[0]} onChange={(e) => {
												if(e.target.value == ""){
													this.setState({dashes: [-1, this.state.dashes[1]]});
												}																																																						
												else{
													if(!isNaN(e.target.value)){ 
														this.setState({dashes: [parseInt(e.target.value), this.state.dashes[1]]});
													}
												}
											}}/>
										<input className="spacing" placeholder="0" value={(this.state.dashes[1] == -1) ? "" : this.state.dashes[1]} onChange={(e) => {
												if(e.target.value == ""){
													this.setState({dashes: [this.state.dashes[0], -1]});
												}
												else{
													if(!isNaN(e.target.value)){ 
														this.setState({dashes: [this.state.dashes[0], parseInt(e.target.value)]});
													}
												}
										}}/>
									</div>
									<div className="subwrapper">	
										<label>Color</label>
										<ColorPicker update={(color) => this.setState({color: color})} color={this.state.color}/>
									</div>
								</div>	
							</div>
							<div className="subrow">
								<div className="wrapper">
									<div className="subwrapper">
										<label>Divide into: </label>
										<input type="text" id="divide" placeholder="20" maxLength="3" /><button id="divideb">Divide</button>
									</div>
									<div className="subwrapper">
										<label>Opacity</label>
										<input type="text" id="opacity"/>
									</div>
								</div>
							</div>
						</div>
						<div className="row">
							<div className="subrow" >
								<div className="wrapper">
									<div className="subwrapper">
										<label>Starting time: </label>
										<input type="text" id="anchor" value={this.state.anchor} onChange={(e) => this.setState({anchor: parseInt(e.target.value)})}/> seconds
									</div>
									<div className="subwrapper">	
										<label>Duration: </label>
										<input type="text" id="duration" value={this.state.duration} onChange={(e) => this.setState({duration: parseInt(e.target.value)})}/> seconds
									</div>
								</div>
							</div>
							<div className="subrow">
								<div className="wrapper">
									<div className="subwrapper">
										<button className={(this.state.animType == 0) ? "anim selected" : "anim"} id="noanim" onClick={() => this.setState({animType: 0})}>No animation</button>
										<button className={(this.state.animType == 1) ? "anim selected" : "anim"} id="morph" onClick={() => this.setState({animType: 1})}>Morph</button>
										<button className={(this.state.animType == 2) ? "anim selected" : "anim"} id="completeb">Complete</button>
										<button className={(this.state.animType == 3) ? "anim selected" : "anim"} id="chase">Chase</button>
										<button className={(this.state.animType == 4) ? "anim selected" : "anim"} id="rotate">Rotate</button>
										<button className={(this.state.animType == 5) ? "anim selected" : "anim"} id="recompose">Recompose</button>
										<button className={(this.state.animType == 6) ? "anim selected" : "anim"} id="mover">Scroll right</button>
										<button className={(this.state.animType == 7) ? "anim selected" : "anim"} id="movel">Scroll left</button>
										<button className={(this.state.animType == 8) ? "anim selected" : "anim"} id="moveu">Scroll up</button>
										<button className={(this.state.animType == 9) ? "anim selected" : "anim"} id="moved">Scroll down</button>
									</div>
								</div>
							</div>
						</div>
						<div className="row">
							<div className="subrow">
								<div className="wrapper">
									<div className="subwrapper delimLabel">
										<label>Delimiters</label>
									</div>
									<div className="subwrapper">
										<button onClick={this.addDelimiter}>Add delimiter</button>
										<button onClick={this.clearDelimiters}>Clear all</button>
									</div>
								</div><br/>
								<div className="wrapper">
									<div className="subwrapper delimTable">
										<div className="labels">
											<div className="delimColumn xPosition">
												<label>x</label>
											</div>
											<div className="delimColumn thickness">
												<label>width</label>
											</div>
											<div className="delimColumn dashes">
												<label>dash:space</label>
											</div>
											<div className="delimColumn color">
												<label>color</label>
											</div>
											<div className="delimColumn filler" />
										</div>
										<div>
											{
												this.state.delimiters.map((el, index) => {
													return <Delimiter x={el.x} width={el.width} dashes={[el.dashes[0], el.dashes[1]]} color={el.color} key={el.x.toString() + index.toString()} ind={index} delete={this.deleteDelim} update={this.updateDelim}/>
												})
											}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>);
	}
}

class Canvas extends React.Component {
	constructor(props) {
		super(props);

		this.state = { 
			colors: { 
				axeColor: "#e6e4e7",
				wireColor: "#28262d",
				dashColor: "#e6e4e7", 
				curveColor: "#ebe9ec"
			},
			widths: {
				axeWdith: [1, 1],
				wireWidth: [1, 1],
				dashWidth: {
					x: [2, 2],
					y: [2, 2]
				}
			},
			drawnSteps: {
				nbSteps: {
					x: [9, 9],
					y: [8, 8]
				},
				offStepSteps: {
					x: [1, 1],
					y: [1, 1]
				},	
				stepSize: {
					x: [35, 35],//for positive then negative x
					y: [35, 35]//for positive then negative y
				}   	
			},
			font: {
				x: ["11px Arial", "11px Arial"],
				y: ["11px Arial", "11px Arial"]
			},
			steps: {
				x: [.25, .25],
				y: [.25, .25]
			},
			//Variable for updating time display
			count: 0
		};
	}
	play = () => {
		//Don't delete, pointer is to be used inside setInterval
		let pointer = this;
		let A = this.state;
		const canvas = this.refs.canvas;
		const context = canvas.getContext("2d");
		this.setState((state, props) => {
			let newState = state;
			//Temporary xstep, ystep
			let tstep = Functions.Maximum([Functions.xstep([...curves[0], ...curves[1]], A.drawnSteps.nbSteps.x, A.drawnSteps.offStepSteps.x), Functions.ystep([...curves[0], ...curves[1]], A.drawnSteps.nbSteps.y, A.drawnSteps.offStepSteps.y)]);
			newState.steps.x = [tstep, tstep]; 
			newState.steps.y = [tstep, tstep];
			return newState;
		}, () => {
			//frameDuration in milliseconds
			frameDuration = Functions.Minimum(animations.map(el => 1000/(el.fps)));
			//totalDuration in seconds
			totalDuration = Functions.Maximum(animations.map(el => el.anchor + el.duration));
			let drawFramePointer = this.drawFrame;
			//If animation already running
			if(!!mainLoop){
				window.clearInterval(mainLoop);
				//If not paused start from the beginning
				if(!paused) {
					k = 0;
				}
			}
			//Either way set paused to false since it's playing now
			paused = false;
			mainLoop = window.setInterval(function(){
				//console.log("k: " + k);
				if(k < (totalDuration*1000)/frameDuration){
					k++;
					drawFramePointer();
					animations.forEach((el, ind) => {
						let animation = el;
						animation.fps = 1000/frameDuration;
						if(((k >= animation.anchor*animation.fps) && (k <= ((animation.anchor*animation.fps) + (animation.duration*animation.fps))))){
							//Feeding the execute function (k - animation.anchor*animation.fps) instead of k, as if the animation just started with its anchor 
							animation.execute([A.steps.x, A.steps.y], [A.drawnSteps.stepSize.x, A.drawnSteps.stepSize.y], [canvas.width, canvas.height], k - animation.anchor*animation.fps, context);					
						}
					});
					pointer.setState({count: k});
				}	
				else{
					window.clearInterval(mainLoop);
					mainLoop = 0;
					k = 0;
				}
			}, frameDuration);
			/*for(let i = 0; i < animations.length; i++){
				animations[i].execute([A.steps.x, A.steps.y], [A.drawnSteps.stepSize.x, A.drawnSteps.stepSize.y], [canvas.width, canvas.height], context, this.drawFrame);
			}*/
		});
	}
	pause = () => {
		window.clearInterval(mainLoop);
		paused = true;
		this.setState({count: k});
	}
	stop = () => {
		window.clearInterval(mainLoop);
		mainLoop = 0;
		k = 0;
		this.setState({count: k}, this.drawFrame);
	}
	drawFrame = () => {
		let A = this.state;
		const canvas = this.refs.canvas;
		const context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);
		Functions.drawYAxis(canvas.width/2, A.colors.axeColor, canvas.height, A.widths.axeWidth, context);
		Functions.drawXAxis(canvas.height/2, A.colors.axeColor, canvas.width, A.widths.axeWidth, context);
		Functions.drawOnX(canvas.width/2, canvas.height/2, A.steps.x[0], A.drawnSteps.nbSteps.x[0], A.drawnSteps.stepSize.x[0], A.colors.dashColor, A.colors.wireColor, A.widths.dashWidth.x[0], A.widths.wireWidth[0], A.font.x[0], context);
		Functions.drawOnY(canvas.width/2, canvas.height/2, A.steps.y[0], A.drawnSteps.nbSteps.y[0], A.drawnSteps.stepSize.y[0], A.colors.dashColor, A.colors.wireColor, A.widths.dashWidth.y[0], A.widths.wireWidth[0], A.font.y[0], context);
		Functions.drawOnMinusX(canvas.width/2, canvas.height/2, A.steps.x[1], A.drawnSteps.nbSteps.x[0], A.drawnSteps.stepSize.x[1], A.colors.dashColor, A.colors.wireColor, A.widths.dashWidth.x[1], A.widths.wireWidth[0], A.font.x[1], context);
		Functions.drawOnMinusY(canvas.width/2, canvas.height/2, A.steps.y[1], A.drawnSteps.nbSteps.y[1], A.drawnSteps.stepSize.y[1], A.colors.dashColor, A.colors.wireColor, A.widths.dashWidth.y[1], A.widths.wireWidth[0], A.font.y[1], context);
	}
	componentDidMount(){
		this.setState({canvas: this.refs.canvasW}, () => {
			this.setState(() => {
				let tempSteps = this.state.drawnSteps;
				let nbXSteps = parseInt((this.state.canvas.clientWidth/2)/tempSteps.stepSize.x[0]);
				let nbYSteps = parseInt((this.state.canvas.clientHeight/2)/tempSteps.stepSize.y[0]);
				tempSteps.nbSteps.x = [nbXSteps, nbXSteps];
				tempSteps.nbSteps.y = [nbYSteps, nbYSteps];
				return tempSteps;
			});
		});
	}
	componentDidUpdatedate(){
	}
	render(){
		if(!this.state.canvas){
			return (<div id="canvasWrapper" style={{width: (!this.props.settStatus) ? "80%" : "50%"}}>
					<LControls play={this.play} pause={this.pause} stop={this.stop} count={(this.state.count*frameDuration)/1000}/>
					<div id="canvas" ref="canvasW"></div>
				</div>);
		}
		else{
			return (<div id="canvasWrapper" style={{width: (!this.props.settStatus) ? "80%" : "50%"}}>
					<LControls play={this.play} pause={this.pause} stop={this.stop} count={(this.state.count*frameDuration)/1000}/>
					<div id="canvas" ref="canvasW">
						<canvas ref="canvas" id="graph" width={this.state.canvas.clientWidth} height={this.state.canvas.clientHeight}></canvas>
						<canvas id="toplayer" width={this.state.canvas.clientWidth} height={this.state.canvas.clientHeight}></canvas>
					</div>
				</div>);
		}
	}
}

class LControls extends React.Component {
	constructor(props) {
	  super(props);
	
	  this.state = {};
	}
	render(){
		return (<nav id="leftControls">
					<span>
						<h4>Animation 1 </h4>
					</span>
					<nav>	
						<button onClick={this.props.play}><FontAwesomeIcon icon={faPlay} /></button>
						<button onClick={this.props.pause}><FontAwesomeIcon icon={faPause} /></button>
						<button onClick={this.props.stop}><FontAwesomeIcon icon={faStop} /></button>
					</nav>				
					<span>
						<h4 className="count">{this.props.count}</h4>
						<h4 className="seconds"> s </h4>
					</span>
					<nav>
						<button><FontAwesomeIcon icon={faSearchPlus} /></button>
						<button><FontAwesomeIcon icon={faSearchMinus} /></button>
						<button><FontAwesomeIcon icon={faArrowLeft} /></button>
						<button><FontAwesomeIcon icon={faArrowRight} /></button>
						<button><FontAwesomeIcon icon={faArrowUp} /></button>
						<button><FontAwesomeIcon icon={faArrowDown} /></button>
					</nav>
					<nav>
						<button><b>Save</b></button>
						<button><b>Export</b></button>
					</nav>
				</nav>);
	}
}	

class RControls extends React.Component {
	constructor(props) {
	  super(props);
	
	  this.state = {};
	}
	render(){
		return(<nav id="rightControls">
					<span className="title">
						<h4>Curves</h4>
					</span>
					<span className="buttons">
						<button> Clear All </button>
					</span>
				</nav>);
	}
}

class ParamWrapper extends React.Component {
	constructor(props) {
	  super(props);
	
	  this.state = {curves: curves};
	}
	newCurve = () => {
		curves[0].push(new Curve2d([], [], "#FFFFFF", 3, [1, 0]));
		animations.push(new Animation(0, 0, 1, 10, [[0, curves[0].length - 1]]));
		this.setState({curves: curves});
	};
	newPCurve = () => {
		curves[1].push(new Curve2d([], [], "#FFFFFF", 3, [1, 0]));
		animations.push(new Animation(0, 0, 1, 10, [[1, curves[1].length - 1]]));
		this.setState({curves: curves});
	};
	delete = (arg) => {
		curves[arg[0]].splice(arg[1], 1);
		//Deleting curve from relevant animation
		let indice = findInd(arg);		
		animations[indice[0]].curvInd.splice(indice[1], 1);
		//Adjusting curve indices after deletion
		animations.forEach((el, ind) => {
			if(ind == indice[0]){
				if(!!(el.curvInd[indice[1]])){
					el.curvInd.forEach((element, index) => element[1] -= (index >= indice[1] && element[0] == arg[0]) ? 1 : 0);
				}
			}
			if(ind > indice[0]){	
				el.curvInd.forEach((element, index) => element[1] -= (element[0] == arg[0]) ? 1 : 0);
			}
		});
		//Deleting empty animations that may be due to deletion
		animations = animations.filter(el => el.curvInd.length > 0);
		//Ajdusting animations left with only one curve by setting their type to 0
		animations.forEach(el => {if(el.curvInd.length == 1) el.type = 0}); 
		this.setState({curves: curves});
	};
	render(){
		return (<div id="paramWrapper">
					<RControls />
					<div id="parameters">
						<div className="buttons">
							<button id="addc" onClick={this.newCurve}> <FontAwesomeIcon icon={faPlus} /> FCurve </button>
							<button id="addp" onClick={this.newPCurve}> <FontAwesomeIcon icon={faPlus} /> PCurve </button>
						</div>
						<div className="inputs">
							{animations.map((el, ind) => {
								if(el.curvInd.length == 1){
									return <WrCurve key={[el.curvInd[0][0], el.curvInd[0][1]].toString()} type={el.curvInd[0][0]} cindex={el.curvInd[0][1]} delete={this.delete} showSett={this.props.showSett} currentSett={this.props.currentSett} settStatus={this.props.settStatus}/>; 																		
								}
								else{
									return <span className="inputWrapper" key={ind}>
											{el.curvInd.map((element, index) => {
												return <WrCurve key={[element[0], element[1]].toString()} type={element[0]} cindex={element[1]} delete={this.delete} showSett={this.props.showSett} currentSett={this.props.currentSett} settStatus={this.props.settStatus}/>
											})}
											</span>;
								}
							})}
						</div><br/>
					</div>
					<div id="logo">
						<img src="drawing.svg" width="35%"/>
					</div>
				</div>);	
	}
}

class App extends React.Component {
	constructor(props){
		super(props);	
		curves[0].push(new Curve2d([], [], "#FFFFFF", 3, [1, 0]));
		animations.push(new Animation(0, 0, 1, 10, [[0, 0]]));
		this.state = {curves: curves, settStatus: false, currentSett: []};
	};
	showSett = (curveInd) => {
		this.setState({settStatus: true, currentSett: curveInd});
	}
	hideSett = () => {
		this.setState({settStatus: false, currentSett: [[]]});	
	}
	render(){
		let sett = (this.state.settStatus) ? <Settings currentSett={this.state.currentSett} hide={this.hideSett}/> : null;
		return (<div id="main">
					<div id="core">
						<Canvas/>
						{sett}
						<ParamWrapper showSett={this.showSett} currentSett={this.state.currentSett} settStatus={this.state.settStatus}/>
					</div>
				</div>);
	}
}

export default App;
