var HostComponent = React.createClass({
	onMouseDown: function() {
		this.props.onMouseDown(this.props.componentID)
	},

	render: function() {

		var containerStyle = {
			width: this.props.hostCompDims.width,
			height: this.props.hostCompDims.height,
			top: this.props.hostComponent.top,
			left: this.props.hostComponent.left,
		};

		return (
			<div 
				className="hostComponent" 
				style={containerStyle}
				onMouseDown={this.onMouseDown}>
				hostIfcName
  			</div>
		);
	}
});