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
		//console.log(this.props.endpoints);
		var end1Comp = this.props.endpoints[0].component;
		var end1Ifc = this.props.endpoints[0].ifc;
		var end1CompData = this.props.componentData[end1Comp];
		var end1Coords = getInterfaceCoords(end1CompData, end1Ifc);

		var end2Comp = this.props.endpoints[1].component;
		var end2Ifc = this.props.endpoints[1].ifc;
		var end2CompData = this.props.componentData[end2Comp];
		//console.log(end2CompData, end2Ifc);
		var end2Coords = getInterfaceCoords(end2CompData, end2Ifc);

		var growth = 0;
		if (this.state.isHover){
			growth = 3
		};

		var dashArray = "";
		var className = "wire";
		if ((this.props.isPendingDeletion == end1Comp || this.props.isPendingDeletion == end2Comp) 
			|| (_.isEqual(this.props.existingWireEndpoint, this.props.endpoints[0]) || _.isEqual(this.props.existingWireEndpoint, this.props.endpoints[1]))) {
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