import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCut, faAngleDown, faSave, faAngleLeft, faAngleRight, faPencilAlt, faSearchPlus, faSearchMinus, faArrowLeft, faArrowRight, faArrowUp, faArrowDown, faPlus } from '@fortawesome/free-solid-svg-icons';
import Functions from './Library';
import './stylesheets/App.css';

let curves = [[], []];

class Curve2d{
	constructor(X, Y, color, width) {
		this.X = X;
		this.Y = Y;
		this.color = color;
		this.width = width;
	}
}

//Wrapper Curve: Template for Functional and Parameterized Curves
class WrCurve extends React.Component{
	constructor(props) {
		super(props);
	
		this.state = { cEdit: 0, tempF: [ null, null, null, null ] };
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
		this.setState({ cEdit: (this.state.cEdit + 1) % 5, tempF: this.state.tempF.map((v, i) => (i === this.state.cEdit - 1) ? this.input.value : v)});
		this.input.value = "";
	};
	edit = () => {
		this.setState({ cEdit: 1 });
	};	
	save = () => {
		this.setState({ cEdit: 0, tempF: this.state.tempF.map((v, i) => (i === this.state.cEdit - 1) ? this.input.value : v)});
		this.setState({ cEdit: 0 });	
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
	
	  this.state = {};
	}
	render(){
		return (<div id="canvasWrapper">
					<LControls />
					<div id="canvas">
						<canvas id="graph" width="400" height="400"></canvas>
						<canvas id="toplayer" width="400" height="400"></canvas>
					</div>
				</div>);
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
					<h4>Curves</h4>
				</nav>);
	}
}

class App extends React.Component {
	constructor(props){
		super(props);	
		curves[0].push(new Curve2d([], [], "#FFFFFF", 2));
		this.state = {curves: curves};
	};
	newCurve = () => {
		//var curve = <Curve cindex={curves.length} delete={this.delete} />;
		curves[0].push(Date.now());
		this.setState({curves: curves});
	};
	newPCurve = () => {
		curves[1].push(Date.now());
		this.setState({curves: curves});
	};
	delete = (arg) => {
		curves[arg[0]].splice(arg[1], 1);
		this.setState({curves: curves});
	};
	render(){
		return (<div id="main">
					<div id="core">
						<Canvas/>
						<Settings/>
						<div id="paramWrapper">
							<RControls />
							<div id="parameters">
								<button id="addc" onClick={this.newCurve}> <FontAwesomeIcon icon={faPlus} /> <b>FCurve</b> </button>
								<button id="addp" onClick={this.newPCurve}> <FontAwesomeIcon icon={faPlus} /> <b>PCurve</b> </button>
								<div>
									{curves[0].map((el, ind) => <WrCurve key={ind} type={0} cindex={ind} delete={this.delete} />)}
									{curves[1].map((el, ind) => <WrCurve key={ind} type={1} cindex={ind} delete={this.delete} />)}
								</div><br/>
							</div>
						</div>
					</div>
				</div>);
	}
}

export default App;
