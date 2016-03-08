var InstrumentLink = React.createClass({
	render: function() {
		// make path string
		var pathString = "M" + this.props.source.left + " " + this.props.source.top;

		var viewerCenter = {
			left: this.props.viewer.left + (this.props.viewer.width / 2),
			top: this.props.viewer.top + (this.props.viewer.height / 2)
		}

		var intersection = {
			left: this.props.viewer.left,
			top: this.props.viewer.top
		};
		var refAngle =  this.props.viewer.height / this.props.viewer.width;
		var vector = {
			x: this.props.source.left - viewerCenter.left,
			y: this.props.source.top - viewerCenter.top,
		}
		
			if ((vector.x * refAngle) <= vector.y){
				if ((vector.x * -refAngle) < vector.y){
					intersection = {
						top: this.props.viewer.top + this.props.viewer.height,
						left: viewerCenter.left + ((vector.x / vector.y) * (this.props.viewer.height / 2))
					};
				}
				else {
					intersection = {
						left: this.props.viewer.left,
						top: viewerCenter.top - ((vector.y / vector.x) * (this.props.viewer.width / 2))
					};
				}
			}

			else {
				if ((vector.x * -refAngle) > vector.y){
					intersection = {
						top: this.props.viewer.top,
						left: viewerCenter.left - ((vector.x / vector.y) * (this.props.viewer.height / 2))
					};
				}
				else {
					intersection = {
						left: this.props.viewer.left + this.props.viewer.width,
						top: viewerCenter.top + ((vector.y / vector.x) * (this.props.viewer.width / 2))
					};
				}
			}
		
		pathString += " L" + intersection.left + " " + intersection.top;

		return (
			<g className = "instrumentLink">
				<path d = {pathString}/>
				<circle cx={this.props.source.left} cy={this.props.source.top} r="2.5" />
				<circle cx={intersection.left} cy={intersection.top} r="4.5" />
			</g>
		);
	}
});