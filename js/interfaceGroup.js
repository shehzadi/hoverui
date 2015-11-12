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
		var leftCenterPoint = this.props.componentData[this.props.componentID]["interfaceGroups"][this.props.interfaceGroupID].left;
		var topCenterPoint = this.props.componentData[this.props.componentID]["interfaceGroups"][this.props.interfaceGroupID].top;
		
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
			left: leftCenterPoint - (this.props.width/2) - growthW/2,
			top: topCenterPoint - (this.props.height/2) - growthH/2 
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
		var textY = polygon.top - 7;

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
		var textTransformString = "rotate(" + (-rotation) + " " + textX + " " + textY + ")";


		//<text x="100" y="50" text-anchor="middle" dominant-baseline="central" transform="rotate(0, 100, 50)"></text>

 
		return (
			<g
				transform = {transformString}>
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
					style = {textStyle} 
					transform = {textTransformString}>
					{text}
				</text>
			</g>
  		)
	},
})