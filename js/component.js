var Component = React.createClass({
	handleMouseDown: function(){
		this.props.onMouseDown(this.props.componentID)
	},

	render: function() {
		var componentData = this.props.componentData[this.props.componentID];
		var componentStyle = {
			width: this.props.compDims.width,
			height: this.props.compDims.height,
			top: componentData.top,
			left: componentData.left
		};

		var classString = "component";
		if (this.props.isPendingDeletion == this.props.componentID){
			classString += " pendingDeletion"
		}

		return (
			<div 
				className = {classString} 
				onMouseDown = {this.handleMouseDown}  
				style = {componentStyle}>
  				<div className="componentName">
  					{componentData.module.name}
  				</div>
  				<div className="componentVersion">
  					{componentData.module.version}
  				</div>	
  			</div>
		);
	}
});