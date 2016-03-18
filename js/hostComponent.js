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
			console.log("mapped");
			label = hostIfcName;	
		}
		else {
			console.log("not mapped");
			classNameString += " isNotMapped";
			label = "Select Host Interface"
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
				<button className={buttonClassString} onClick={this.openMenu} name="mapHostInterface" value={this.props.hostComponentID}>{label}<span className="caret"></span></button>
  			</div>
		);
	}
});