var Instrument = React.createClass({
	handleMouseDown: function(){
		this.props.onMouseDown(this.props.instrumentID, "instrument")
	},

	top: function(event){event.stopPropagation();this.props.onMouseDown(this.props.instrumentID, "instrument", "top")},
	topRight: function(event){event.stopPropagation();this.props.onMouseDown(this.props.instrumentID, "instrument", "top right")},
	right: function(event){event.stopPropagation();this.props.onMouseDown(this.props.instrumentID, "instrument", "right")},
	bottomRight: function(event){event.stopPropagation();this.props.onMouseDown(this.props.instrumentID, "instrument", "bottom right")},
	bottom: function(event){event.stopPropagation();this.props.onMouseDown(this.props.instrumentID, "instrument", "bottom")},
	bottomLeft: function(event){event.stopPropagation();this.props.onMouseDown(this.props.instrumentID, "instrument", "bottom left")},
	left: function(event){event.stopPropagation();this.props.onMouseDown(this.props.instrumentID, "instrument", "left")},
	topLeft: function(event){event.stopPropagation();this.props.onMouseDown(this.props.instrumentID, "instrument", "top left")},

	render: function() {
		var hue = this.props.instrumentObject.view.hue;
		var style = {
			backgroundColor: getHSL(hue, null, 0.07),
			borderColor: getHSL(hue, null, 0.4),
			width: this.props.instrumentObject.width,
			height: this.props.instrumentObject.height,
			top: this.props.instrumentObject.top,
			left: this.props.instrumentObject.left,
			zIndex: -1 * this.props.instrumentObject.width * this.props.instrumentObject.height
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