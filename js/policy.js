var Policy = React.createClass({
	handleMouseDown: function(){
		console.log("mouseDown", this.props.policyID);
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
	}
});