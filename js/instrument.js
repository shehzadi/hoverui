var Instrument = React.createClass({

	getDefaultProps: function(){
		return {
			margin: 8,
			marginTop: 22,
			marginBottom: 30,
		};
	},

	handleMouseDown: function(){
		this.props.onMouseDown(this.props.id, "instrument")
	},

	dragWire: function(event){
		event.stopPropagation();
	},

	bottomRight: function(event){
		event.stopPropagation();
		this.props.onMouseDown(this.props.id, "instrument", "bottom right")
	},

	render: function() {
		var containerStyle = {
			width: this.props.instrument.width,
			height: this.props.instrument.height,
			top: this.props.instrument.top,
			left: this.props.instrument.left
		}

		var contentStyle = {
			width: this.props.instrument.width - (2*this.props.margin),
			height: this.props.instrument.height - this.props.marginBottom - this.props.marginTop,
			top: this.props.marginTop,
			left: this.props.margin
		}

		var classString = "instrument";
		if (this.props.isPendingDeletion == this.props.id){
			classString += " pendingDeletion"
		}
		return (
			<div 
				className = {classString} 
				onMouseDown = {this.handleMouseDown} 
				style = {containerStyle}>
  				<div className="instrumentName">
  					{this.props.instrument.module.name}
	  				<span className="instrumentVersion">
	  					{this.props.instrument.module.version}
	  				</span>
  				</div>
  				<div className = "content" style = {contentStyle}></div>
  				<div className = "grab bottomRight" onMouseDown = {this.bottomRight}></div>
  				<div 
  					className = "dragSource"
  					onMouseDown = {this.dragWire}>
  					Drag Wire
  				</div>
  			</div>		
		);
	},
});