var InstrumentLink = React.createClass({
	getInitialState: function() {
		return {
			isSourceHover: false,
		};
	},

	handleMouseEnter: function() {	
    	this.setState({
			isSourceHover: true
    	});
	},

	handleMouseDown: function() {	
		this.props.linkMouseDown(this.props.instrument, this.props.linkTo)
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
		var wireStyle = {};

		if (this.props.type == "inProgress"){
			style = {pointerEvents: "none"}
		}
		else{
			if (this.props.isPendingUpdate.component == this.props.linkTo.component){
				if (!this.props.isPendingUpdate.ifc || !this.props.linkTo.ifc){ // host
					wireStyle = {display: "none"}
				}
				else if (this.props.isPendingUpdate.ifc == this.props.linkTo.ifc){
					wireStyle = {display: "none"}
				}
			}
		}

		if (this.state.isSourceHover && this.props.type != "inProgress"){
			sourceRadius = 7;
		}
		var sourceLeft = this.props.linkTo.left;
		var sourceTop = this.props.linkTo.top;
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
			left: this.props.instrument.left + (this.props.instrument.width / 2),
			top: this.props.instrument.top + (this.props.instrument.height / 2)
		}

		var intersection = {
			left: this.props.instrument.left,
			top: this.props.instrument.top
		};
		var refAngle =  this.props.instrument.height / this.props.instrument.width;
		var vector = {
			x: sourceLeft - viewerCenter.left,
			y: sourceTop - viewerCenter.top,
		}
		
			if ((vector.x * refAngle) <= vector.y){
				if ((vector.x * -refAngle) < vector.y){
					intersection = {
						top: this.props.instrument.top + this.props.instrument.height,
						left: viewerCenter.left + ((vector.x / vector.y) * (this.props.instrument.height / 2))
					};
				}
				else {
					intersection = {
						left: this.props.instrument.left,
						top: viewerCenter.top - ((vector.y / vector.x) * (this.props.instrument.width / 2))
					};
				}
			}

			else {
				if ((vector.x * -refAngle) > vector.y){
					intersection = {
						top: this.props.instrument.top,
						left: viewerCenter.left - ((vector.x / vector.y) * (this.props.instrument.height / 2))
					};
				}
				else {
					intersection = {
						left: this.props.instrument.left + this.props.instrument.width,
						top: viewerCenter.top + ((vector.y / vector.x) * (this.props.instrument.width / 2))
					};
				}
			}
		
		pathString += " L" + intersection.left + " " + intersection.top;

		return (
			<g className = "instrumentLink" style = {wireStyle}>
				<path 
					d = {pathString}/>
				<circle 
					cx={sourceLeft} 
					cy={sourceTop} 
					r={sourceRadius} 
					style={style}
					onMouseEnter={this.handleMouseEnter} 
					onMouseDown={this.handleMouseDown} 
					onMouseLeave={this.handleMouseLeave}/>
				<circle 
					className="viewer"
					cx={intersection.left} 
					cy={intersection.top} 
					r="1.5" />
			</g>
		);
	}
});