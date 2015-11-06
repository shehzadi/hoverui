var InterfaceGroup = React.createClass({
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
		this.props.onMouseDown(this.props.componentID, this.props.interfaceGroupID, this.props.interfaceIDObject)
	},

	onMouseUp: function() {	
		this.props.onMouseUp(this.props.componentID, this.props.interfaceGroupID, this.props.isInvalid)
	},

	render: function() {
		var growthW = 0;
		var growthH = 0;
		if ((this.state.isHover && !this.props.isInvalid) || this.props.isStartOfNewWire){
			growthW = 5;
			growthH = 9;
		}

		var thisOpacity = 1;
		if (this.props.isInvalid && !this.props.isStartOfNewWire){
			thisOpacity = 0.2
		}

		if (this.props.isPendingDeletion == this.props.componentID){
			thisOpacity = 0
		}
//this.componentData[componentID]["interfaceGroups"][thisGroupID].top
		var polygon = {	
			width: this.props.width + growthW,
			height: this.props.height + growthH,
			left: this.props.componentData[this.props.componentID]["interfaceGroups"][this.props.interfaceGroupID].left - (this.props.width/2) - growthW/2,
			top: this.props.componentData[this.props.componentID]["interfaceGroups"][this.props.interfaceGroupID].top - (this.props.height/2) - growthH/2 
		};

		var style = {
			fill: this.props.color,
			stroke: this.props.border,
			opacity: thisOpacity
		}

		var textStyle = {
			fill: this.props.border,
			opacity: thisOpacity
		}

		var nInterfaceGroups = Object.keys(this.props.interfaceIDObject).length;
		//console.log(nInterfaceGroups);

		var text = "";
		if (nInterfaceGroups > 1){
			text = "" + nInterfaceGroups
		}
		var textX = polygon.left + (polygon.width / 2);
		var textY = polygon.top - 3;

		var inputPointer = "";
		var outputPointer = "";
		if (this.props.interfaceMode == "input" || this.props.interfaceMode == "bidirectional"){
			inputPointer = " " + (polygon.left + (polygon.width / 2)) + ", " + (polygon.top - this.props.arrow);
			textY = textY - this.props.arrow;
		}
		if (this.props.interfaceMode == "output" || this.props.interfaceMode == "bidirectional"){
			outputPointer = " " + (polygon.left + (polygon.width / 2)) + ", " + (polygon.top  + polygon.height + this.props.arrow)
		}

		var points = "" + polygon.left + ", " + polygon.top; //top-left
		points += inputPointer;
		points += " " + (polygon.left + polygon.width) + ", " + polygon.top; //top-right
		points += " " + (polygon.left + polygon.width) + ", " + (polygon.top + polygon.height); //bottom-right
		points += outputPointer;
		points += " " + polygon.left + ", " + (polygon.top + polygon.height); //bottom-left

 
		return (
			<g>
				<polygon 
					className = "interface" 
					style = {style} 
					nInerfaces = {nInterfaceGroups} 
					points = {points} 
					onMouseEnter = {this.onMouseEnter} 
					onMouseLeave = {this.onMouseLeave} 
					onMouseUp = {this.onMouseUp} 
					onMouseDown = {this.onMouseDown}/>
				<text 
					x={textX} 
					y={textY}
					style = {textStyle}>
					{text}
				</text>
			</g>
  		)
	},
});