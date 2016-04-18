var Policy = React.createClass({
	handleMouseDown: function(){
		this.props.onMouseDown(this.props.policyID, "policy")
	},

	priorityHandler: function(event){
		this.props.openPopover(event)
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
		var thisPolicy = this.props.policyData[this.props.policyID];
		var hue = thisPolicy.view.hue;
		var style = {
			backgroundColor: getHSL(hue, null, 0.07),
			borderColor: getHSL(hue, null, 0.4),
			width: thisPolicy.width,
			height: thisPolicy.height,
			top: thisPolicy.top,
			left: thisPolicy.left,
			zIndex: -1 * thisPolicy.width * thisPolicy.height
		}

		var classString = "policy";
		if (this.props.isPendingDeletion == this.props.policyID){
			classString += " pendingDeletion"
		}

		var buttonLabel = "Priority: " + thisPolicy.priority;
		return (
			<div 
				className = {classString} 
				onMouseDown = {this.handleMouseDown} 
				style = {style}>
  				<div className = "policyHeader">
	  				<div className = "policyDetails">
	  					<span className = "policyName">{thisPolicy.module.name}</span>
						<span className = "policyVersion">{thisPolicy.module.version}</span>
	  				</div>		
		  			<button className="priority" onClick={this.priorityHandler} name="prioritySelector" value={this.props.policyID}>{buttonLabel}<span className="caret"></span></button>
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