var WireInProgress = React.createClass({
	render: function() {
		var thisProtocol = this.props.dragging.protocol;
		var staticEnd = this.props.dragging;

		if (staticEnd.hostComponentID){
			var x1 = staticEnd.ifcLeft;
			var y1 = staticEnd.ifcTop;
		}
		else if (staticEnd.componentID){
			var x1 = staticEnd.left;
			var y1 = staticEnd.top;
		}

		var lengthOfStraight = 15;
		var pathString = "M" + x1 + " " + y1;

		var startFace = "";
		
		if (staticEnd.face){startFace = staticEnd.face}
		else if (staticEnd.defaultFace){startFace = staticEnd.defaultFace}		
		else if (staticEnd.mode){
			switch (staticEnd.mode){
				case "in":
					startFace = "top"; break;
				default:
					startFace = "bottom";
			}
		}

		switch (startFace){
			case "top":
				pathString += " V" + (y1 - lengthOfStraight); break;
			case "right":
				pathString += " H" + (x1 + lengthOfStraight); break;
			case "bottom":
				pathString += " V" + (y1 + lengthOfStraight); break;
			case "left":
				pathString += " H" + (x1 - lengthOfStraight); break;
			default:
				pathString += " V" + (y1 + lengthOfStraight);
		}

		var componentStyle = {
			stroke: getHSL(this.props.protocols[thisProtocol].hue, "darker"),
			strokeWidth: 3,
			fill: "transparent"
		};

		var x2 = this.props.cursorX;
		var y2 = this.props.cursorY;
		var endFace = "";

		var snapIfc = this.props.isSnapping;
		if (snapIfc){

			if (snapIfc.ifcLeft){
				x2 = snapIfc.ifcLeft;
				y2 = snapIfc.ifcTop
			}
			else {
				x2 = snapIfc.left;
				y2 = snapIfc.top
			}

			if (snapIfc.face){endFace = snapIfc.face}
			else if (snapIfc.defaultFace){endFace = snapIfc.defaultFace}
			else if (snapIfc.mode){
				switch (snapIfc.mode){
					case "in":
						endFace = "top"; break;
					default:
						endFace = "bottom";
				}
			}

			switch (endFace){
				case "top":
					pathString += " L" + x2 + " " + (y2 - lengthOfStraight); break;
				case "right":
					pathString += " L" + (x2 + lengthOfStraight) + " " + y2; break;
				case "bottom":
					pathString += " L" + x2 + " " + (y2 + lengthOfStraight); break;
				case "left":
					pathString += " L" + (x2 - lengthOfStraight) + " " + y2; break;
			}
		}

		pathString += " L" + x2 + " " + y2;

		return (
			<path 
				className = "wire" 
				d = {pathString}
				style = {componentStyle}/>
		);
	}
});