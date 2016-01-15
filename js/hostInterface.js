var HostInterface = React.createClass({
	getInitialState: function() {
		return {
			isHover: false,
		};
	},

	onMouseEnter: function() {	
		this.props.onMouseEnter(this.props.tokenObject, this.props.isInvalid);
		this.setState({
			isHover: true
    	});
	},

	onMouseLeave: function() {	
		this.props.onMouseLeave(this.props.tokenObject, this.props.isInvalid);
		this.setState({
			isHover: false
    	});
	},

	onMouseDown: function() {	
		this.props.onMouseDown(this.props.tokenObject)
	},

	onMouseUp: function() {	
		this.props.onMouseUp(this.props.tokenObject, this.props.isInvalid);
		this.setState({
			isHover: false
    	});
	},

	render: function() {

		var leftCenterPoint = this.props.left;
		var topCenterPoint = this.props.top;


		var growthW = 0;
		var growthH = 0;
		if ((this.state.isHover && !this.props.isInvalid) || this.props.isStartOfNewWire){
			growthW = 4;
			growthH = 8;
		}

		var thisOpacity = 1;
		if (this.props.isInvalid && !this.props.isStartOfNewWire){
			thisOpacity = 0.2
		}
		var interfaceStyle = {
			fill: this.props.color,
			stroke: this.props.border,
			opacity: thisOpacity
		};

		var polygon = {	
			width: this.props.width + growthW,
			height: this.props.height + growthH,
			left: this.props.left - this.props.width/2 - growthW/2,
			top: this.props.top - this.props.height/2 - growthH/2 + 1
		};


		var inputPointer = "";
		var outputPointer = "";
		if (this.props.mode == "in" || this.props.mode == "bi"){
			inputPointer = " " + (polygon.left + (polygon.width / 2)) + ", " + (polygon.top - this.props.apex);
		}
		if (this.props.mode == "out" || this.props.mode == "bi"){
			outputPointer = " " + (polygon.left + (polygon.width / 2)) + ", " + (polygon.top  + polygon.height + this.props.apex)
		}

		var points = "" + polygon.left + ", " + polygon.top; //top-left
		points += inputPointer;
		points += " " + (polygon.left + polygon.width) + ", " + polygon.top; //top-right
		points += " " + (polygon.left + polygon.width) + ", " + (polygon.top + polygon.height); //bottom-right
		points += outputPointer;
		points += " " + polygon.left + ", " + (polygon.top + polygon.height); //bottom-left



		//rotation

		var rotation = 0;

		if (this.props.face == "right"){
			rotation = -90
		}

		if (this.props.face == "left"){
			rotation = 90
		}

		if (this.props.face == "top"){
			rotation = 180;
		}

		var transformString = "rotate(" + rotation + " " + leftCenterPoint + " " + topCenterPoint + ")";





		return (
			<polygon 
				className = "hostInterface" 
				style = {interfaceStyle} 
				points = {points} 
				transform = {transformString} 
				onMouseEnter={this.onMouseEnter} 
				onMouseLeave={this.onMouseLeave} 
				onMouseUp={this.onMouseUp} 
				onMouseDown={this.onMouseDown}/>
  		)
	},
});