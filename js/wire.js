var Wire = React.createClass({
	getInitialState: function() {
		return {
			isHover: false,
		};
	},

  	getDefaultProps: function() {
    	return {
    		width: 2
    	};
	},

	onMouseEnter: function() {	
		this.setState({
			isHover: true
    	});
	},

	onMouseLeave: function() {	
		this.setState({
			isHover: false
    	});
	},

	render: function() {
		//console.log(this.props.componentData);
		//console.log(this.props.hostComponentData);
		var wireCoordinates = {};
		//var end1 = this.props.wire[0];
		//var end1Data = this.props.componentData[end1.component];
		//var end1Left = getInterfaceCoords(end1Data, end1.ifc);

		//var end2 = this.props.wire[1];
		//var end2Data = this.props.componentData[end2.component];
		//var end2Coords = getInterfaceCoords(end2Data, end2.ifc);



		var that = this;
		_.forEach(this.props.wire, function(endpoint, i){
			var thisCoordinates = {};
			if (endpoint.ifc){//endpoint is component NOT host
				console.log(that.props.componentData[endpoint.component].interfaces);
				var root = that.props.componentData[endpoint.component].interfaces[endpoint.ifc];
				thisCoordinates["left"] = root.left;
				thisCoordinates["top"] = root.top;
				//var thisWire = root.wire
			}
			else {
				var root = that.props.hostComponentData[endpoint.component];
				thisCoordinates["left"] = root.ifcLeft;
				thisCoordinates["top"] = root.ifcTop;
			}
			wireCoordinates["end" + i] = thisCoordinates;
		});


		var thisProtocol = this.props.wire[0].protocol;
		var thisStrokeColor = getHSL(this.props.protocols[thisProtocol].hue, "darker");


		var growth = 0;
		if (this.state.isHover){
			growth = 3
		};

		var dashArray = "";
		var className = "wire";

		if (this.props.wire[0].component == this.props.isPendingDeletion || this.props.wire[1].component == this.props.isPendingDeletion){
			dashArray = "3,3";
			growth = -1;		
		}

		if (this.props.wire[0].component == this.props.isPendingDeletion || this.props.wire[1].component == this.props.isPendingDeletion){
			dashArray = "3,3";
			growth = -1;		
		}

		if (this.props.isPendingUpdate == this.props.wire[0].wire){
			dashArray = "3,3";
		}
		/*
		if ((this.props.isPendingDeletion == end1.component || this.props.isPendingDeletion == end2.component) 
			|| (_.isEqual(this.props.existingWireEndpoint, end1) || _.isEqual(this.props.existingWireEndpoint, end2))) {
			dashArray = "3,3";
			growth = -1;
		}
		else {
			className = "wire " + this.props.wireClass;
		}
		*/

		//var svgVisibility = "visible";
		//if (_.isEqual(this.props.existingWireEndpoint, this.props.endpoints["endpoint-1"]) || _.isEqual(this.props.existingWireEndpoint, this.props.endpoints["endpoint-2"])){
		//	svgVisibility = "hidden";
		//}

		var componentStyle = {
			stroke: thisStrokeColor,
			strokeDasharray: dashArray, 
			strokeWidth: this.props.width + growth
			//visibility: svgVisibility
		};

		return (
			<line 
				className = {className} 
				onMouseEnter={this.onMouseEnter} 
				onMouseLeave={this.onMouseLeave} 
				x1 = {wireCoordinates.end0.left} 
				y1 = {wireCoordinates.end0.top} 
				x2 = {wireCoordinates.end1.left} 
				y2 = {wireCoordinates.end1.top} 
				style = {componentStyle}/>
		);
	}
});