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

		var componentStyle = {
			stroke: this.props.color,
			strokeWidth: this.props.stroke + growth,
		};

		var className = "wire " + this.props.wireClass;

		return (
			<line 
				className = {className} 
				onMouseEnter={this.onMouseEnter} 
				onMouseLeave={this.onMouseLeave} 
				x1 = {this.props.interfaceGroupCoordinates[end1Comp][end1Group].left} 
				y1 = {this.props.interfaceGroupCoordinates[end1Comp][end1Group].top} 
				x2 = {this.props.interfaceGroupCoordinates[end2Comp][end2Group].left} 
				y2 = {this.props.interfaceGroupCoordinates[end2Comp][end2Group].top} 
				style = {componentStyle}/>
		);
	}
});