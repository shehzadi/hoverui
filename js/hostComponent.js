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

		var label = "";
		var classNameString = "hostComponent";

		var hostIfcName = this.props.hostComponent.name;
		if (_.isString(hostIfcName)){
			label = hostIfcName;	
		}
		else {
			classNameString += " isNotMapped";
			label = "No Mapping"
		}


		var buttonClassString = "hostComponentLabel";
		if (this.props.menuTarget.value == this.props.hostComponentID){
			buttonClassString += " isOpenMenu"
		}

		if (this.props.isPendingDeletion == this.props.hostComponentID){
			classNameString += " pendingDeletion"
  		}
		

		return (
			<div 
				className={classNameString} 
				style={containerStyle}
				onMouseDown={this.onMouseDown}>
				<button className={buttonClassString} onClick={this.openMenu} name="mapHostInterface" value={this.props.hostComponentID}>{label}<span className="caret"></span></button>
  			</div>
		);
	}
});