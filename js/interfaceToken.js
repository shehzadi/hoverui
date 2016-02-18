var InterfaceToken = React.createClass({
	getInitialState: function() {
		return {
			isHover: false,
			isValid: true
		};
	},

	getDefaultProps: function() {
		return {
			arrow: 6
		};
	},

	onMouseEnter: function() {	
		if (this.state.isValid){
			this.setState({
				isHover: true
	    	});
	    	this.props.onMouseEnter(this.props.tokenObject);
    	}
	},

	onMouseLeave: function() {			
		if (this.state.isValid){
	    	this.props.onMouseLeave(this.props.tokenObject);
    	}
    	this.setState({
			isHover: false
    	});
	},

	onMouseDown: function() {	
		if (!this.props.tokenObject.capacity|| this.props.tokenObject.capacity - this.props.tokenObject.used > 0){
			this.props.onMouseDown(this.props.tokenObject)
		}
	},

	onMouseUp: function() {	
		if (this.state.isValid){
			this.props.onMouseUp(this.props.tokenObject);
			this.setState({
				isHover: false
	    	});
		}
	},

	componentWillReceiveProps: function() {
		if (this.props.dragging.componentID || this.props.dragging.hostComponentID){//dragging wire
			var sourceProtocol = this.props.dragging.protocol;
			var sourceMode = this.props.dragging.mode;
			var thisProtocol = this.props.tokenObject.protocol;
			var thisMode = this.props.tokenObject.mode;

			var isThisValidType = checkTypeValidity(sourceProtocol, sourceMode, thisProtocol, thisMode);
			var isValid = isThisValidType;
			//this.isSource = false;
		
			if (this.props.tokenObject.wire){//existing wire
				isValid = false
			}

			if (this.props.tokenObject.capacity - this.props.tokenObject.used <= 0){//empty wire
				isValid = false
			}

			if (this.props.tokenObject.componentID == this.props.dragging.componentID){//all source interfaces
				isValid = false
			}

			if (_.isEqual(this.props.tokenObject, this.props.dragging)){
				isValid = false;
				//this.isSource = true
			}

			if (this.props.wireType == "existing"){
				if (this.props.tokenObject.componentID == this.props.mouseDown.componentID){//all source interfaces
					isValid = false
				}
				if (_.isEqual(this.props.tokenObject, this.props.mouseDown)){
					isValid = true
				}
			}

			if (this.isSource == true){}

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

	render: function() {
		//debugger
		var leftCenterPoint = this.props.tokenObject.left;
		var topCenterPoint = this.props.tokenObject.top;
		
		var growthW = 0;
		var growthH = 0;
		if (this.state.isHover || _.isEqual(this.props.tokenObject, this.props.dragging)){
			growthW = 5;
			growthH = 9;
		}

		var thisOpacity = 1;

		var fillColor = getHSL(this.props.protocols[this.props.tokenObject.protocol].hue);
		var dashArray = "";
		if (this.props.isPendingDeletion == this.props.componentID){
			fillColor = getHSL(this.props.protocols[this.props.tokenObject.protocol].hue, "lighter");
			dashArray = "3,3";
		}

		if (this.props.tokenObject.wireTo && this.props.tokenObject.wireTo.component == this.props.isPendingDeletion){
			fillColor = getHSL(this.props.protocols[this.props.tokenObject.protocol].hue, "lighter");
			dashArray = "3,3";
		}

		// validity for drop
		if (this.state.isValid == false){
			thisOpacity = 0.2
		}

		if (_.isEqual(this.props.tokenObject, this.props.dragging)){ //is source
			thisOpacity = 1
		}

		var polygon = {	
			width: this.props.ifcDims.width + growthW,
			height: this.props.ifcDims.height + growthH,
			left: leftCenterPoint - (this.props.ifcDims.width/2) - growthW/2,
			top: topCenterPoint - (this.props.ifcDims.height/2) - growthH/2 
		};
		
		var borderColor = getHSL(this.props.protocols[this.props.tokenObject.protocol].hue, "darker");

		var style = {
			fill: fillColor,
			stroke: borderColor,
			strokeDasharray: dashArray,
			opacity: thisOpacity
		}

		var textStyle = {
			fill: borderColor,
			opacity: thisOpacity
		}

		var available = this.props.tokenObject.capacity;
		if (this.props.tokenObject.used){
			available = available - this.props.tokenObject.used
		}

		var text = "";
		if (available > 1){
			text = "" + available
		}
		var textX = polygon.left + (polygon.width / 2);
		var textY = polygon.top - 7;

		var inputPointer = "";
		var outputPointer = "";
		if (this.props.tokenObject.mode == "in" || this.props.tokenObject.mode == "bi"){
			inputPointer = " " + (polygon.left + (polygon.width / 2)) + ", " + (polygon.top - this.props.arrow);
			textY = textY - this.props.arrow;
		}
		if (this.props.tokenObject.mode == "out" || this.props.tokenObject.mode == "bi"){
			outputPointer = " " + (polygon.left + (polygon.width / 2)) + ", " + (polygon.top  + polygon.height + this.props.arrow)
		}

		var points = "" + polygon.left + ", " + polygon.top; //top-left
		points += inputPointer;
		points += " " + (polygon.left + polygon.width) + ", " + polygon.top; //top-right
		points += " " + (polygon.left + polygon.width) + ", " + (polygon.top + polygon.height); //bottom-right
		points += outputPointer;
		points += " " + polygon.left + ", " + (polygon.top + polygon.height); //bottom-left

		//rotation
		var rotation = 0;

		if (this.props.tokenObject.face == "right"){
			rotation = -90
		}

		if (this.props.tokenObject.face == "left"){
			rotation = 90
		}

		if (this.props.tokenObject.face == "top" || (this.props.tokenObject.capacity && this.props.tokenObject.mode == "in")){
			rotation = 180;
		}

		var transformString = "rotate(" + rotation + " " + leftCenterPoint + " " + topCenterPoint + ")";
		var textTransformString = "rotate(" + (-rotation) + " " + textX + " " + textY + ")";

		// policy indicator

		
		var indicatorX = textX;
		var indicatorY = textY;

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
		

		/*
		var circle;
		if (!_.isEmpty(this.props.tokenObject.policies)){
			circle = (
				<circle cx={textX} cy={textY} r="3" transform = {textTransformString}/>
			)
		}
		*/
 
		return (
			<g transform = {transformString}>
				<polygon 
					className = "interface" 
					style = {style} 
					available = {available} 
					points = {points} 
					onMouseEnter = {this.onMouseEnter} 
					onMouseLeave = {this.onMouseLeave} 
					onMouseUp = {this.onMouseUp} 
					onMouseDown = {this.onMouseDown}/>
				<text 
					x={textX} 
					y={textY}
					style = {textStyle} 
					transform = {textTransformString}>
					{text}
				</text>
				{indicators}
				
			</g>
  		)
	},
})