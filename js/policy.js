var Policy = React.createClass({
	handleMouseDown: function(){
		this.props.onMouseDown(this.props.policyID, "policy")
	},

	top: function(event){event.stopPropagation();this.props.onMouseDown(this.props.policyID, "policy", "top")},
	topRight: function(event){event.stopPropagation();this.props.onMouseDown(this.props.policyID, "policy", "top right")},
	right: function(event){event.stopPropagation();this.props.onMouseDown(this.props.policyID, "policy", "right")},
	bottomRight: function(event){event.stopPropagation();this.props.onMouseDown(this.props.policyID, "policy", "bottom right")},
	bottom: function(event){event.stopPropagation();this.props.onMouseDown(this.props.policyID, "policy", "bottom")},
	bottomLeft: function(event){event.stopPropagation();this.props.onMouseDown(this.props.policyID, "policy", "bottom left")},
	left: function(event){event.stopPropagation();this.props.onMouseDown(this.props.policyID, "policy", "left")},
	topLeft: function(event){event.stopPropagation();this.props.onMouseDown(this.props.policyID, "policy", "top left")},

	render: function() {
		var hue = this.props.policyObject.view.hue;
		var style = {
			backgroundColor: getHSL(hue, null, 0.1),
			borderColor: getHSL(hue, null, 0.5),
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
  				<div className = "grab top" onMouseDown = {this.top} ></div>
  				<div className = "grab topRight" onMouseDown = {this.topRight}></div>
  				<div className = "grab right" onMouseDown = {this.right}></div>
  				<div className = "grab bottomRight" onMouseDown = {this.bottomRight}></div>
  				<div className = "grab bottom" onMouseDown = {this.bottom}></div>
  				<div className = "grab bottomLeft" onMouseDown = {this.bottomLeft}></div>
  				<div className = "grab left" onMouseDown = {this.left}></div>
  				<div className = "grab topLeft" onMouseDown = {this.topLeft}></div>
  			</div>		
		);
	},
});