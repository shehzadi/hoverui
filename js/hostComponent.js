var HostComponent = React.createClass({
	onMouseDown: function() {
		this.props.onMouseDown(this.props.hostComponentID, "hostComponent")
	},

	render: function() {
		var containerStyle = {
			width: this.props.hostCompDims.width,
			height: this.props.hostCompDims.height,
			top: this.props.hostComponent.top,
			left: this.props.hostComponent.left,
		};

		var hostIfcName = this.props.hostComponent.name;
		console.log("SHEHZAD hostIfcName = ", hostIfcName);
		if (hostIfcName){
			if (_.isEmpty(hostIfcName)){
				hostIfcName = "hostIfcName";
			}
		}else{
			hostIfcName = "hostIfcName";
		}

		return (
			<div 
				className="hostComponent" 
				style={containerStyle}
				onMouseDown={this.onMouseDown}>
				{hostIfcName}
  			</div>
		);
	}
});