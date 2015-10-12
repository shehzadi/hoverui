var Workspace = React.createClass({

	getInitialState: function() {
		return {
			dragComponentID: null,
			interfaceID: null,
			componentID: null,
			mouseDown: false,
			dragging: false,
			workspaceOriginX: 0,
			workspaceOriginY: 0,
			startX: 0,
			startY: 0,
			cursorX: 0,
			cursorY: 0,
			isWireInProgress: false,
		};
	},

  	getDefaultProps: function() {
    	return {
    		component: {
    			width: 120,
    			height: 55
    		},
    		ifc: {
    			width: 18,
    			height: 5,
    			margin: 5
    		},
    		wire: {
    			width: 2
    		},
    		attachment: {
    			width: 90,
    			height: 24
    		},
    		attachmentInterface: {
    			width: 45,
    			height: 10
    		}	
    	};
	},

	onMouseDown: function(componentID, interfaceID) {	
		if (event.button == 0){	
			event.stopPropagation();
			this.addDocumentEvents();

			var workspaceBox = React.findDOMNode(this).getBoundingClientRect();
			var workspaceOriginX = workspaceBox.left;
			var workspaceOriginY = workspaceBox.top;

			if (interfaceID){ //mouse down on interface
				this.thisWireInProgressProtocol = this.getProtocol(componentID, interfaceID);
				console.log (this.thisWireInProgressProtocol)
			}
    		
    		this.setState({
    			mouseDown: true,
    			componentID: componentID,
    			interfaceID: interfaceID,
    			workspaceOriginX: workspaceOriginX,
    			workspaceOriginY: workspaceOriginY,
    			startX: event.pageX - workspaceOriginX,
    			startY: event.pageY - workspaceOriginY
    		});
		}
	},


	onInterfaceMouseUp: function(componentID, interfaceID) {
		event.stopPropagation();
		var sourceProtocol = this.getProtocol(this.state.componentID, this.state.interfaceID);
		var dropProtocol = this.getProtocol(componentID, interfaceID);
		if (sourceProtocol == dropProtocol) {
			this.props.handleWireDrop(componentID, interfaceID, this.state.componentID, this.state.interfaceID);
		}
		
	},

	getProtocol: function(componentID, interfaceID) {

		var thisProtocol = "";
		if (componentID.indexOf('att') == 0){ //is an attachment wire
			thisProtocol = this.props.selectedProject.topology.attachments[componentID]
		}
		else {
			var thisRefModule = this.props.selectedProject.topology.components[componentID];
			thisProtocol = this.props.modules[thisRefModule].interfaces[interfaceID];
		}
		return thisProtocol
	},

	onMouseMove: function(event) { //captured on document
		var cursorX = event.pageX - this.state.workspaceOriginX;
		var cursorY = event.pageY - this.state.workspaceOriginY;
		var deltaX = cursorX - this.state.startX;
		var deltaY = cursorY - this.state.startY;
		var distance = Math.abs(deltaX) + Math.abs(deltaY);

		if (this.state.dragging == false && distance > 4){ //dragging
			this.setState({
				dragging: true,
			});

			if (this.state.interfaceID){ //dragging from interface
				this.setState({
					isWireInProgress: this.thisWireInProgressProtocol
				});
			}
			else { //dragging component
				this.setState({
					dragComponentID: this.state.componentID
				});
			}
		}

		if (this.state.dragging){	
			this.setState({
				cursorX: cursorX,
    			cursorY: cursorY
			});
		}
	},

	onMouseUp: function(event) {	
		var finalX = event.pageX - this.state.workspaceOriginX;
		var finalY = event.pageY - this.state.workspaceOriginY;
		var deltaX = finalX - this.state.startX;
		var deltaY = finalY - this.state.startY;

		this.removeDocumentEvents();

		this.setState({
    		mouseDown: false
    	});

    	if (!this.state.mouseOver){
    		this.setState({
    			componentID: null,
    			interfaceID: null
    		});
    	};

		if (this.state.dragging == true){
			if (this.state.dragComponentID){
				this.props.handleComponentDrop(this.state.dragComponentID, deltaX, deltaY);
			}

			this.setState({
				dragging: false, 
				isWireInProgress: false,
				dragComponentID: null
			});				
		};			
	},

	addDocumentEvents: function() {
    	document.addEventListener('mousemove', this.onMouseMove);
    	document.addEventListener('mouseup', this.onMouseUp);
	},

	removeDocumentEvents: function() {
    	document.removeEventListener('mousemove', this.onMouseMove);
    	document.removeEventListener('mouseup', this.onMouseUp);
	},

	render: function() {
		var selectedProjectObject = this.props.selectedProject;
		if (selectedProjectObject){
			var componentsObject = {};
			var wiresObject = {};
			var attachmentsObject = {};
			if (selectedProjectObject.topology){
				componentsObject = selectedProjectObject.topology.components;
    			wiresObject = selectedProjectObject.topology.wires;
    			attachmentsObject = selectedProjectObject.topology.attachments;
    		}
		}

		this.interfaceCoordinates = {};
		var svgExtents = {
			width: 0,
			height: 0
		}

		var components = [];
		var ifcs = [];

		for (var componentID in componentsObject) {
			var componentModuleID = componentsObject[componentID];
			var componentModuleObject = this.props.modules[componentModuleID];

			var componentViewData = selectedProjectObject.view[componentID];

			var componentX = componentViewData.x;
			var componentY = componentViewData.y;

			if (componentID == this.state.dragComponentID){
				componentX = componentX + this.state.cursorX - this.state.startX;
				componentY = componentY + this.state.cursorY - this.state.startY;
			}
  			components.push(
  				<Component
					key = {componentID} 
					onMouseDown = {this.onMouseDown} 
					width = {this.props.component.width} 
					height = {this.props.component.height} 
					thisModule = {componentModuleObject} 
					thisComponentX = {componentX} 
					thisComponentY = {componentY} 
					thisComponentID = {componentID}
					protocols = {this.props.protocols}/>
  			);

  			this.interfaceCoordinates[componentID] = {};

	  		var interfacesObject = componentModuleObject.interfaces;
			var nInterfaces = _.size(interfacesObject);
			var thisN = 1;
			for (var _interface in interfacesObject) {
				var interfaceProtocol = interfacesObject[_interface];

				var thisKey = "" + componentID +  _interface;

				var leftDatum = (0.5 * this.props.component.width) - (0.5 * ((nInterfaces * (this.props.ifc.width + this.props.ifc.margin)) - this.props.ifc.margin));
				var thisLeft = componentX + leftDatum + ((thisN - 1) * (this.props.ifc.width + this.props.ifc.margin));

				var thisTop = componentY + this.props.component.height - (this.props.ifc.height / 2) + 1;

				this.isDiscreet = false;

				if (this.state.isWireInProgress){
					if (interfaceProtocol != this.thisWireInProgressProtocol || componentID == this.state.componentID) {
						this.isDiscreet = true;
					}

					if (componentID == this.state.componentID && _interface == this.state.interfaceID) {
						this.isDiscreet = false;
					}
				}

				ifcs.push(
					<Interface 
						isDiscreet = {this.isDiscreet}
						key = {thisKey} 
						onMouseDown = {this.onMouseDown} 
						onMouseUp = {this.onInterfaceMouseUp} 
						color = {this.props.protocols[interfaceProtocol].color} 
						width = {this.props.ifc.width} 
						height = {this.props.ifc.height} 
						left = {thisLeft} 
						top = {thisTop} 
						interfaceID = {_interface} 
						componentID = {componentID}/>				
				);

				this.interfaceCoordinates[componentID][_interface] = {
					top: thisTop + (this.props.ifc.height / 2),
					left: thisLeft + (this.props.ifc.width / 2)
				};

				if (thisTop > svgExtents.height){
					svgExtents.height = thisTop + this.props.ifc.height
				}

				if (thisLeft > svgExtents.width){
					svgExtents.width = thisLeft + this.props.ifc.width;
				}

				if (this.state.cursorY > svgExtents.height){
					svgExtents.height = this.state.cursorY
				}

				if (this.state.cursorX > svgExtents.width){
					svgExtents.width = this.state.cursorX
				}

				thisN = thisN + 1
			};

		};

		
		var attachments = [];
		var attachmentInterfaces = [];
		for (var attachment in attachmentsObject) {
			var thisProtocol = attachmentsObject[attachment];

			var thisViewData = selectedProjectObject.view[attachment];

			var attachmentX = thisViewData.x;
			var attachmentY = thisViewData.y;

			if (attachment == this.state.dragComponentID){
				attachmentX = attachmentX + this.state.cursorX - this.state.startX;
				attachmentY = attachmentY + this.state.cursorY - this.state.startY;
			};

			attachments.push(
				<Attachment
					key = {attachment} 
					protocol = {thisProtocol} 
					onMouseDown = {this.onMouseDown} 
					onMouseUp = {this.onInterfaceMouseUp} 
					color = {this.props.protocols[thisProtocol].color} 
					width = {this.props.attachment.width} 
					height = {this.props.attachment.height} 		
					posX = {attachmentX} 
					posY = {attachmentY} 
					ifcWidth = {this.props.attachmentInterface.width} 
					ifcHeight = {this.props.attachmentInterface.height} 
					attachmentID = {attachment}/>
			);

			var ifcX = attachmentX + (this.props.attachment.width - this.props.attachmentInterface.width) / 2;
			var ifcY = attachmentY + this.props.attachment.height - (this.props.attachmentInterface.height / 2) - 1;

			this.interfaceCoordinates[attachment] = {
				"interface-1": {
					top: ifcY + (this.props.attachmentInterface.height / 2),
					left: ifcX +(this.props.attachmentInterface.width / 2)
				}
			};

			var isDiscreet = false;

			if (this.state.isWireInProgress){
				isDiscreet = true;
				if (thisProtocol == this.state.isWireInProgress) {
					isDiscreet = false;
				}
			}

			attachmentInterfaces.push(
				<AttachmentInterface 
					key = {attachment + "interface-1"} 
					isDiscreet = {isDiscreet}
					onMouseDown = {this.onMouseDown} 
					onMouseUp = {this.onInterfaceMouseUp} 
					color = {this.props.protocols[thisProtocol].color} 
					width = {this.props.attachmentInterface.width} 
					height = {this.props.attachmentInterface.height} 
					left = {ifcX} 
					top = {ifcY} 
					interfaceID = "interface-1" 
					componentID = {attachment}/>				
			);

			if (ifcY > svgExtents.height){
				svgExtents.height = ifcY + this.props.attachmentInterface.height
			}

			if (ifcX > svgExtents.width){
				svgExtents.width = ifcX + this.props.attachmentInterface.width;
			}
		};

		var wires = [];
		for (var wire in wiresObject) {
			var thisWire = wiresObject[wire];
			var thisRefComponent = thisWire["endpoint-1"].component;
			var thisRefInterface = thisWire["endpoint-1"].ifc;
			var thisProtocol = this.getProtocol(thisRefComponent, thisRefInterface);
			
			var wireClass = "";
			if (this.state.isWireInProgress){
				wireClass = "discreet"
			}

			wires.push(
				<Wire
					key = {wire} 
					wireClass = {wireClass} 
					color = {this.props.protocols[thisProtocol].color} 
					stroke = {this.props.wire.width} 
					interfaceCoordinates = {this.interfaceCoordinates}
					thisWire = {thisWire}/>
			);
		};

		if (this.state.interfaceID && this.state.dragging) {
			var thisProtocol = this.getProtocol(this.state.componentID, this.state.interfaceID);

			var wireInProgress = <WireInProgress
				color = {this.props.protocols[thisProtocol].color} 
				thisInterface = {this.state.interfaceID} 
				thisComponent = {this.state.componentID} 
				interfaceCoordinates = {this.interfaceCoordinates} 
				thisAbsX = {this.state.cursorX} 
				thisAbsY = {this.state.cursorY} 
				stroke = {this.props.wire.width} 
				ifcDims = {this.props.ifc}/>
		}

		svgExtents.width += 20;
		svgExtents.height += 20;

		return (
			<div className="ui-module workspace pattern">	
				<svg className="wireContainer ui-module" width={svgExtents.width} height={svgExtents.height}>
					{wires}
					{wireInProgress}
				</svg>
				{components}
				{ifcs}
				{attachments}
				{attachmentInterfaces}	
			</div>
		);
	},
});

var Attachment = React.createClass({
	render: function() {
		var containerStyle = {
			width: this.props.width,
			height: this.props.height,
			top: this.props.posY,
			left: this.props.posX,
		};

		return (
			<div 
				className="attachment" 
				style={containerStyle}
				onMouseDown={this.props.onMouseDown.bind(null, this.props.attachmentID, null)}>
				Attachment
  			</div>
		);
	}
});

var AttachmentInterface = React.createClass({
	getInitialState: function() {
		return {
			isHover: false,
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
		var growthW = 0;
		var growthH = 0;
		if (this.state.isHover && !this.props.isDiscreet){
			growthW = 4;
			growthH = 2;
		}

		var thisOpacity = 1;
		if (this.props.isDiscreet){
			thisOpacity = 0.2
		}
		var interfaceStyle = {
			backgroundColor: this.props.color,
			opacity: thisOpacity,
			width: this.props.width + growthW,
			height: this.props.height + growthH,
			left: this.props.left - growthW/2,
			top: this.props.top - growthH/2 
		};

		return (
			<div 
				className="attachmentInterface" 
				style={interfaceStyle} 
				onMouseEnter={this.onMouseEnter} 
				onMouseLeave={this.onMouseLeave} 
				onMouseUp={this.props.onMouseUp.bind(null, this.props.componentID, "interface-1")} 
				onMouseDown={this.props.onMouseDown.bind(null, this.props.componentID, "interface-1")}/>
  		)
	},
});

var Component = React.createClass({
	render: function() {
		var componentStyle = {
			width: this.props.width,
			height: this.props.height,
			top: this.props.thisComponentY,
			left: this.props.thisComponentX
		};

		var componentID = this.props.thisComponentID;

		return (
			<div 
				className="component" 
				onMouseDown={this.props.onMouseDown.bind(null, componentID, null)}  
				style={componentStyle}>
  				<div className="componentName">
  					{this.props.thisModule.name}
  				</div>
  				<div className="componentVersion">
  					{this.props.thisModule.version}
  				</div>	
  			</div>
		);
	}
});

var Wire = React.createClass({
	getInitialState: function() {
		return {
			isHover: false,
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

		var end1Comp = this.props.thisWire["endpoint-1"].component;
		var end1Int = this.props.thisWire["endpoint-1"].ifc;

		var end2Comp = this.props.thisWire["endpoint-2"].component;
		var end2Int = this.props.thisWire["endpoint-2"].ifc;

		var growth = 0;
		if (this.state.isHover){
			growth = 3
		}

		var componentStyle = {
			stroke: this.props.color,
			strokeWidth: this.props.stroke + growth,
		};

		var className = "wire " + this.props.wireClass;

		return (
			<line 
				className = {className} 
				onMouseEnter={this.onMouseEnter} 
				onMouseLeave={this.onMouseLeave} 
				x1 = {this.props.interfaceCoordinates[end1Comp][end1Int].left} 
				y1 = {this.props.interfaceCoordinates[end1Comp][end1Int].top} 
				x2 = {this.props.interfaceCoordinates[end2Comp][end2Int].left} 
				y2 = {this.props.interfaceCoordinates[end2Comp][end2Int].top} 
				style = {componentStyle}/>
		);
	}
});

var WireInProgress = React.createClass({
	render: function() {
		var end1Comp = this.props.thisComponent;
		var end1Int = this.props.thisInterface;

		var ifcWidth = this.props.ifcDims.width;
		var ifcHeight = this.props.ifcDims.height;

		var componentStyle = {
			stroke: this.props.color,
			strokeWidth: this.props.stroke,
		};

		return (
			<line 
				className = "wire" 
				x1 = {this.props.interfaceCoordinates[end1Comp][end1Int].left} 
				y1 = {this.props.interfaceCoordinates[end1Comp][end1Int].top} 
				x2 = {this.props.thisAbsX}
				y2 = {this.props.thisAbsY}
				style = {componentStyle}/>
		);
	}
});

var Interface = React.createClass({
	getInitialState: function() {
		return {
			isHover: false,
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
		var growthW = 0;
		var growthH = 0;
		if (this.state.isHover && !this.props.isDiscreet){
			growthW = 5;
			growthH = 9;
		}

		var thisOpacity = 1;
		if (this.props.isDiscreet){
			thisOpacity = 0.2
		}
		var interfaceStyle = {
			backgroundColor: this.props.color,
			opacity: thisOpacity,
			width: this.props.width + growthW,
			height: this.props.height + growthH,
			left: this.props.left - growthW/2,
			top: this.props.top - growthH/2 
		};

		return (
			<div 
				className="interface" 
				style={interfaceStyle} 
				onMouseEnter={this.onMouseEnter} 
				onMouseLeave={this.onMouseLeave} 
				onMouseUp={this.props.onMouseUp.bind(null, this.props.componentID, this.props.interfaceID)} 
				onMouseDown={this.props.onMouseDown.bind(null, this.props.componentID, this.props.interfaceID)}/>
  		)
	},
});