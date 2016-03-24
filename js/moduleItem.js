var ModuleItem = React.createClass({
	render: function() {
		return (
			<div
				className="moduleItem"
				onMouseDown = {this.props.onMouseDown.bind(null, this.props.moduleID)}>
				<div className="content">
	  				<h3>
	  					<span className="name">{this.props.moduleItem.name}</span>
	  					<span className="version">{this.props.moduleItem.version}</span>
	  				</h3>
	  				<div className="moduleDescription">{this.props.moduleItem.description}</div>
  				</div>
      		</div>
		);
	}
});