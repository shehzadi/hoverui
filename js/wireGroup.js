var WireGroup = React.createClass({
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

		var end1Comp = this.props.endpoints["endpoint-1"].component;
		var end1Group = this.props.endpoints["endpoint-1"].interfaceGroup;
		
		var end2Comp = this.props.endpoints["endpoint-2"].component;
		var end2Group = this.props.endpoints["endpoint-2"].interfaceGroup;

		var growth = 0;
		if (this.state.isHover){
			growth = 3
		};

		var dashArray = "";
		var className = "wire";
		if ((this.props.isPendingDeletion == end1Comp || this.props.isPendingDeletion == end2Comp) 
			|| (_.isEqual(this.props.existingWireEndpoint, this.props.endpoints["endpoint-1"]) || _.isEqual(this.props.existingWireEndpoint, this.props.endpoints["endpoint-2"]))) {
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
				x1 = {this.props.componentData[end1Comp].interfaceGroups[end1Group].left} 
				y1 = {this.props.componentData[end1Comp].interfaceGroups[end1Group].top} 
				x2 = {this.props.componentData[end2Comp].interfaceGroups[end2Group].left} 
				y2 = {this.props.componentData[end2Comp].interfaceGroups[end2Group].top} 
				style = {componentStyle}/>
		);
	}
});