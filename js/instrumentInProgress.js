var InstrumentInProgress = React.createClass({
	render: function() {
		var style = {
			width: this.props.module.view.width,
			height: this.props.module.view.height,
			top: this.props.thisY - (this.props.module.view.height / 2),
			left: this.props.thisX - (this.props.module.view.width / 2)
		}
		return (
			<div 
				className="instrumentInProgress" 
				style={style}>
  				<div className="instrumentName">
  					{this.props.module.name}
	  				<span className="instrumentVersion">
	  					{this.props.module.version}
	  				</span>
  				</div>
  			</div>		
		);
	},
});