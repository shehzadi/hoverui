var Workspace = React.createClass({

	getInitialState: function() {
		return {
			dragComponentID: null,
			interfaceIDObject: null,
			interfaceGroupID: null,
			componentID: null,
			mouseDown: false,
			startFromExistingWire: false,
			dragging: false,
			workspaceOriginX: 0,
			workspaceOriginY: 0,
			startX: 0,
			startY: 0,
			cursorX: 0,
			cursorY: 0,
			isWireInProgress: false
		};
	},

  	getDefaultProps: function() {
    	return {
    		component: {
    			width: 135,
    			height: 72
    		},
    		ifc: {
    			width: 20,
    			height: 1,
    			margin: 8
    		},
    		wire: {
    			width: 2
    		},
    		hostInterface: {
    			width: 90,
    			height: 44
    		},
    		attachmentInterface: {
    			width: 26,
    			height: 1,
    			apex: 7
    		}	
    	};
	},


	onMouseDown: function(componentID, interfaceGroupID, interfaceIDObject) {			
		if (event.button == 0){	
			event.stopPropagation();
			this.addDocumentEvents();

			var workspaceBox = React.findDOMNode(this).getBoundingClientRect();
			var workspaceOriginX = workspaceBox.left;
			var workspaceOriginY = workspaceBox.top;
			var startFromExistingWire = false;

			if (interfaceGroupID){ //mouse down on interface
				
				var wiresObject = this.props.selectedProject.topology.wires;

				if (interfaceIDObject){ //mouse down on component interface

					var refInterfaceID = Object.keys(interfaceIDObject)[0];
					var thisRefEndpoint = {
						"component": componentID,
						"ifc": refInterfaceID
					};

					this.thisWireInProgressN = Object.keys(interfaceIDObject).length;
					this.thisWireInProgressProtocol = this.getProtocol(componentID, refInterfaceID);
					this.thisWireInProgressStartMode = this.getMode(componentID, refInterfaceID);

					if (isExistingWire(thisRefEndpoint, wiresObject)) {// interface with existing wire
						//console.log ("Existing Wire");
						startFromExistingWire = thisRefEndpoint
					}
				}
				else {//mouse down on attachment interface
					var thisRefEndpoint = {
						"component": componentID,
						"ifc": "interface-1"
					};

					this.thisWireInProgressN = 1;
					this.thisWireInProgressProtocol = this.props.selectedProject.topology.host_interfaces[componentID].protocol;
					this.thisWireInProgressStartMode = this.props.selectedProject.topology.host_interfaces[componentID].mode;

					if (isExistingWire(thisRefEndpoint, wiresObject)) {// interface with existing wire
						//console.log ("Existing Wire");
						startFromExistingWire = thisRefEndpoint
					}
				}						
			}

			else {
				interfaceIDObject = null
			}
    		this.setState({
    			mouseDown: true,
    			startFromExistingWire: startFromExistingWire,
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

	getProtocol: function(componentID, interfaceID) {
		//console.log(interfaceID);
		var thisProtocol = "";
		if (componentID.indexOf('host') == 0){ //is an attachment wire
			thisProtocol = this.props.selectedProject.topology.host_interfaces[componentID].protocol
		}
		else {
			var thisRefModule = this.props.selectedProject.topology.components[componentID];
			thisProtocol = this.props.modules[thisRefModule].interfaces[interfaceID].protocol;
		}
		return thisProtocol
	},

	getMode: function(componentID, interfaceID) {
		var thisMode = "";

		if (componentID.indexOf('host') == 0){ //is an attachment wire
			thisMode = this.props.selectedProject.topology.host_interfaces[componentID].mode
		}

		else {
			var thisRefModule = this.props.selectedProject.topology.components[componentID];
			thisMode = this.props.modules[thisRefModule].interfaces[interfaceID].mode;
		}
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

			if (this.state.interfaceGroupID){ //dragging from interface
				
			
				if (this.state.startFromExistingWire){ //drag starts from existing wire so update

					var thisComponentID = this.state.componentID;
					var thisInterfaceGroupID = this.state.interfaceGroupID;
					var selectedProject = this.props.selectedProject;

					var otherEnd = getOtherWireGroupEndpoint(thisComponentID, thisInterfaceGroupID, selectedProject);
		

					var otherEndRefInterface;
					if (otherEnd.component.indexOf('host') == 0){ //is an attachment wire
						otherEndRefInterface = "interface-1"
					}
					else {
						otherEndRefInterface = Object.keys(selectedProject.view[otherEnd.component].groups[otherEnd.interfaceGroup])[0];
					}

					var interfaceIDObject;
					if (otherEnd.component.indexOf('host') == 0){ //is an attachment wire
						interfaceIDObject = null
					}
					else {
						interfaceIDObject = selectedProject.view[otherEnd.component].groups[otherEnd.interfaceGroup]
					}

					this.setState({
						componentID: otherEnd.component,
						interfaceGroupID: otherEnd.interfaceGroup,
						interfaceIDObject: interfaceIDObject
					});

					this.thisWireInProgressStartMode = this.getMode(otherEnd.component, otherEndRefInterface);

				}

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

	onInterfaceMouseUp: function(componentID, interfaceGroupID, isInvalid) {
		event.stopPropagation();

		// figure if dropping on original interface
		var originalInterfaceID = this.state.startFromExistingWire.ifc;
		var selectedProjectView = this.props.selectedProject.view;
		var originalInterfaceGroupID = convertToGroup(componentID, originalInterfaceID, selectedProjectView);

		var originalEndpoint = {
			component: this.state.startFromExistingWire.component,
			ifcGroup: originalInterfaceGroupID
		};
		var mouseUpEndpoint = {
			component: componentID,
			ifcGroup: interfaceGroupID
		};
		
		if (_.isEqual(originalEndpoint, mouseUpEndpoint)){
			this.setState({
				startFromExistingWire: false
			});	
		}

		else if (!isInvalid && this.state.isWireInProgress) {
			this.props.handleWireDrop(componentID, interfaceGroupID, this.state.componentID, this.state.interfaceGroupID);
		};		
	},

	onMouseUp: function(event) {

		var finalX = event.pageX - this.state.workspaceOriginX;
		var finalY = event.pageY - this.state.workspaceOriginY;
		var deltaX = finalX - this.state.startX;
		var deltaY = finalY - this.state.startY;

		this.removeDocumentEvents();

		if (this.state.dragging == true){
			if (this.state.dragComponentID){ //dropping component
				this.props.handleComponentDrop(this.state.dragComponentID, deltaX, deltaY);
			}

			if (this.state.startFromExistingWire){ //dropping an existing wire (not on original interface)
				this.props.deleteWires(this.state.startFromExistingWire)
			}

			this.setState({
				dragging: false,
				startFromExistingWire: false,
				isWireInProgress: false,
				dragComponentID: null
			});				
		};

		this.setState({
    		mouseDown: false,
    		componentID: null,
    		interfaceGroupID: null,
    		interfaceIDObject: null
    	});		
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
			var hostInterfacesObject = {};
			if (selectedProjectObject.topology){
				componentsObject = selectedProjectObject.topology.components;
    			wiresObject = selectedProjectObject.topology.wires;
    			//console.log(wiresObject);
    			if (selectedProjectObject.topology.host_interfaces){
    				hostInterfacesObject = selectedProjectObject.topology.host_interfaces;
    			}
    		}
		}

		this.isPendingDeletion = false;

		this.componentData = {};

		var components = [];
		for (var componentID in componentsObject) {

			this.componentData[componentID] = {};

			var componentModuleID = componentsObject[componentID];
			var componentModuleObject = this.props.modules[componentModuleID];

			var componentViewData = selectedProjectObject.view[componentID];

			var componentX = componentViewData.x;
			var componentY = componentViewData.y;

			if (componentID == this.state.dragComponentID){ //component is being dragged
				componentX = componentX + this.state.cursorX - this.state.startX;
				componentY = componentY + this.state.cursorY - this.state.startY;
			}

			
			if (componentX <= 0 || componentY <= headerHeight) { //component is outside of canvas, e.g. during drag operation
				this.isPendingDeletion = componentID
			}

			this.componentData[componentID] = {
				left: componentX,
				top: componentY
			};
			
  			components.push(
  				<Component
					key = {componentID} 
					isPendingDeletion = {this.isPendingDeletion} 
					onMouseDown = {this.onMouseDown} 
					width = {this.props.component.width} 
					height = {this.props.component.height} 
					thisModule = {componentModuleObject} 
					thisComponentX = {componentX} 
					thisComponentY = {componentY} 
					thisComponentID = {componentID}/>
  			);
		};


		var hostInterfacesArray = [];
		var hostPorts = [];
		for (var hostInterface in hostInterfacesObject) {
			var thisProtocol = hostInterfacesObject[hostInterface].protocol;
			var thisMode = hostInterfacesObject[hostInterface].mode;
			var thisViewData = selectedProjectObject.view[hostInterface];

			var hostInterfaceX = thisViewData.x;
			var hostInterfaceY = thisViewData.y;

			if (hostInterface == this.state.dragComponentID){
				hostInterfaceX = hostInterfaceX + this.state.cursorX - this.state.startX;
				hostInterfaceY = hostInterfaceY + this.state.cursorY - this.state.startY;
				if (hostInterfaceX <= 0){hostInterfaceX = 0}
				if (hostInterfaceY <= headerHeight + 1){hostInterfaceY = headerHeight + 1}
			};



			hostInterfacesArray.push(
				<HostInterface
					key = {hostInterface} 
					protocol = {thisProtocol} 
					mode = {thisMode} 
					onMouseDown = {this.onMouseDown} 
					onMouseUp = {this.onInterfaceMouseUp} 
					width = {this.props.hostInterface.width} 
					height = {this.props.hostInterface.height} 		
					posX = {hostInterfaceX} 
					posY = {hostInterfaceY} 
					ifcWidth = {this.props.attachmentInterface.width} 
					ifcHeight = {this.props.attachmentInterface.height} 
					attachmentID = {hostInterface}/>
			);

			var ifcX = hostInterfaceX + (this.props.hostInterface.width - this.props.attachmentInterface.width) / 2;
			var ifcY = hostInterfaceY + this.props.hostInterface.height - (this.props.attachmentInterface.height / 2) - 1;

			this.componentData[hostInterface] = {};
			this.componentData[hostInterface]["interfaceGroups"] = {};
			this.componentData[hostInterface].interfaceGroups = {
				"interface-1": {
					top: ifcY + (this.props.attachmentInterface.height / 2),
					left: ifcX +(this.props.attachmentInterface.width / 2)
				}
			};

			var isInvalid = false;
			var isStartOfNewWire = false;
			if (this.state.isWireInProgress){
				isInvalid = true;
				if ((thisMode != this.thisWireInProgressStartMode || thisMode == "bidirectional")
						&& (thisProtocol == this.thisWireInProgressProtocol)
						&& (this.thisWireInProgressN == 1)) {
					isInvalid = false;
				}






				var thisRefEndpoint = {
					"component": hostInterface,
					"ifc": "interface-1"
				};

				if (isExistingWire(thisRefEndpoint, wiresObject)){
					isInvalid = true;
				}





				if (hostInterface == this.state.componentID) { //source interface
					isInvalid = true;
					isStartOfNewWire = true;
				}
				else if (_.isEqual(this.state.startFromExistingWire, thisRefEndpoint)){
					isInvalid = false;
				}
			}

			var thisFillColor = getHSL(this.props.protocols[thisProtocol].hue);
			var thisBorderColor = getHSL(this.props.protocols[thisProtocol].hue, true);

			hostPorts.push(
				<HostPort 
					key = {hostInterface + "interface-1"} 
					isInvalid = {isInvalid} 
					isStartOfNewWire = {isStartOfNewWire} 
					mode = {thisMode} 
					onMouseDown = {this.onMouseDown} 
					onMouseUp = {this.onInterfaceMouseUp} 
					color = {thisFillColor} 
					border = {thisBorderColor} 
					width = {this.props.attachmentInterface.width} 
					height = {this.props.attachmentInterface.height} 
					left = {ifcX} 
					top = {ifcY} 
					apex = {this.props.attachmentInterface.apex} 
					interfaceID = "interface-1" 
					componentID = {hostInterface}/>				
			);

		};









		//interfaces
		var ifcs = [];
		for (var componentID in componentsObject) {
  			var componentModuleID = componentsObject[componentID];
			var componentModuleObject = this.props.modules[componentModuleID];

			var componentViewData = selectedProjectObject.view[componentID];
  			
	  		var interfacesObject = componentModuleObject.interfaces;
	  		var interfaceGroups = componentViewData.groups;
	  		var nInterfaceGroups = Object.keys(interfaceGroups).length;
	  		this.componentData[componentID]["interfaceGroups"] = {};

	  		var thisComponentX = this.componentData[componentID].left;
	  		var thisComponentY = this.componentData[componentID].top;

			//loop through internal interface groups and get coordinates of other end components

			var nRight = 0; 
			var nLeft = 0;
			var nTop = 0;
			var nBottom = nInterfaceGroups;
			
			for (var groupID in interfaceGroups) {
				var otherEndOfWire = getOtherWireGroupEndpoint(componentID, groupID, selectedProjectObject);
				var vectorToOtherEndComponent = null;
				var interfaceSide = null;

				if (otherEndOfWire){
					var verticalDist = this.componentData[otherEndOfWire.component].top - this.componentData[componentID].top;
					var horizontalDist = this.componentData[otherEndOfWire.component].left - this.componentData[componentID].left;

					vectorToOtherEndComponent = {
						x: horizontalDist,
						y: verticalDist
					}

					var refMultiplier = this.props.component.height / this.props.component.width;

					if ((vectorToOtherEndComponent.x * refMultiplier) <= vectorToOtherEndComponent.y){
						if ((vectorToOtherEndComponent.x * -refMultiplier) < vectorToOtherEndComponent.y){
							interfaceSide = "bottom";
						}
						else {
							interfaceSide = "left";
							nLeft += 1;
							nBottom -= 1
						}
					}

					else {
						if ((vectorToOtherEndComponent.x * -refMultiplier) > vectorToOtherEndComponent.y){
							interfaceSide = "top";
							nTop += 1;
							nBottom -= 1
						}
						else {
							interfaceSide = "right";
							nRight += 1;
							nBottom -= 1
						}
					}
				}
				else {
					interfaceSide = "bottom"
				}

				this.componentData[componentID]["interfaceGroups"][groupID] = {
					face: interfaceSide,
					top: null,
					left: null,
					wireTo: otherEndOfWire,
					vector: vectorToOtherEndComponent
				};
			};


			var groupIndex = 0;
			var rightIndex = 0; 
			var leftIndex = 0;
			var topIndex = 0;
			var bottomIndex = 0;
			for (var group in interfaceGroups) {
				var thisGroupID = group;
			    var thisInterfaceGroup = interfaceGroups[thisGroupID];

			    //get number of interfaces in group
				var nInterfacesInGroup = Object.keys(thisInterfaceGroup).length;

				//get protocol and mode
				var referenceInterface = Object.keys(thisInterfaceGroup)[0];
				var interfaceGroupProtocol = this.getProtocol(componentID, referenceInterface);
				var interfaceGroupMode = interfacesObject[referenceInterface].mode;

				//get face
				var thisFace = this.componentData[componentID]["interfaceGroups"][group].face;

				//calculate location
				console.log(thisFace);
				if (thisFace == "top"){ //include
					var leftDatum = (0.5 * this.props.component.width) - (0.5 * (nTop - 1) * (this.props.ifc.width + this.props.ifc.margin));
					var thisLeft = thisComponentX + leftDatum + (topIndex * (this.props.ifc.width + this.props.ifc.margin));
					var thisTop = thisComponentY ;
					topIndex += 1
				}
				if (thisFace == "right"){ //include
					var topDatum = (0.5 * this.props.component.height) - (0.5 * (nRight - 1) * (this.props.ifc.width + this.props.ifc.margin));
					var thisTop = thisComponentY + topDatum + (rightIndex * (this.props.ifc.width + this.props.ifc.margin));
					var thisLeft = thisComponentX + this.props.component.width - (this.props.ifc.height / 2) + 1;
					rightIndex += 1
				}
				if (thisFace == "bottom"){ //include
					//console.log(bottomIndex);
					var leftDatum = (0.5 * this.props.component.width) - (0.5 * (nBottom - 1) * (this.props.ifc.width + this.props.ifc.margin));
					var thisLeft = thisComponentX + leftDatum + (bottomIndex * (this.props.ifc.width + this.props.ifc.margin));
					var thisTop = thisComponentY + this.props.component.height;
					bottomIndex += 1
				}
				if (thisFace == "left"){ //include
					var topDatum = (0.5 * this.props.component.height) - (0.5 * (nLeft - 1) * (this.props.ifc.width + this.props.ifc.margin));
					var thisTop = thisComponentY + topDatum + (leftIndex * (this.props.ifc.width + this.props.ifc.margin));
					var thisLeft = thisComponentX - (this.props.ifc.height / 2) + 1;
					leftIndex += 1
				}

				
				

				//calculate state etc.
				var isInvalid = false;
				var isStartOfNewWire = false;

				if (this.state.isWireInProgress){ //test for mode, protocol and number of interfaces	
					isInvalid = true;

					if ((interfaceGroupMode != this.thisWireInProgressStartMode || interfaceGroupMode == "bidirectional")
						&& (interfaceGroupProtocol == this.thisWireInProgressProtocol)
						&& (this.thisWireInProgressN == nInterfacesInGroup)) {
						isInvalid = false;
					}

					if (componentID == this.state.componentID) { //other interfaces on same component
						isInvalid = true;
					}

					// test for existing wire
					var thisRefEndpoint = {
						"component": componentID,
						"ifc": referenceInterface
					};

					if (isExistingWire(thisRefEndpoint, wiresObject)){
						isInvalid = true;
					}

					//test for self
					if (componentID == this.state.componentID && thisGroupID == this.state.interfaceGroupID) { //source interface
						isInvalid = true;
						isStartOfNewWire = true
					}

					else if (_.isEqual(this.state.startFromExistingWire, thisRefEndpoint)){
						isInvalid = false;
					}
				}

				this.componentData[componentID]["interfaceGroups"][thisGroupID] = {
					face: this.componentData[componentID]["interfaceGroups"][thisGroupID].face,
					top: thisTop,
					left: thisLeft,
					wireTo: this.componentData[componentID]["interfaceGroups"][thisGroupID].wireTo,
					vector: this.componentData[componentID]["interfaceGroups"][thisGroupID].vector
				};

				var thisFillColor = getHSL(this.props.protocols[interfaceGroupProtocol].hue);
				var thisBorderColor = getHSL(this.props.protocols[interfaceGroupProtocol].hue, true);

				var thisKey = "" + componentID + thisGroupID;

				ifcs.push(
					<InterfaceGroup 
						isInvalid = {isInvalid} 
						isStartOfNewWire = {isStartOfNewWire} 
						isPendingDeletion = {this.isPendingDeletion} 
						key = {thisKey} 
						onMouseDown = {this.onMouseDown} 
						onMouseUp = {this.onInterfaceMouseUp} 
						interfaceMode = {interfaceGroupMode} 
						face = {thisFace} 
						color = {thisFillColor} 
						border = {thisBorderColor} 
						width = {this.props.ifc.width} 
						height = {this.props.ifc.height} 
						componentData = {this.componentData} 
						componentHeight = {this.props.component.height} 
						componentWidth = {this.props.component.width} 
						interfaceGroupID = {thisGroupID} 
						interfaceIDObject = {thisInterfaceGroup} 
						componentID = {componentID}/>				
				);

				groupIndex += 1;
			};
		};













		


		var wires = [];
		var localGroupArray = [];

		this.existingWireEndpoint = false;
		if (this.state.startFromExistingWire && this.state.dragging){
			this.existingWireEndpoint = {
				component: this.state.startFromExistingWire.component,
				interfaceGroup: convertToGroup(this.state.startFromExistingWire.component, this.state.startFromExistingWire.ifc, selectedProjectObject.view)
			};
		};

		for (var wire in wiresObject) {
			var thisWire = wiresObject[wire];
			//console.log(wiresObject);
			var thisProtocol = this.getProtocol(thisWire["endpoint-1"].component, thisWire["endpoint-1"].ifc);
			var wireClass = "";
			if (this.state.isWireInProgress){
				wireClass = "discreet"
			};

			var endpoints = {
				"endpoint-1": {
					"component": thisWire["endpoint-1"].component,
					"interfaceGroup": convertToGroup(thisWire["endpoint-1"].component, thisWire["endpoint-1"].ifc, selectedProjectObject.view)
				},
				"endpoint-2": {
					"component": thisWire["endpoint-2"].component,
					"interfaceGroup": convertToGroup(thisWire["endpoint-2"].component, thisWire["endpoint-2"].ifc, selectedProjectObject.view)
				}
			};

    		var isWireExists = false;
    		_.forEach(localGroupArray, function(thisEndpoint) {
    			if (_.isEqual(thisEndpoint, endpoints["endpoint-1"])){
    				isWireExists = true;
    			}
    		});

    		thisStrokeColor = getHSL(this.props.protocols[thisProtocol].hue, true);

			if (!isWireExists) {
				localGroupArray.push(endpoints["endpoint-1"]);
				localGroupArray.push(endpoints["endpoint-2"]);
				//console.log(endpoints);
				wires.push(
					<WireGroup
						key = {wire} 
						isPendingDeletion = {this.isPendingDeletion} 
						wireClass = {wireClass} 
						color = {thisStrokeColor} 
						stroke = {this.props.wire.width} 
						componentData = {this.componentData} 
						endpoints = {endpoints} 
						existingWireEndpoint = {this.existingWireEndpoint}/>
				);
			}
		};

		if (this.state.interfaceGroupID && this.state.dragging) {
			if (this.state.interfaceIDObject){ // component interface
				var referenceInterface = Object.keys(this.state.interfaceIDObject)[0];
				var thisProtocol = this.getProtocol(this.state.componentID, referenceInterface);
			}
			else { // host interface
				var thisProtocol = this.props.selectedProject.topology.host_interfaces[this.state.componentID].protocol
			}

			var thisStrokeColor = getHSL(this.props.protocols[thisProtocol].hue, true);

			var wireInProgress = <WireInProgress
				color = {thisStrokeColor} 
				thisInterfaceGroup = {this.state.interfaceGroupID} 
				thisComponent = {this.state.componentID} 
				componentData = {this.componentData} 
				thisAbsX = {this.state.cursorX} 
				thisAbsY = {this.state.cursorY} 
				stroke = {this.props.wire.width + 1} 
				ifcDims = {this.props.ifc}/>
		}

		//figure out size of svg container
		this.svgExtents = defineSvgSize(this.componentData, this.state.cursorX, this.state.cursorY)

		return (
			<div className="ui-module workspace pattern">		
				<svg className="wireContainer" width={this.svgExtents.width} height={this.svgExtents.height}>
					{wires}
					{wireInProgress}
				</svg>	
				{components}
				{hostInterfacesArray}
						
				<svg className="ifcContainer" width={this.svgExtents.width} height={this.svgExtents.height}>
					{ifcs}
					{hostPorts}
				</svg>		
			</div>
		);
	},
});

var HostInterface = React.createClass({
	onMouseDown: function() {
		this.props.onMouseDown(this.props.attachmentID)
	},

	render: function() {

		var containerStyle = {
			width: this.props.width,
			height: this.props.height,
			top: this.props.posY,
			left: this.props.posX,
		};

		return (
			<div 
				className="hostInterface" 
				style={containerStyle}
				onMouseDown={this.onMouseDown}>
				Host Interface
  			</div>
		);
	}
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

		var classString = "component";
		if (this.props.isPendingDeletion == this.props.thisComponentID){
			classString += " pendingDeletion"
		}

		return (
			<div 
				className = {classString} 
				onMouseDown = {this.handleMouseDown}  
				style = {componentStyle}>
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


		var end1Comp = this.props.thisComponent;
		var end1Int = this.props.thisInterfaceGroup;

		var ifcWidth = this.props.ifcDims.width;
		var ifcHeight = this.props.ifcDims.height;

		var componentStyle = {
			stroke: this.props.color,
			strokeWidth: this.props.stroke,
		};


		//console.log (this.props.componentData);
		//console.log (end1Comp);
		//console.log (end1Int);

		return (
			<line 
				className = "wire" 
				x1 = {this.props.componentData[end1Comp].interfaceGroups[end1Int].left} 
				y1 = {this.props.componentData[end1Comp].interfaceGroups[end1Int].top} 
				x2 = {this.props.thisAbsX}
				y2 = {this.props.thisAbsY}
				style = {componentStyle}/>
		);
	}
});

