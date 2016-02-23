var Instrument = React.createClass({
	handleMouseDown: function(){
		this.props.onMouseDown(this.props.instrumentID, "instrument")
	},

	bottomRight: function(event){
		event.stopPropagation();
		this.props.onMouseDown(this.props.instrumentID, "instrument", "bottom right")
	},

	render: function() {
		var hue = this.props.instrumentObject.view.hue;
		var style = {
			width: this.props.instrumentObject.width,
			height: this.props.instrumentObject.height,
			top: this.props.instrumentObject.top,
			left: this.props.instrumentObject.left
		}

		var classString = "instrument";
		if (this.props.isPendingDeletion == this.props.instrumentID){
			classString += " pendingDeletion"
		}
		return (
			<div 
				className = {classString} 
				onMouseDown = {this.handleMouseDown} 
				style = {style}>
  				<div className="policyName">
  					{this.props.instrumentObject.module.name}
	  				<span className="policyVersion">
	  					{this.props.instrumentObject.module.version}
	  				</span>
  				</div>
  				<div>Instrument Content</div>
  				<div className = "grab bottomRight" onMouseDown = {this.bottomRight}></div>
  			</div>		
		);
	},
});