var HostInterface = React.createClass({
	getInitialState: function() {
		return {
			isHover: false,
			isValid: true
		};
	},

	getDefaultProps: function() {
		return {
			hostInterface: {
				width: 22,
				height: 1,
				apex: 8
    		}
    	};
	},

	componentWillReceiveProps: function() {
		if (this.props.dragging.componentID || this.props.dragging.hostComponentID){
			var sourceProtocol = this.props.dragging.protocol;
			var sourceMode = this.props.dragging.mode;
			var thisProtocol = this.props.tokenObject.protocol;
			var thisMode = this.props.tokenObject.mode;

			var isThisValidType = checkTypeValidity(sourceProtocol, sourceMode, thisProtocol, thisMode);
			var isValid = isThisValidType;
		
			if (this.props.tokenObject.wire){//existing wire
				isValid = false
			}

			if (_.isEqual(this.props.tokenObject, this.props.dragging)){
				isValid = true
			}

			if (_.isEqual(this.props.tokenObject, this.props.mouseDown)){
				isValid = true
			}
						
			this.setState({
				isValid: isValid
    		});
		}
		else {
			this.setState({
				isValid: true
    		});
		}
	},

	onMouseEnter: function() {	
		if (this.state.isValid){			
	    	this.props.onMouseEnter(this.props.tokenObject);
	    	this.setState({
				isHover: true
	    	});
    	}
	},

	onMouseLeave: function() {	
		if (this.state.isValid){
			this.props.onMouseLeave(this.props.tokenObject);
			this.setState({
				isHover: false
    		});
    	}
	},

	onMouseDown: function() {	
		this.props.onMouseDown(this.props.tokenObject)
	},

	onMouseUp: function() {	
		this.props.onMouseUp(this.props.tokenObject);
		this.setState({
			isHover: false
    	});
	},

	render: function() {
		var leftCenterPoint = this.props.tokenObject.ifcLeft;
		var topCenterPoint = this.props.tokenObject.ifcTop;

		var growthW = 0;
		var growthH = 0;
		if (this.state.isHover  || _.isEqual(this.props.tokenObject, this.props.dragging)){
			growthW = 4;
			growthH = 8;
		}

		var thisOpacity = 1;
		if (this.props.isInvalid && !this.props.isStartOfNewWire){
			thisOpacity = 0.2
		}

		var fillColor = getHSL(this.props.protocols[this.props.tokenObject.protocol].hue);
		var borderColor = getHSL(this.props.protocols[this.props.tokenObject.protocol].hue, "darker");

		// policy indicator
		//console.log(this.props.tokenObject);
		

		// validity for drop
		if (this.state.isValid == false){
			thisOpacity = 0.2
		}
	
		var interfaceStyle = {
			fill: fillColor,
			stroke: borderColor,
			opacity: thisOpacity
		};

		var rotation = 0;
		if (this.props.tokenObject.face == "right"){
			rotation = -90;
		}
		if (this.props.tokenObject.face == "left"){			
			rotation = 90;
		}
		if (this.props.tokenObject.face == "top"){
			rotation = 180;
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


		var indicatorX = polygon.left + (polygon.width / 2);
		var indicatorY = polygon.top - 15;

		var indicators = [];
		var indicatorOpacity = 1;
		if (this.props.wireType){
			indicatorOpacity = 0.3
		}

		var moduleArray = [];
		_.forEach(this.props.tokenObject.policies, function(policyID, i){
			var moduleID = this.props.policiesData[policyID].moduleID;
			var hue = this.props.policiesData[policyID].view.hue;
			moduleArray.push(moduleID)
		}.bind(this))

		moduleArray = _.uniq(moduleArray);

		_.forEach(moduleArray, function(moduleID, i){
			var hue = this.props.dependencies[moduleID].view.hue;
			var cy = indicatorY - (8 * i);
			var indicatorStyle = {
				fill: getHSL(hue, "lighter"),
				stroke: getHSL(hue),
				opacity: indicatorOpacity
			}
			indicators.push(<circle key={i} cx={indicatorX} cy={cy} style={indicatorStyle} r="3" />)
		}.bind(this))





		

		return (
			<g transform = {transformString}>
				<polygon 
					className = "hostInterface" 
					style = {interfaceStyle} 
					points = {points} 
					//transform = {transformString} 
					onMouseEnter={this.onMouseEnter} 
					onMouseLeave={this.onMouseLeave} 
					onMouseUp={this.onMouseUp} 
					onMouseDown={this.onMouseDown}/>
				{indicators}
			</g>
			
  		)
	},
});