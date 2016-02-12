var PolicyInProgress = React.createClass({
	render: function() {
		var hue = this.props.module.view.hue || 0;
		var style = {
			width: this.props.dims.width,
			height: this.props.dims.height,
			top: this.props.thisY - (this.props.dims.height / 2),
			left: this.props.thisX - (this.props.dims.width / 2),
			backgroundColor: getHSL(hue, null, 0.1),
			borderColor: getHSL(hue, null, 0.6)
		}
		return (
			<div 
				className="policyInProgress" 
				style={style}>
  				<div className="policyName">
  					{this.props.module.name}
	  				<span className="policyVersion">
	  					{this.props.module.version}
	  				</span>
  				</div>
  			</div>		
		);
	},
});