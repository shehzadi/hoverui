var Instrument = React.createClass({
	handleMouseDown: function(){
		this.props.onMouseDown(this.props.id, "instrument")
	},

	bottomRight: function(event){
		event.stopPropagation();
		this.props.onMouseDown(this.props.id, "instrument", "bottom right")
	},

	render: function() {
		var style = {
			width: this.props.instrument.width,
			height: this.props.instrument.height,
			top: this.props.instrument.top,
			left: this.props.instrument.left
		}

		var classString = "instrument";
		if (this.props.isPendingDeletion == this.props.id){
			classString += " pendingDeletion"
		}
		return (
			<div 
				className = {classString} 
				onMouseDown = {this.handleMouseDown} 
				style = {style}>
  				<div className="instrumentName">
  					{this.props.instrument.module.name}
	  				<span className="instrumentVersion">
	  					{this.props.instrument.module.version}
	  				</span>
  				</div>
  				<div>Instrument Content</div>
  				<div className = "grab bottomRight" onMouseDown = {this.bottomRight}></div>
  			</div>		
		);
	},
});