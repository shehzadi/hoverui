var InterfaceToken = React.createClass({
	getInitialState: function() {
		return {
			isHover: false,
		};
	},

	getDefaultProps: function() {
		return {
			arrow: 5,
		};
	},

	onMouseEnter: function() {	
		this.props.onMouseEnter(this.props.componentID, this.props.interfaceGroupID, this.props.isInvalid);
		this.setState({
			isHover: true
    	});
	},

	onMouseLeave: function() {	
		this.props.onMouseLeave(this.props.componentID, this.props.interfaceGroupID, this.props.isInvalid);
		this.setState({
			isHover: false
    	});
	},

	onMouseDown: function() {	
		this.props.onMouseDown(this.props.componentID, this.props.interfaceGroupID, this.props.interfaceIDObject)
	},

	onMouseUp: function() {	
		this.props.onMouseUp(this.props.componentID, this.props.interfaceGroupID, this.props.isInvalid);
		this.setState({
			isHover: false
    	});
	},

	render: function() {
		/*
		var end1Comp = this.props.endpoints[0].component;
		var end1Ifc = this.props.endpoints[0].ifc;
		var end1CompData = this.props.componentData[end1Comp];
		var end1Coords = getInterfaceCoords(end1CompData, end1Ifc);
		*/

		//var centerPoint = 
		var leftCenterPoint = this.props.tokenObject.left;
		var topCenterPoint = this.props.tokenObject.top;
		
		var growthW = 0;
		var growthH = 0;
		if ((this.state.isHover && !this.props.tokenObject.isInvalid) || this.props.tokenObject.isStartOfNewWire){
			growthW = 5;
			growthH = 9;
		}

		var thisOpacity = 1;
		if (this.props.tokenObject.isInvalid && !this.props.tokenObject.isStartOfNewWire){
			thisOpacity = 0.2
		}

		if (this.props.isPendingDeletion == this.props.componentID){
			thisOpacity = 0
		}
//this.componentData[componentID]["interfaceGroups"][thisGroupID].top
		var polygon = {	
			width: this.props.ifcDims.width + growthW,
			height: this.props.ifcDims.height + growthH,
			left: leftCenterPoint - (this.props.ifcDims.width/2) - growthW/2,
			top: topCenterPoint - (this.props.ifcDims.height/2) - growthH/2 
		};

		var fillColor = getHSL(this.props.protocols[this.props.tokenObject.protocol].hue);
		var borderColor = getHSL(this.props.protocols[this.props.tokenObject.protocol].hue, true);

		var style = {
			fill: fillColor,
			stroke: borderColor,
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
		//console.log(nInterfaceGroups);

		var text = "";
		if (Number.isInteger(available)){
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

		if (this.props.tokenObject.face == "top"){
			rotation = 180;
		}

		var transformString = "rotate(" + rotation + " " + leftCenterPoint + " " + topCenterPoint + ")";
		var textTransformString = "rotate(" + (-rotation) + " " + textX + " " + textY + ")";


		//<text x="100" y="50" text-anchor="middle" dominant-baseline="central" transform="rotate(0, 100, 50)"></text>

 
		return (
			<g
				transform = {transformString}>
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
			</g>
  		)
	},
})