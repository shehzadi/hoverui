var HostComponent = React.createClass({
	onMouseDown: function() {
		this.props.onMouseDown(this.props.hostComponentID, "hostComponent")
	},

	openMenu: function(event){
		this.props.openMenu(event)
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

		var classNameString = "hostComponent";
		var label = "Select Host Interface";

		if (this.props.isMapped == true){
			label = "eth0";
		}
		else {
			classNameString += " isNotMapped"
		}

		var buttonClassString = "hostComponentLabel";
		if (this.props.menuTarget.value == this.props.hostComponentID){
			buttonClassString += " isOpenMenu"
		}

		

		return (
			<div 
				className={classNameString} 
				style={containerStyle}
				onMouseDown={this.onMouseDown}>
				{hostIfcName}
				<button className={buttonClassString} onClick={this.openMenu} name="mapHostInterface" value={this.props.hostComponentID}>{label}<span className="caret"></span></button>
  			</div>
		);
	}
});