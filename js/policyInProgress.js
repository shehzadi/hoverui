var PolicyInProgress = React.createClass({
	render: function() {
		var style = {
			width: this.props.dims.width,
			height: this.props.dims.height,
			top: this.props.thisY - (this.props.dims.height / 2),
			left: this.props.thisX - (this.props.dims.width / 2)
		}
		return (
			<div 
				className="policyInProgress" 
				style={style}>
  				<div className="policyName">
  					{this.props.module.name}
  				</div>
  				<div className="policyVersion">
  					{this.props.module.version}
  				</div>
  			</div>		
		);
	},
});