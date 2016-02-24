var InstrumentLink = React.createClass({
	render: function() {

		// make path string
		var pathString = "M" + this.props.source.left + " " + this.props.source.top;

		pathString += " L" + (this.props.view.left + (this.props.view.width / 2)) + " " + (this.props.view.top + (this.props.view.height / 2));

		return (
			<path 
				className = "instrumentLink"
				d = {pathString}/>
		);
	}
});