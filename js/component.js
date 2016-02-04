var Component = React.createClass({
	handleMouseDown: function(){
		this.props.onMouseDown(this.props.componentID, "component")
	},

	render: function() {
		var componentStyle = {
			width: this.props.compDims.width,
			height: this.props.compDims.height,
			top: this.props.component.top,
			left: this.props.component.left
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
  					{this.props.component.module.name}
  				</div>
  				<div className="componentVersion">
  					{this.props.component.module.version}
  				</div>	
  			</div>
		);
	}
});