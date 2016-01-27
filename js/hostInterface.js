var HostInterface = React.createClass({
	getInitialState: function() {
		return {
			isHover: false,
		};
	},

	getDefaultProps: function() {
		return {
			hostInterface: {
				width: 26,
				height: 1,
				apex: 7
    		}
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
		var leftCenterPoint = this.props.tokenObject.ifcLeft;
		var topCenterPoint = this.props.tokenObject.ifcTop;

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

		var fillColor = getHSL(this.props.protocols[this.props.tokenObject.protocol].hue);
		var borderColor = getHSL(this.props.protocols[this.props.tokenObject.protocol].hue, true);

		var interfaceStyle = {
			fill: fillColor,
			stroke: borderColor,
			opacity: thisOpacity
		};

		var rotation = 0;
		//var left = leftCenterPoint + (this.props.hostCompDims.width / 2);
		//var top = topCenterPoint + this.props.hostCompDims.height;
		if (this.props.tokenObject.face == "right"){
			rotation = -90;
			//left = leftCenterPoint + this.props.hostCompDims.width;
			//top = topCenterPoint + (this.props.hostCompDims.height / 2);
		}
		if (this.props.tokenObject.face == "left"){			
			rotation = 90;
			//left = leftCenterPoint;
			//top = topCenterPoint + (this.props.hostCompDims.height / 2);
		}
		if (this.props.tokenObject.face == "top"){
			rotation = 180;
			//top = topCenterPoint;
		}

		var transformString = "rotate(" + rotation + " " + leftCenterPoint + " " + topCenterPoint + ")";



		var polygon = {	
			width: this.props.hostInterface.width + growthW,
			height: this.props.hostInterface.height + growthH,
			left: this.props.tokenObject.ifcLeft - this.props.hostInterface.width/2 - growthW/2,
			top: this.props.tokenObject.ifcTop - this.props.hostInterface.height/2 - growthH/2 + 1
		};


		var inputPointer = "";
		var outputPointer = "";
		if (this.props.tokenObject.mode == "in" || this.props.tokenObject.mode == "bi"){
			inputPointer = " " + (polygon.left + (polygon.width / 2)) + ", " + (polygon.top - this.props.hostInterface.apex);
		}
		if (this.props.tokenObject.mode == "out" || this.props.tokenObject.mode == "bi"){
			outputPointer = " " + (polygon.left + (polygon.width / 2)) + ", " + (polygon.top  + polygon.height + this.props.hostInterface.apex)
		}

		var points = "" + polygon.left + ", " + polygon.top; //top-left
		points += inputPointer;
		points += " " + (polygon.left + polygon.width) + ", " + polygon.top; //top-right
		points += " " + (polygon.left + polygon.width) + ", " + (polygon.top + polygon.height); //bottom-right
		points += outputPointer;
		points += " " + polygon.left + ", " + (polygon.top + polygon.height); //bottom-left




		



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