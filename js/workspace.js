var Workspace = React.createClass({

	getInitialState: function() {
		return {
			dragComponentID: null,
			interfaceIDObject: null,
			interfaceGroupID: null,
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
    			width: 130,
    			height: 65
    		},
    		ifc: {
    			width: 20,
    			height: 1,
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

	onMouseDown: function(componentID, interfaceIDObject, interfaceGroupID) {			
		if (event.button == 0){	
			event.stopPropagation();
			this.addDocumentEvents();

			var workspaceBox = React.findDOMNode(this).getBoundingClientRect();
			var workspaceOriginX = workspaceBox.left;
			var workspaceOriginY = workspaceBox.top;

			//console.log(interfaceIDObject);



			if (interfaceIDObject){ //mouse down on interface
				var refInterfaceID = Object.keys(interfaceIDObject)[0];
				this.thisWireInProgressProtocol = this.getProtocol(componentID, refInterfaceID);
				this.thisWireInProgressStartMode = this.getMode(componentID, refInterfaceID);
				this.thisWireInProgressN = Object.keys(interfaceIDObject).length;
			}

			else {
				interfaceIDObject = null
			}
    		
    		this.setState({
    			mouseDown: true,
    			componentID: componentID,
    			interfaceIDObject: interfaceIDObject,
    			interfaceGroupID: interfaceGroupID,
    			workspaceOriginX: workspaceOriginX,
    			workspaceOriginY: workspaceOriginY,
    			startX: event.pageX - workspaceOriginX,
    			startY: event.pageY - workspaceOriginY
    		});
		}
	},

	onInterfaceMouseUp: function(componentID, interfaceGroupID, isDiscreet) {
		event.stopPropagation();
		//var sourceProtocol = this.getProtocol(this.state.componentID, Object.keys(this.state.interfaceIDObject)[0]);
		//var dropProtocol = this.getProtocol(componentID, Object.keys(interfaceIDObject)[0]);
		if (!isDiscreet) {
			console.log("Create new wire");
			this.props.handleWireDrop(componentID, interfaceGroupID, this.state.componentID, this.state.interfaceGroupID);
		}		
	},

	getProtocol: function(componentID, interfaceID) {
		var thisProtocol = "";
		if (componentID.indexOf('att') == 0){ //is an attachment wire
			thisProtocol = this.props.selectedProject.topology.attachments[componentID]
		}
		else {
			var thisRefModule = this.props.selectedProject.topology.components[componentID];
			thisProtocol = this.props.modules[thisRefModule].interfaces[interfaceID].protocol;
		}
		return thisProtocol
	},

	getMode: function(componentID, interfaceID) {
		var thisMode = "";
		var thisRefModule = this.props.selectedProject.topology.components[componentID];
		thisMode = this.props.modules[thisRefModule].interfaces[interfaceID].mode;
		return thisMode
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

			if (this.state.interfaceIDObject){ //dragging from interface
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
    			interfaceIDObject: null
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

		this.interfaceGroupCoordinates = {};
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

  			// Interfaces
  			this.interfaceGroupCoordinates[componentID] = {};

	  		var interfacesObject = componentModuleObject.interfaces;
	  		var interfaceGroups = componentViewData.groups;
	  		var nInterfaceGroups = Object.keys(interfaceGroups).length

			//loop through internal interface groups
			var groupIndex = 0;
			for (var group in interfaceGroups) {
				var thisGroupID = group;
			    var thisInterfaceGroup = interfaceGroups[thisGroupID];
				var nInterfacesInGroup = Object.keys(thisInterfaceGroup).length;
				//hello
				var referenceInterface = Object.keys(thisInterfaceGroup)[0];

				var interfaceGroupProtocol = this.getProtocol(componentID, referenceInterface);
				var interfaceGroupMode = interfacesObject[referenceInterface].mode;

				var thisKey = "" + componentID + thisGroupID;

				//console.log ("ref interface key: " + thisKey);

				var leftDatum = (0.5 * this.props.component.width) - (0.5 * ((nInterfaceGroups * (this.props.ifc.width + this.props.ifc.margin)) - this.props.ifc.margin));
				var thisLeft = componentX + leftDatum + ((groupIndex) * (this.props.ifc.width + this.props.ifc.margin));
				var thisTop = componentY + this.props.component.height - (this.props.ifc.height / 2) + 1;

				var isDiscreet = false;
				var isStartOfNewWire = false;

				if (this.state.isWireInProgress){ // test for mode, protocol and number of interfaces	
					if (interfaceGroupMode == this.thisWireInProgressStartMode) { //differing mode
						isDiscreet = true;
					}

					if (interfaceGroupMode == "bidirectional") {
						isDiscreet = false;
					}

					if (interfaceGroupProtocol != this.thisWireInProgressProtocol) { //differing protocols
						isDiscreet = true;
					}

					if (componentID == this.state.componentID) { //other interfaces on self
						isDiscreet = true;
					}

					if (componentID == this.state.componentID && thisGroupID == this.state.interfaceGroupID) { //source interface
						isDiscreet = false;
						isStartOfNewWire = true
					}
				}

				this.interfaceGroupCoordinates[componentID][thisGroupID] = {
					top: thisTop + (this.props.ifc.height / 2),
					left: thisLeft + (this.props.ifc.width / 2)
				};

				ifcs.push(
					<InterfaceGroup 
						isDiscreet = {isDiscreet} 
						isStartOfNewWire = {isStartOfNewWire} 
						key = {thisKey} 
						onMouseDown = {this.onMouseDown} 
						onMouseUp = {this.onInterfaceMouseUp} 
						interfaceMode = {interfaceGroupMode} 
						color = {this.props.protocols[interfaceGroupProtocol].color} 
						width = {this.props.ifc.width} 
						height = {this.props.ifc.height} 
						left = {thisLeft} 
						top = {thisTop} 
						interfaceGroupID = {thisGroupID} 
						interfaceIDObject = {thisInterfaceGroup} 
						componentID = {componentID}/>				
				);

				
				//console.log (this.interfaceGroupCoordinates);

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

				groupIndex += 1;
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

			this.interfaceGroupCoordinates[attachment] = {
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
		var localGroupArray = [];
		for (var wire in wiresObject) {
			var thisWire = wiresObject[wire];
			var thisProtocol = this.getProtocol(thisWire["endpoint-1"].component, thisWire["endpoint-1"].ifc);
			var wireClass = "";
			if (this.state.isWireInProgress){
				wireClass = "discreet"
			};

			var convertToGroup = function(componentID, interfaceID){
				var thisGroupData = selectedProjectObject.view[componentID].groups;
				for (var group in thisGroupData) {
					var interfaceArray = Object.keys(thisGroupData[group]);
					if (interfaceArray.indexOf(interfaceID) > -1){
						return group
					}		
				}		
			};

			var endpoints = {
				"endpoint-1": {
					"component": thisWire["endpoint-1"].component,
					"interfaceGroup": convertToGroup(thisWire["endpoint-1"].component, thisWire["endpoint-1"].ifc)
				},
				"endpoint-2": {
					"component": thisWire["endpoint-2"].component,
					"interfaceGroup": convertToGroup(thisWire["endpoint-2"].component, thisWire["endpoint-2"].ifc)
				}
			};

			console.log(localGroupArray);
			console.log(endpoints["endpoint-1"]);
			console.log(_.includes(localGroupArray, endpoints["endpoint-1"]));
			//hello

			//if (localGroupArray.indexOf(endpoints["endpoint-1"].interfaceGroup) > -1){ //wire already exists
			//	break
			//}

			//if (_.isEqual(thisInterfaceDetails, existingGroupMemberDetails)){
    		//	existingGroup = group;
    		//	break
    		//}

    		var isWireExists = false;
    		_.forEach(localGroupArray, function(thisEndpoint) {
    			if (_.isEqual(thisEndpoint, endpoints["endpoint-1"])){
    				isWireExists = true;
    			}
    		});

			if (!isWireExists) {
				localGroupArray.push(endpoints["endpoint-1"]);
				localGroupArray.push(endpoints["endpoint-2"]);
				wires.push(
					<WireGroup
						key = {wire} 
						wireClass = {wireClass} 
						color = {this.props.protocols[thisProtocol].color} 
						stroke = {this.props.wire.width} 
						interfaceGroupCoordinates = {this.interfaceGroupCoordinates} 
						endpoints = {endpoints}/>
				);
			}

		};

		if (this.state.interfaceIDObject && this.state.dragging) {
			var referenceInterface = Object.keys(this.state.interfaceIDObject)[0];
			var thisProtocol = this.getProtocol(this.state.componentID, referenceInterface);

			var wireInProgress = <WireInProgress
				color = {this.props.protocols[thisProtocol].color} 
				thisInterfaceGroup = {this.state.interfaceGroupID} 
				thisComponent = {this.state.componentID} 
				interfaceGroupCoordinates = {this.interfaceGroupCoordinates} 
				thisAbsX = {this.state.cursorX} 
				thisAbsY = {this.state.cursorY} 
				stroke = {this.props.wire.width} 
				ifcDims = {this.props.ifc}/>
		}

		svgExtents.width += 30;
		svgExtents.height += 30;

		return (
			<div className="ui-module workspace pattern">		
				<svg className="wireContainer ui-module" width={svgExtents.width} height={svgExtents.height}>
					{wires}
					{wireInProgress}
				</svg>
				{components}
				<svg className="ifcContainer ui-module" width={svgExtents.width} height={svgExtents.height}>
					{ifcs}
				</svg>
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
	handleMouseDown: function(){
		this.props.onMouseDown(this.props.thisComponentID)
	},

	render: function() {
		var componentStyle = {
			width: this.props.width,
			height: this.props.height,
			top: this.props.thisComponentY,
			left: this.props.thisComponentX
		};

		return (
			<div 
				className="component" 
				onMouseDown={this.handleMouseDown}  
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

var WireInProgress = React.createClass({
	render: function() {

		//console.log (this.props.interfaceCoordinates);
		var end1Comp = this.props.thisComponent;
		var end1Int = this.props.thisInterfaceGroup;

		var ifcWidth = this.props.ifcDims.width;
		var ifcHeight = this.props.ifcDims.height;

		var componentStyle = {
			stroke: this.props.color,
			strokeWidth: this.props.stroke,
		};

		return (
			<line 
				className = "wire" 
				x1 = {this.props.interfaceGroupCoordinates[end1Comp][end1Int].left} 
				y1 = {this.props.interfaceGroupCoordinates[end1Comp][end1Int].top} 
				x2 = {this.props.thisAbsX}
				y2 = {this.props.thisAbsY}
				style = {componentStyle}/>
		);
	}
});

