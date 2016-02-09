var Policy = React.createClass({
	handleMouseDown: function(){
		this.props.onMouseDown(this.props.policyID, "policy")
	},
	render: function() {
		var style = {
			width: this.props.policyObject.width,
			height: this.props.policyObject.height,
			top: this.props.policyObject.top,
			left: this.props.policyObject.left
		}

		var classString = "policy";
		if (this.props.isPendingDeletion == this.props.policyID){
			classString += " pendingDeletion"
		}
		return (
			<div 
				className = {classString} 
				onMouseDown = {this.handleMouseDown} 
				style = {style}>
  				<div className="policyName">
  					{this.props.policyObject.module.name}
	  				<span className="policyVersion">
	  					{this.props.policyObject.module.version}
	  				</span>
  				</div>
  				<div className = "grab top"></div>
  				<div className = "grab topRight"></div>
  				<div className = "grab right"></div>
  				<div className = "grab bottomRight"></div>
  				<div className = "grab bottom"></div>
  				<div className = "grab bottomLeft"></div>
  				<div className = "grab left"></div>
  				<div className = "grab topLeft"></div>
  			</div>		
		);
	},
	componentDidMount: function(){
		// if policy object has no interfaces (yet) check interfaces because it may be new
		if (_.isEmpty(this.props.policyObject.interfaces)){
			// if new policy overlaps an interface, send an event upwards to update data on Main
			var interfaceArray = getInterfaceArray(this.props.policyObject, this.props.componentData, this.props.hostComponentData);
			if (!_.isEmpty(interfaceArray)){
				this.props.handlePolicyUpdate(this.props.policyID, interfaceArray, 0, 0)
			}
		}
		
	},
});