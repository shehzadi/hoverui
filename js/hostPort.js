var HostPort = React.createClass({
	getInitialState: function() {
		return {
			isHover: false,
		};
	},

	onMouseEnter: function() {	
		this.setState({
			isHover: true
    	});
	},

	onMouseLeave: function() {	
		this.setState({
			isHover: false
    	});
	},

	onMouseDown: function() {	
		this.props.onMouseDown(this.props.componentID, "interface-1")
	},

	onMouseUp: function() {	
		this.props.onMouseUp(this.props.componentID, "interface-1")
	},

	render: function() {
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
			left: this.props.left - growthW/2,
			top: this.props.top - growthH/2 + 1
		};

		var inputPointer = "";
		var outputPointer = "";
		if (this.props.mode == "input" || this.props.mode == "bidirectional"){
			inputPointer = " " + (polygon.left + (polygon.width / 2)) + ", " + (polygon.top - this.props.apex);
		}
		if (this.props.mode == "output" || this.props.mode == "bidirectional"){
			outputPointer = " " + (polygon.left + (polygon.width / 2)) + ", " + (polygon.top  + polygon.height + this.props.apex)
		}

		var points = "" + polygon.left + ", " + polygon.top; //top-left
		points += inputPointer;
		points += " " + (polygon.left + polygon.width) + ", " + polygon.top; //top-right
		points += " " + (polygon.left + polygon.width) + ", " + (polygon.top + polygon.height); //bottom-right
		points += outputPointer;
		points += " " + polygon.left + ", " + (polygon.top + polygon.height); //bottom-left

		return (
			<polygon 
				className = "attachmentInterface" 
				style = {interfaceStyle} 
				points = {points} 
				onMouseEnter={this.onMouseEnter} 
				onMouseLeave={this.onMouseLeave} 
				onMouseUp={this.onMouseUp} 
				onMouseDown={this.onMouseDown}/>
  		)
	},
});