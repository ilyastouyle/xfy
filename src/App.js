import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCut, faAngleDown, faSave, faAngleLeft, faAngleRight, faPencilAlt, faSearchPlus, faSearchMinus, faArrowLeft, faArrowRight, faArrowUp, faArrowDown, faPlus, faPlay, faPause, faStop } from '@fortawesome/free-solid-svg-icons';
import Functions from './Library';
import Animations from './Animations';
import './stylesheets/App.css';

let curves = [[], []], animations = [];

class Curve2d{
	constructor(X, Y, color, width) {
		this.X = X;
		this.Y = Y;
		this.color = color;
		this.width = width;
	}
}
class Animation{
	/* 
		type: type of animation (Integer) 
		duration: duration of animation in seconds (Float)
		fps: frames per second (Integer)
		curvInd: the curves involved in the animation ([[0 or 1, index],[...],...])
	*/
	constructor(type, duration, fps, curvInd){
		this.type = type;
		this.curvInd = curvInd;
		this.animCurves = [];
		this.duration = duration;
		this.fps = fps;
	}
	execute(steps, thestep, canvasDim, context, executeBefore = () => {} ){
		for(var i = 0; i < this.curvInd.length; i++){
			this.animCurves.push(curves[this.curvInd[i][0]][this.curvInd[i][1]]);
		}
		switch(this.type){
			//no animation
			case 0:
				executeBefore();
				Functions.drawCurve(this.animCurves[0].width, this.animCurves[0].X, this.animCurves[0].Y, steps, thestep, canvasDim[0]/2, canvasDim[1]/2, "#000000", context);
				break;
			//morph curve1 into curve2 
			case 1:
				Animations.morph(this.animCurves, this.duration, this.fps, (tab1, tab2) => {
					executeBefore();
					Functions.drawCurve(this.animCurves[0].width, tab1, tab2, steps, thestep, canvasDim[0]/2, canvasDim[1]/2, "#000000", context);
				});
				break;
		}
	}
};

//Wrapper Curve: Template for Functional and Parameterized Curves
class WrCurve extends React.Component{
	constructor(props) {
		super(props);

		this.state = { cEdit: 0, tempF: [ null, null, null, null ] };
		//animations.push(new Animation(0, 1, 1, [[this.props.type, this.props.cindex]]));
	}
	componentDidMount(){
		window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, "parameters"]);
	}
	componentDidUpdate(){
		this.input.focus();
		this.input.value = this.state.tempF[this.state.cEdit - 1];
	}
	previous = () => {
		this.setState({ cEdit: (this.state.cEdit - 1) % 5, tempF: this.state.tempF.map((v, i) => (i === this.state.cEdit - 1) ? this.input.value : v)});
		this.input.value = "";
	};
	next = () => {
		this.setState({ cEdit: (this.state.cEdit + 1) % 5, tempF: this.state.tempF.map((v, i) => (i === this.state.cEdit - 1) ? this.input.value : v)}, () => {
			if(this.props.type === 0){
				//curves[this.props.type][this.props.cindex].X = Functions.subdivide([this.state.tempF]);
				if(!!this.state.tempF[1] && !!this.state.tempF[2]){
					curves[this.props.type][this.props.cindex].X = Functions.subdivide(parseFloat(this.state.tempF[1]), parseFloat(this.state.tempF[2]), 100);
					for(let i = 0; i < curves[this.props.type][this.props.cindex].X.length; i++){
						let x = (curves[this.props.type][this.props.cindex].X)[i];
						curves[this.props.type][this.props.cindex].Y[i] = eval(Functions.evaluateInput(this.state.tempF[0]));
					}
				}
			}
		});
		this.input.value = "";
	};
	edit = () => {
		this.setState({ cEdit: 1 });
	};	
	save = () => {
		this.setState({ cEdit: 0, tempF: this.state.tempF.map((v, i) => (i === this.state.cEdit - 1) ? this.input.value : v)}, () => {
			animations.push(new Animation(0, 1, 1, [[this.props.type, this.props.cindex]]));
		});
	};
	inputHandler = (e) => {
		if(e.which === 13) this.next();
	};
	render(){
		let inputClasses = [], placeholders = [], labels = [];
		if(this.props.type === 0){
			inputClasses = ["f", "selected f", "selected value", "selected value", "selected value"]; 
			placeholders = ["cos(sin(x))", "cos(sin(x))", "-1", "1", "100"];
			labels = ["f_{ " + (this.props.cindex + 1) + " }(x)", "a", "b", "n"];
		}else{
			inputClasses = ["x", "selected x", "selected y", "selected value", "selected value"]
			placeholders = ["cos(t)", "cos(t)", "sin(t)", "-4", "4"];
			labels = ["x_{ " + (this.props.cindex + 1) + " }(t)", "y_{ " + (this.props.cindex + 1) + " }(t)", "a", "b"];
		} 
		return (<span className="input">
						<span>
							<button className="delete" onClick={() => {this.props.delete([this.props.type, this.props.cindex])}} style={{display: (this.state.cEdit) ? "none" : "inline"}}><FontAwesomeIcon icon={faCut}/></button>
							<button className="dropdown" style={{display: (this.state.cEdit) ? "none" : "inline"}}><FontAwesomeIcon icon={faAngleDown} size="lg"/></button>
							<button className="save" onClick={this.save} style={{display: (this.state.cEdit) ? "inline" : "none"}}><FontAwesomeIcon icon={faSave}/></button>
							<button className="previous" onClick={this.previous} style={{display: (this.state.cEdit > 1) ? "inline" : "none"}}><FontAwesomeIcon icon={faAngleLeft} size="lg"/></button>
							<label style={{display: (this.state.cEdit < 2) ? "inline" : "none"}}>&#92;({labels[0]}&#92;)</label>
							<label style={{display: (this.state.cEdit === 2) ? "inline" : "none"}}>&#92;({labels[1]}&#92;)</label>
							<label style={{display: (this.state.cEdit === 3) ? "inline" : "none"}}>&#92;({labels[2]}&#92;)</label>
							<label style={{display: (this.state.cEdit === 4) ? "inline" : "none"}}>&#92;({labels[3]}&#92;)</label>
							<input className={inputClasses[this.state.cEdit]} type="text" ref={(input) => { this.input = input; }} onKeyUp={this.inputHandler} placeholder={placeholders[this.state.cEdit]} onChange={()=>{}}/>
							<button className="next" onClick={this.next} style={{display: (this.state.cEdit) ? "inline" : "none"}}><FontAwesomeIcon icon={faAngleRight} size="lg"/></button>
							<button className="edit" onClick={this.edit} style={{display: (this.state.cEdit) ? "none" : "inline"}}><FontAwesomeIcon icon={faPencilAlt}/></button>
							<input className="jscolor" value="#3A539B" onChange={()=>{}}/>
						</span>
				</span>);
	}
}
class Settings extends React.Component {
	constructor(props){
		super(props);
		
		this.state = {};
	};
	render(){
		return (<div id="settWrapper">
					<nav id="centerControls">
						<h4>Settings</h4>
						<button onClick={this.newCurve}> Reset </button>
						<button onClick={this.newPCurve}> Save </button>
					</nav>
					<div id="fsettings">
						<div className="row">
							<div className="column">
								<label>Curve thickness: </label>
								<span className="scontainer"><span className="thickness" id="thn"></span></span>
								<span className="scontainer selected"><span className="thickness" id="md"></span></span>
								<span className="scontainer"><span className="thickness" id="thk"></span></span>
							</div>
							<div className="column">
								<label>Divide into: </label>
								<input type="text" id="divide" placeholder="20" maxLength="3" /><button id="divideb">Divide</button>
							</div>
						</div>
						<div className="row">
							<div className="column">
								<label>Dash size &amp; spacing: </label>
								<input id="dash" placeholder="3" /> &amp;
								<input id="spacing" placeholder="2" />
							</div>
							<div className="column">
								<label>Duration: </label>
								<input type="text" id="duration" /> seconds
							</div>
						</div>
						<div className="row">
							<div className="column">
								<label>Animation style: </label>
								<div className="container">
									<button className="anim" id="noanim">No animation</button>
									<button className="anim" id="completeb">Complete</button>
									<button className="anim" id="chase">Chase</button>
									<button className="anim" id="morph">Morph</button>
									<button className="anim" id="rotate">Rotate</button>
									<button className="anim" id="recompose">Recompose</button>
									<button className="anim" id="mover">Scroll right</button>
									<button className="anim" id="movel">Scroll left</button>
									<button className="anim" id="moveu">Scroll up</button>
									<button className="anim" id="moved">Scroll down</button>
								</div>
							</div>
						</div>
						<div className="row">
							<div className="column">
								<button>Opaque</button>	
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
				axeColor: "#000000",
				wireColor: "#cdd1d3",
				dashColor: "#1F3A93"
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
					x: [12, 12],
					y: [6, 6]
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
			}};
	}
	play = () => {
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
			this.drawFrame();
			for(let i = 0; i < animations.length; i++){
				animations[i].execute([A.steps.x, A.steps.y], [A.drawnSteps.stepSize.x, A.drawnSteps.stepSize.y], [canvas.width, canvas.height], context, this.drawFrame);
			}
		});
	}
	drawFrame = () => {
		let A = this.state;
		const canvas = this.refs.canvas;
		const context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);
		Functions.drawYAxis(canvas.width/2, A.colors.axeColor, canvas.height, A.widths.axeWidth, context);
		Functions.drawXAxis(canvas.height/2, A.colors.axeColor, canvas.width, A.widths.axeWidth, context);
		Functions.drawOnX(canvas.width/2, canvas.height/2, A.steps.x[0], A.drawnSteps.nbSteps.x[0], A.drawnSteps.stepSize.x[0], A.colors.wireColor, A.widths.dashWidth.x[0], A.widths.wireWidth[0], A.font.x[0], context);
		Functions.drawOnY(canvas.width/2, canvas.height/2, A.steps.y[0], A.drawnSteps.nbSteps.y[0], A.drawnSteps.stepSize.y[0], A.colors.wireColor, A.widths.dashWidth.y[0], A.widths.wireWidth[0], A.font.y[0], context);
		Functions.drawOnMinusX(canvas.width/2, canvas.height/2, A.steps.x[1], A.drawnSteps.nbSteps.x[0], A.drawnSteps.stepSize.x[1], A.colors.wireColor, A.widths.dashWidth.x[1], A.widths.wireWidth[0], A.font.x[1], context);
		Functions.drawOnMinusY(canvas.width/2, canvas.height/2, A.steps.y[1], A.drawnSteps.nbSteps.y[1], A.drawnSteps.stepSize.y[1], A.colors.wireColor, A.widths.dashWidth.y[1], A.widths.wireWidth[0], A.font.y[1], context);
	}
	componentDidMount(){
		this.setState({canvas: this.refs.canvasW});
	}
	componentDidUpdate(){
		
		//this.drawFrame();
		//Functions.drawCurve(2, [-3, -2, -1, 0, 1, 2, 3], [9, 4, 1, 0, 1, 4, 9], [1, 1], [1, 1], [A.drawnSteps.stepSize.x, A.drawnSteps.stepSize.y], canvas.width/2, canvas.height/2, "#000000", context);
	}

	render(){
		if(!this.state.canvas){
			return (<div id="canvasWrapper">
					<LControls play={this.play}/>
					<div id="canvas" ref="canvasW"></div>
				</div>);
		}
		else{
			return (<div id="canvasWrapper">
					<LControls play={this.play}/>
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
						<button><FontAwesomeIcon icon={faPause} /></button>
						<button><FontAwesomeIcon icon={faStop} /></button>
					</nav>				
					<span>
						<h4>4 seconds </h4>
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
					<b>Curves</b>
				</nav>);
	}
}

class ParamWrapper extends React.Component {
	constructor(props) {
	  super(props);
	
	  this.state = {curves: curves};
	}
	newCurve = () => {
		//var curve = <Curve cindex={curves.length} delete={this.delete} />;
		curves[0].push(new Curve2d([], [], "#FFFFFF", 2));
		animations.push(new Animation(1, 0.5, 10, [[0, curves[0].length - 1]]));
		this.setState({curves: curves});
	};
	newPCurve = () => {
		curves[1].push(new Curve2d([], [], "#FFFFFF", 2));
		animations.push(new Animation(1, 0.5, 10, [[1, curves[1].length - 1]]));
		this.setState({curves: curves});
	};
	delete = (arg) => {
		curves[arg[0]].splice(arg[1], 1);
		//console.log(arg[1]);
		let indice = [];
		animations.forEach((el, ind) => {
			el.curvInd = el.curvInd.filter((element, index) => {
				if(element[0] == arg[0] && element[1] == arg[1]){
					indice[0] = ind;
					indice[1] = index;
				};
				return !(element[0] == arg[0] && element[1] == arg[1]);
			});
		});
		animations.forEach((el, ind) => {
			//console.log("Animation: " + el);
			if(ind == indice[0]){
				if(!!(el.curvInd[indice[1]])){
					//el.curvInd.forEach((element) => console.log(element[0]));
					el.curvInd.forEach((element, index) => {
						if(index >= indice[1] && element[0] == arg[0]){
							element[1]--;
						}
					});
				}
			}
			if(ind > indice[0]){
				el.curvInd.forEach((element, index) => {
					if(element[0] == arg[0]){
						element[1]--;
					}
				});
			}
		});
		animations = animations.filter(el => el.curvInd.length > 0);
		this.setState({curves: curves});
	};
	render(){
		//{curves[0].map((el, ind) => <WrCurve key={ind} type={0} cindex={ind} delete={this.delete} />)}
		//{curves[1].map((el, ind) => <WrCurve key={ind} type={1} cindex={ind} delete={this.delete} />)}
		return (<div id="paramWrapper">
					<RControls />
					<div id="parameters">
						<button id="addc" onClick={this.newCurve}> <FontAwesomeIcon icon={faPlus} /> FCurve </button>
						<button id="addp" onClick={this.newPCurve}> <FontAwesomeIcon icon={faPlus} /> PCurve </button>
						<div>
							{animations.map((el, ind) => {
									if(el.curvInd.length == 1){
										return <WrCurve key={[el.curvInd[0][0], el.curvInd[0][1]].toString()} type={el.curvInd[0][0]} cindex={el.curvInd[0][1]} delete={this.delete} />; 																		
									}
									else{
										return <span className="inputWrapper" key={ind}>
												{el.curvInd.map((element, index) => {
													return <WrCurve key={[element[0], element[1]].toString()} type={element[0]} cindex={element[1]} delete={this.delete} />
												})}
												</span>;
									}
								}
							)}
						</div><br/>
					</div>
				</div>);
	}
}

class App extends React.Component {
	constructor(props){
		super(props);	
		curves[0].push(new Curve2d([], [], "#FFFFFF", 2));
		curves[0].push(new Curve2d([], [], "#FFFFFF", 2));
		curves[1].push(new Curve2d([], [], "#FFFFFF", 2));
		curves[1].push(new Curve2d([], [], "#FFFFFF", 2));
		animations.push(new Animation(1, 0.5, 10, [[0, 0], [0, 1], [1, 0], [1, 1]]));
		this.state = {curves: curves};
	};
	render(){
		return (<div id="main">
					<div id="core">
						<Canvas/>
						<Settings/>
						<ParamWrapper/>
					</div>
				</div>);
	}
}

export default App;
