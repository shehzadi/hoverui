var InstrumentLink = React.createClass({
	getInitialState: function() {
		return {
			isSourceHover: false,
		};
	},

	handleMouseEnter: function() {	
		console.log("Entered source");
    	this.setState({
			isSourceHover: true
    	});
	},

	handleMouseLeave: function() {	
    	this.setState({
			isSourceHover: false
		});
	},

	render: function() {
		// if snapping
		var sourceRadius = 3;
		var style = {};

		if (this.props.type == "inProgress"){
			style = {pointerEvents: "none"}
		}


		if (this.state.isSourceHover && this.props.type != "inProgress"){
			sourceRadius = 7;
		}
		var sourceLeft = this.props.source.left;
		var sourceTop = this.props.source.top;
		if (this.props.isSnapping){
			sourceRadius = 7;
			sourceLeft = this.props.isSnapping.left;
			sourceTop = this.props.isSnapping.top;
			if (this.props.isSnapping.type == "host_component"){
				sourceLeft = this.props.isSnapping.ifcLeft;
				sourceTop = this.props.isSnapping.ifcTop;
			}
			
		}

		// make path string
		var pathString = "M" + sourceLeft + " " + sourceTop;

		var viewerCenter = {
			left: this.props.viewer.left + (this.props.viewer.width / 2),
			top: this.props.viewer.top + (this.props.viewer.height / 2)
		}

		var intersection = {
			left: this.props.viewer.left,
			top: this.props.viewer.top
		};
		var refAngle =  this.props.viewer.height / this.props.viewer.width;
		var vector = {
			x: sourceLeft - viewerCenter.left,
			y: sourceTop - viewerCenter.top,
		}
		
			if ((vector.x * refAngle) <= vector.y){
				if ((vector.x * -refAngle) < vector.y){
					intersection = {
						top: this.props.viewer.top + this.props.viewer.height,
						left: viewerCenter.left + ((vector.x / vector.y) * (this.props.viewer.height / 2))
					};
				}
				else {
					intersection = {
						left: this.props.viewer.left,
						top: viewerCenter.top - ((vector.y / vector.x) * (this.props.viewer.width / 2))
					};
				}
			}

			else {
				if ((vector.x * -refAngle) > vector.y){
					intersection = {
						top: this.props.viewer.top,
						left: viewerCenter.left - ((vector.x / vector.y) * (this.props.viewer.height / 2))
					};
				}
				else {
					intersection = {
						left: this.props.viewer.left + this.props.viewer.width,
						top: viewerCenter.top + ((vector.y / vector.x) * (this.props.viewer.width / 2))
					};
				}
			}
		
		pathString += " L" + intersection.left + " " + intersection.top;



		return (
			<g className = "instrumentLink">
				<path 
					d = {pathString}/>
				<circle 
					cx={sourceLeft} 
					cy={sourceTop} 
					r={sourceRadius} 
					style={style}
					onMouseEnter={this.handleMouseEnter} 
					onMouseLeave={this.handleMouseLeave}/>
				<circle 
					cx={intersection.left} 
					cy={intersection.top} 
					r="4.5" />
			</g>
		);
	}
});