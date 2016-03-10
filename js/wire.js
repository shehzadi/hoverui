var Wire = React.createClass({
	getInitialState: function() {
		return {
			isHover: false,
		};
	},

  	getDefaultProps: function() {
    	return {
    		width: 2
    	};
	},

	onMouseEnter: function() {	
		if (!this.props.dragging){
			this.setState({
				isHover: true
    		});
		}	
	},

	onMouseLeave: function() {	
		this.setState({
			isHover: false
    	});
	},

	render: function() {
		var wireCoordinates = {};

		var that = this;
		_.forEach(this.props.wire, function(endpoint, i){
			var thisCoordinates = {};
			if (endpoint.ifc){//endpoint is component NOT host
				var root = that.props.componentData[endpoint.component].interfaces[endpoint.ifc];
				thisCoordinates["left"] = root.left;
				thisCoordinates["top"] = root.top;
			}
			else {
				var root = that.props.hostComponentData[endpoint.component];
				thisCoordinates["left"] = root.ifcLeft;
				thisCoordinates["top"] = root.ifcTop;
			}
			thisCoordinates["face"] = root.face;
			wireCoordinates["end" + i] = thisCoordinates;
		});

		var thisProtocol = this.props.wire[0].protocol;
		var thisStrokeColor = getHSL(this.props.protocols[thisProtocol].hue, "darker");
		var thisOpacity = 1;

		var growth = 0;
		if (this.state.isHover){
			growth = 4
		};

		var dashArray = "";
		var className = "wire";

		if (this.props.wire[0].component == this.props.isPendingDeletion || this.props.wire[1].component == this.props.isPendingDeletion){
			dashArray = "3,3";
		}

		if (this.props.dragging.componentID || this.props.dragging.hostComponentID){ // wire is being dragged
			thisOpacity = 0.2
		}

		if (this.props.isPendingUpdate == this.props.wire[0].wire){
			dashArray = "3,3";
			thisOpacity = 1
		}

		var componentStyle = {
			stroke: thisStrokeColor,
			strokeDasharray: dashArray, 
			strokeWidth: this.props.width + growth,
			opacity: thisOpacity,
			fill: "transparent"
		};

		// make path string
		//<path d="M10 10 H 90 V 90 H 10 L 10 10"/>
		var lengthOfStraight = 15;
		var pathString = "M" + wireCoordinates.end0.left + " " + wireCoordinates.end0.top;

		switch (wireCoordinates.end0.face){
			case "top":
				pathString += " V" + (wireCoordinates.end0.top - lengthOfStraight); break;
			case "right":
				pathString += " H" + (wireCoordinates.end0.left + lengthOfStraight); break;
			case "bottom":
				pathString += " V" + (wireCoordinates.end0.top + lengthOfStraight); break;
			case "left":
				pathString += " H" + (wireCoordinates.end0.left - lengthOfStraight); break;
		}

		switch (wireCoordinates.end1.face){
			case "top":
				pathString += " L" + wireCoordinates.end1.left + " " + (wireCoordinates.end1.top - lengthOfStraight); break;
			case "right":
				pathString += " L" + (wireCoordinates.end1.left + lengthOfStraight) + " " + wireCoordinates.end1.top; break;
			case "bottom":
				pathString += " L" + wireCoordinates.end1.left + " " + (wireCoordinates.end1.top + lengthOfStraight); break;
			case "left":
				pathString += " L" + (wireCoordinates.end1.left - lengthOfStraight) + " " + wireCoordinates.end1.top; break;
		}

		pathString += " L" + wireCoordinates.end1.left + " " + wireCoordinates.end1.top;

		return (
			<path 
				className = {className} 
				onMouseEnter = {this.onMouseEnter} 
				onMouseLeave = {this.onMouseLeave} 
				d = {pathString} 
				style = {componentStyle}/>
		);
	}
});