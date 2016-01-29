var WireInProgress = React.createClass({
	render: function() {
		var thisProtocol = this.props.dragging.protocol;
		var staticEnd = this.props.dragging;
		/*if (this.props.wireType == "new"){
			staticEnd = this.props.dragging
			
		}
		*/

		/*
		else if (this.props.wireType == "existing"){

			var farEndComponent = this.props.dragging.wireTo.component;
			var farEndInterface = this.props.dragging.wireTo.ifc;
			if (!farEndInterface) { //no ifc data for hosts
				//console.log("host", this.props.hostComponentData);
				staticEnd = this.props.hostComponentData[farEndComponent]

			}
			else {
				//console.log("comp", this.props.componentData[farEndComponent].interfaces[farEndInterface]);
				staticEnd = this.props.componentData[farEndComponent].interfaces[farEndInterface]
			}
		}
		*/



		if (staticEnd.hostComponentID){
			var x1 = staticEnd.ifcLeft;
			var y1 = staticEnd.ifcTop;
		}
		else if (staticEnd.componentID){
			var x1 = staticEnd.left;
			var y1 = staticEnd.top;
		}

		
		var componentStyle = {
			stroke: getHSL(this.props.protocols[thisProtocol].hue, "darker"),
			strokeWidth: 3,
		};

		var x2 = this.props.cursorX;
		var y2 = this.props.cursorY;
		//console.log(this.props.isSnapping);
		if (this.props.isSnapping){
			if (this.props.isSnapping.ifcLeft){
				x2 = this.props.isSnapping.ifcLeft;
				y2 = this.props.isSnapping.ifcTop
			}
			else {
				x2 = this.props.isSnapping.left;
				y2 = this.props.isSnapping.top
			}
			
		}

		return (
			<line 
				className = "wire" 
				x1 = {x1} 
				y1 = {y1} 
				x2 = {x2}
				y2 = {y2}
				style = {componentStyle}/>
		);
	}
});

/*
var wireInProgress = <WireInProgress
	protocols = {this.props.protocols} 
	dragging = {this.state.dragging}
	isSnapping = {this.state.isSnapping} 
	componentData = {this.componentData} 
	cursorX = {this.state.cursorX} 
	cursorY = {this.state.cursorY}/>
*/