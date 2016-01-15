var Wire = React.createClass({
	getInitialState: function() {
		return {
			isHover: false,
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

	render: function() {
		var end1 = this.props.wire[0];
		var end1Data = this.props.componentData[end1.component];
		var end1Coords = getInterfaceCoords(end1Data, end1.ifc);

		var end2 = this.props.wire[1];
		var end2Data = this.props.componentData[end2.component];
		var end2Coords = getInterfaceCoords(end2Data, end2.ifc);

		var growth = 0;
		if (this.state.isHover){
			growth = 3
		};

		var dashArray = "";
		var className = "wire";
		if ((this.props.isPendingDeletion == end1.component || this.props.isPendingDeletion == end2.component) 
			|| (_.isEqual(this.props.existingWireEndpoint, end1) || _.isEqual(this.props.existingWireEndpoint, end2))) {
			dashArray = "3,3";
			growth = -1;
		}
		else {
			className = "wire " + this.props.wireClass;
		}

		//var svgVisibility = "visible";
		//if (_.isEqual(this.props.existingWireEndpoint, this.props.endpoints["endpoint-1"]) || _.isEqual(this.props.existingWireEndpoint, this.props.endpoints["endpoint-2"])){
		//	svgVisibility = "hidden";
		//}

		var componentStyle = {
			stroke: this.props.color,
			strokeDasharray: dashArray, 
			strokeWidth: this.props.stroke + growth
			//visibility: svgVisibility
		};

		return (
			<line 
				className = {className} 
				onMouseEnter={this.onMouseEnter} 
				onMouseLeave={this.onMouseLeave} 
				x1 = {end1Coords.x} 
				y1 = {end1Coords.y} 
				x2 = {end2Coords.x} 
				y2 = {end2Coords.y} 
				style = {componentStyle}/>
		);
	}
});