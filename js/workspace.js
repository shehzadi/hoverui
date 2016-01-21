var Workspace = React.createClass({

	getInitialState: function() {
		return {
			//dragComponentID: null,
			//interfaceIDObject: null,
			//interfaceGroupID: null,
			//componentID: null,
			mouseDown: false,
			startFromExistingWire: false,
			dragging: false,
			//workspaceOriginX: 0,
			//workspaceOriginY: 0,
			//startX: 0,
			//startY: 0,
			cursorX: 0,
			cursorY: 0,
			isWireInProgress: false,
			isSnapping: false
		};
	},

  	getDefaultProps: function() {
    	return {
    		component: {
    			width: 145,
    			height: 76
    		},
    		ifc: {
    			width: 20,
    			height: 1,
    			margin: 5
    		},
    		wire: {
    			width: 2
    		},
    		hostComponent: {
    			width: 90,
    			height: 44
    		},
    		hostInterface: {
    			width: 26,
    			height: 1,
    			apex: 7
    		}	
    	};
	},


	ifcMouseDown: function(tokenObject) {			
		if (event.button == 0){	
			event.stopPropagation();
			this.addDocumentEvents();

			var workspaceBox = React.findDOMNode(this).getBoundingClientRect();
			this.workspaceOriginX = workspaceBox.left;
			this.workspaceOriginY = workspaceBox.top;
			this.startX = event.pageX - this.workspaceOriginX;
    		this.startY = event.pageY - this.workspaceOriginY;
    		console.log("Mouse down on interface: ", tokenObject);
			
    		this.setState({
    			mouseDown: tokenObject
    		});
		}
	},

	componentMouseDown: function(componentID) {
		if (event.button == 0){	
			event.stopPropagation();
			this.addDocumentEvents();

			var workspaceBox = React.findDOMNode(this).getBoundingClientRect();
			this.workspaceOriginX = workspaceBox.left;
			this.workspaceOriginY = workspaceBox.top;
			this.startX = event.pageX - this.workspaceOriginX;
			this.startY = event.pageY - this.workspaceOriginY;
			var startFromExistingWire = false;

			this.setState({
				mouseDown: componentID
			});
		}
	},

	getProtocol: function(componentID, interfaceID) {
		var thisProtocol = "";
		if (componentID.indexOf('host') == 0){ //is an attachment wire
			thisProtocol = this.props.selectedProject.topology.host_interfaces[componentID].protocol
		}
		else {
			var thisComponent = this.props.selectedProject.topology.components[componentID];
			thisProtocol = thisComponent.interfaces[interfaceID].protocol;
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

	ifcMouseLeave: function(componentID, ifcTokenObject) {
		if (this.state.isWireInProgress){
			this.setState({
				isSnapping: false,
			});
		}
	},

	ifcMouseEnter: function(componentID, ifcTokenObject) {
		if (this.state.isWireInProgress && ifcTokenObject.isInvalid == false){
			var snapObject = {
				component: componentID,
				ifc: ifcTokenObject
			}

			this.setState({
				isSnapping: snapObject,
			});
		}
	},

	onMouseMove: function(event) { //captured on document
		var cursorX = event.pageX - this.workspaceOriginX;
		var cursorY = event.pageY - this.workspaceOriginY;
		var deltaX = cursorX - this.startX;
		var deltaY = cursorY - this.startY;
		var distance = Math.abs(deltaX) + Math.abs(deltaY);

		if (this.state.dragging == false && distance > 4){ //dragging
			this.setState({
				dragging: this.state.mouseDown,
			});

			/*

			if (this.state.interfaceGroupID){ //dragging from interface
						
				if (this.state.startFromExistingWire){ //drag starts from existing wire so update

					var thisComponentID = this.state.componentID;
					var thisInterfaceGroupID = this.state.interfaceGroupID;
					var selectedProject = this.props.selectedProject;

					var otherEnd = getOtherEndOfWire(thisComponentID, thisInterfaceGroupID, selectedProject);
		
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
				//this.setState({
				//	dragComponentID: this.state.componentID
				//});
			}
			*/
		}

		if (this.state.dragging){	
			this.setState({
				cursorX: cursorX,
    			cursorY: cursorY
			});
		}
	},

	ifcMouseUp: function(tokenObject) {
		event.stopPropagation();
		
		if (_.isEqual(this.state.mouseDown, tokenObject)){
			this.setState({
				startFromExistingWire: false
			});	
		}

		else if (!isInvalid && this.state.isWireInProgress) {
			this.props.handleWireDrop(componentID, interfaceGroupID, this.state.componentID, this.state.interfaceGroupID);
		};	

		this.setState({
			isSnapping: false
		});		
	},

	onMouseUp: function(event) {

		var finalX = event.pageX - this.workspaceOriginX;
		var finalY = event.pageY - this.workspaceOriginY;
		var deltaX = finalX - this.startX;
		var deltaY = finalY - this.startY;

		this.removeDocumentEvents();

		if (this.state.dragging){
			if (typeof this.state.dragging == "string"){ //dropping component
				this.props.handleComponentDrop(this.state.dragging, deltaX, deltaY);
			}

			if (this.state.startFromExistingWire){ //dropping an existing wire (not on original interface)
				this.props.deleteWires(this.state.startFromExistingWire)
			}

			this.setState({
				dragging: false,
				startFromExistingWire: false
				//isWireInProgress: false
				//dragComponentID: null
			});				
		};

		this.setState({
    		mouseDown: false
    		//componentID: null,
    		//interfaceGroupID: null,
    		//interfaceIDObject: null
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

	componentWillMount: function() {
		console.log("Will Mount: " , this.props)
  		this.prepData(this.props);
	},

	prepData: function(props) {
		//console.log("Prep props: " , props);
		var selectedProject = props.selectedProject;
		var dependenciesObject = selectedProject.dependencies || {} ;
		var componentsObject = selectedProject.topology.components || {};
		var wiresObject = selectedProject.topology.wires || {};
		var hostComponentsObject = selectedProject.topology.host_interfaces || {};

		this.componentData = {};
		for (var componentID in componentsObject) {
			var thisComponent = componentsObject[componentID];
			var moduleID = thisComponent.module;
			var componentViewData = selectedProject.view[componentID];

			var interfaces = {};

			if (thisComponent.interfaces){
				for (var interfaceID in thisComponent.interfaces) {
					thisInterface = thisComponent.interfaces[interfaceID];
					interfaces[interfaceID] = {
						mode: thisInterface.mode,
						protocol: thisInterface.protocol
					}
				}
			}
			var componentInterfaces = thisComponent.interfaces

			this.componentData[componentID] = {
				left: componentViewData.x, 
				top: componentViewData.y, 
				width: this.props.component.width, 
				height: this.props.component.height, 
				moduleID: moduleID, 
				module: dependenciesObject[moduleID], 
				interfaces: interfaces
			};
		};

		this.hostComponentData = {};
		for (var hostComponentID in hostComponentsObject) {
			var thisHostComponent = hostComponentsObject[hostComponentID];
			var hostComponentViewData = selectedProject.view[hostComponentID];
			this.hostComponentData[hostComponentID] = {
				left: hostComponentViewData.x,
				top: hostComponentViewData.y,
				width: this.props.hostComponent.width, 
				height: this.props.hostComponent.height, 
				mode: thisHostComponent.mode,
				protocol: thisHostComponent.protocol
			};
		};

		//add io capability data
		for (var componentID in this.componentData) {
			var thisComponent = this.componentData[componentID];
			var thisComponentInterfaces = thisComponent.interfaces;
			var moduleInterfaces = thisComponent.module.interfaces;

			var ioCapability = [];

			_.forEach(moduleInterfaces, function(interface){
				var thisCapability = {
					mode: interface.mode,
					protocol: interface.protocol,
					capacity: interface.capacity
				};
				ioCapability.push(thisCapability)
			});

			this.componentData[componentID]["ioCapability"] = ioCapability;	
		};

		//add data from wire data
		for (var wire in wiresObject) {
			var thisWire = wiresObject[wire];
			var endpoint1 = thisWire[0];
			var endpoint2 = thisWire[1];
			console.log(thisWire);
			var that = this;
			_.forEach(thisWire, function(thisEnd, i){
				if (i == 0){
					var otherEnd = thisWire[1]
				}
				else {
					var otherEnd = thisWire[0]
				}

				if (thisEnd.ifc){//thisEnd is component, not host
					var thisComponent = that.componentData[thisEnd.component];
					var writeLocation = thisComponent.interfaces[thisEnd.ifc]
				}
				else {//thisEnd is a host
					var thisComponent = that.hostComponentData[thisEnd.component];
					var writeLocation = thisComponent
				}

				writeLocation["wireTo"] = {
					component: otherEnd.component,
					ifc: otherEnd.ifc || null
				}

				//get vector, face etc.
				if (otherEnd.ifc){//otherEnd is component, not host
					var otherComponent = that.componentData[otherEnd.component];
				}
				else {//otherEnd is a host
					var otherComponent = that.hostComponentData[otherEnd.component];
				}

				var vectorBetweenComponents = getVector(thisComponent, otherComponent);

//hello

				writeLocation["face"] = null
			});
		};


		console.log("Prep props: " , props, this.componentData, this.hostComponentData)
		
	},

	componentWillReceiveProps: function(nextProps) {
		console.log("Will Receive Props: " , nextProps);
  		this.prepData(nextProps)
	},

	render: function() {

		this.isPendingDeletion = false;


		var components = [];
		var ifcs = [];

		for (var componentID in this.componentData) {
			var thisComponent = this.componentData[componentID];

			/////// Components
			if (componentID == this.state.dragging){ //component is being dragged
				thisComponent.left += this.state.cursorX - this.startX;
				thisComponent.top += this.state.cursorY - this.startY;
			}
			
			if (thisComponent.left <= 0 || thisComponent.top <= headerHeight) { //component is outside of canvas, e.g. during drag operation
				this.isPendingDeletion = componentID
			}
			
  			components.push(
  				<Component
					key = {componentID} 
					isPendingDeletion = {this.isPendingDeletion} 
					onMouseDown = {this.componentMouseDown} 
					compDims = {this.props.component} 
					componentData = {thisComponent} 
					componentID = {componentID}/>
  			);

  			/////// Interfaces

		};













		//interfaces
		var ifcs = [];
		for (var componentID in componentsObject) {

			var componentObject = componentsObject[componentID];
			var thisComponentData = this.componentData[componentID];

			var refModuleID = componentObject.module;
			var refModuleObject = dependentModulesObject[refModuleID];

			thisComponentData["faceN"] = {
				top: 0,
				right: 0,
				bottom: refModuleObject.interfaces.length,
				left: 0
			}

			this.componentData[componentID]["interfaceTokens"] = _.cloneDeep(refModuleObject.interfaces);//add unwired tokens

			var thisTokenArray = thisComponentData["interfaceTokens"];

			if (componentObject.interfaces){ //component has wired interfaces so add these to the token array
				for (var interfaceID in componentObject.interfaces) {
					//find wire ID
					var thisEndpoint = {
						"component": componentID,
						"ifc": interfaceID
					}
					var wireID = null;
					var otherEnd = null;
					
					var interfaceSide = null;
					for (var thisWire in selectedProjectObject.topology.wires) {
						var endpoint1 = selectedProjectObject.topology.wires[thisWire][0];
						var endpoint2 = selectedProjectObject.topology.wires[thisWire][1];

						if (_.isEqual(endpoint1, thisEndpoint)) {
							wireID = thisWire;
							otherEnd = endpoint2
						}
						if (_.isEqual(endpoint2, thisEndpoint)) {
							wireID = thisWire;
							otherEnd = endpoint1
						}
					}

					if (otherEnd){
						//console.log(otherEnd);
						if (otherEnd.component.indexOf('host') == 0){ //is a host interface
							var vectorToOtherEndComponent = {
								x: (this.componentData[otherEnd.component].left + (0.5 * this.props.hostComponent.width)) - (this.componentData[componentID].left + (0.5*this.props.component.width)),
								y: (this.componentData[otherEnd.component].top + (0.5* this.props.hostComponent.height)) - (this.componentData[componentID].top + (0.5*this.props.component.height))
							}
						}
						else {
							var vectorToOtherEndComponent = {
								x: this.componentData[otherEnd.component].left - this.componentData[componentID].left,
								y: this.componentData[otherEnd.component].top - this.componentData[componentID].top
							}
						}
						
						var refVector = this.props.component.height / this.props.component.width;

						interfaceSide = getFaceString(vectorToOtherEndComponent, refVector);

						if (interfaceSide == "top"){thisComponentData.faceN.top += 1}
						if (interfaceSide == "right"){thisComponentData.faceN.right += 1}
						if (interfaceSide == "bottom"){thisComponentData.faceN.bottom += 1}
						if (interfaceSide == "left"){thisComponentData.faceN.left += 1}
					}

					var interfaceToken = {
						"id": interfaceID,
						"mode": componentObject.interfaces[interfaceID].mode,
						"protocol": componentObject.interfaces[interfaceID].protocol,
						"wire": wireID,
						"otherEnd": otherEnd,
						"face": interfaceSide,
					}
					thisTokenArray.push(interfaceToken);
				}	
			}

			var that = this;
			_.forEach(thisTokenArray, function(thisToken) {
				thisToken["componentID"] = componentID;
				//calculate start-of-new-wire & validity
				var isInvalid = false;
				var isStartOfNewWire = false;

				if (that.state.isWireInProgress){ //test for mode, protocol and number of interfaces	
					isInvalid = true;

					if ((thisToken.mode != this.thisWireInProgressStartMode || thisToken.mode == "bi")
						&& (thisToken.protocol == this.thisWireInProgressProtocol)) {
						isInvalid = false;
					}

					if (componentID == this.state.componentID && thisGroupID == this.state.interfaceGroupID) { //source interface
						isInvalid = true;
						isStartOfNewWire = true
					}

					else if (_.isEqual(this.state.startFromExistingWire, thisRefEndpoint)){
						isInvalid = false;
					}
				}

				thisToken["isInvalid"] = isInvalid;
				thisToken["isStartOfNewWire"] = isStartOfNewWire;

				var updatedFace = null;
				if (that.state.isWireInProgress){ 				
					if (!this.componentData[componentID]["interfaceTokens"][groupID].isInvalid){ //this is a valid interface
						var vectorToOtherEndComponent = null;
		
						vectorToOtherEndComponent = {
							x: this.componentData[this.state.componentID].left - this.componentData[componentID].left,
							y: this.componentData[this.state.componentID].top - this.componentData[componentID].top
						}
						var refVector = this.props.component.height / this.props.component.width;
						updatedFace = getFaceString(vectorToOtherEndComponent, refVector);
						this.componentData[componentID]["interfaceTokens"][groupID].face = updatedFace;
					}

					else if (this.state.componentID == componentID && this.state.interfaceGroupID == groupID){
						var vectorToCursor = null;
		
						vectorToCursor = {
							x: this.state.cursorX - (this.props.component.width/2) - this.componentData[componentID].left,
							y: this.state.cursorY - (this.props.component.height/2) - this.componentData[componentID].top
						}
						var refVector = this.props.component.height / this.props.component.width;
						updatedFace = getFaceString(vectorToCursor, refVector);
						this.componentData[componentID]["interfaceTokens"][groupID].face = updatedFace
					}
				}		
			});


			//Figure out token positions and define component
			var rightIndex = 0; 
			var leftIndex = 0;
			var topIndex = 0;
			var bottomIndex = 0;
			var that = this;
			_.forEach(thisTokenArray, function(thisToken, i) {
			
				if (thisToken.face == "top"){
					var leftDatum = (0.5 * that.props.component.width) - (0.5 * (thisComponentData.faceN.top - 1) * (that.props.ifc.width + that.props.ifc.margin));
					var thisLeft = thisComponentData.left + leftDatum + (topIndex * (that.props.ifc.width + that.props.ifc.margin));
					var thisTop = thisComponentData.top ;
					topIndex += 1
				}
				if (thisToken.face == "right"){
					var topDatum = (0.5 * that.props.component.height) - (0.5 * (thisComponentData.faceN.right - 1) * (that.props.ifc.width + that.props.ifc.margin));
					var thisTop = thisComponentData.top + topDatum + (rightIndex * (that.props.ifc.width + that.props.ifc.margin));
					var thisLeft = thisComponentData.left + that.props.component.width - (that.props.ifc.height / 2) + 1;
					rightIndex += 1
				}
				if (thisToken.face == "bottom" || !thisToken.face){
					var leftDatum = (0.5 * that.props.component.width) - (0.5 * (thisComponentData.faceN.bottom - 1) * (that.props.ifc.width + that.props.ifc.margin));
					var thisLeft = thisComponentData.left + leftDatum + (bottomIndex * (that.props.ifc.width + that.props.ifc.margin));
					var thisTop = thisComponentData.top + that.props.component.height;
					bottomIndex += 1
				}
				if (thisToken.face == "left"){
					var topDatum = (0.5 * that.props.component.height) - (0.5 * (thisComponentData.faceN.left - 1) * (that.props.ifc.width + that.props.ifc.margin));
					var thisTop = thisComponentData.top + topDatum + (leftIndex * (that.props.ifc.width + that.props.ifc.margin));
					var thisLeft = thisComponentData.left - (that.props.ifc.height / 2) + 1;
					leftIndex += 1
				}


				thisToken["top"] = thisTop;
				thisToken["left"] = thisLeft;

				// update used value
				if (thisToken.mode == interfaceToken.mode && thisToken.protocol == interfaceToken.protocol){
					if (thisToken.used){
						thisToken.used += 1
					}
					else {
						thisToken["used"] = 1
					}
				}

				var thisKey = "" + componentID + i;
				ifcs.push(
					<InterfaceToken 
						tokenObject = {thisToken} 
						key = {thisKey} 
						isPendingDeletion = {that.isPendingDeletion} 
						onMouseEnter = {that.ifcMouseEnter} 
						onMouseLeave = {that.ifcMouseLeave} 
						onMouseDown = {that.ifcMouseDown} 
						onMouseUp = {that.ifcMouseUp} 
						protocols = {that.props.protocols} 
						//componentID = {componentID} 
						ifcDims = {that.props.ifc}/>			
				);
			});
		};































		var hostComponentsArray = [];
		var hostIfcArray = [];
		for (var hostComponentID in this.hostComponentData) {
			var thisHostComponent = this.hostComponentData[hostComponentID];

			var hostCompX = thisHostComponent.left;
			var hostCompY = thisHostComponent.top;

			if (hostComponentID == this.state.dragging){
				hostCompX += this.state.cursorX - this.startX;
				hostCompY += this.state.cursorY - this.startY;
				if (hostCompX <= 0){hostCompX = 0}
				if (hostCompY <= headerHeight + 1){hostCompY = headerHeight + 1}
			};

			hostComponentsArray.push(
				<HostComponent
					key = {hostComponentID} 
					onMouseDown = {this.componentMouseDown} 
					onMouseUp = {this.ifcMouseUp} 
					hostCompDims = {this.props.hostComponent} 
					hostComponentData = {thisHostComponent} 
					hostComponentID = {hostComponentID}/>
			);

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
					"component": hostComponent,
					"ifc": hostComponent
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

			// host interface ports
			// figure out component at other end, vector, face etc.
			var otherEndOfWire = getOtherEndOfWire(hostComponent, null, selectedProjectObject);
			var interfaceSide = "default";
			if (otherEndOfWire){
				
				var vectorToOtherEndComponent = {
					x: (this.componentData[otherEndOfWire.component].left + (0.5 * this.props.component.width)) - (this.componentData[hostComponent].left + (0.5*this.props.hostComponent.width)),
					y: (this.componentData[otherEndOfWire.component].top + (0.5* this.props.component.height)) - (this.componentData[hostComponent].top + (0.5*this.props.hostComponent.height))
				}
				
				var refVector = this.props.component.height / this.props.component.width;
				interfaceSide = getFaceString(vectorToOtherEndComponent, refVector)
			}

			var updatedFace = null;
			if (this.state.isWireInProgress){ 				
				if (!isInvalid){ //this is a valid interface
					var vectorToOtherEndComponent = null;
	
					vectorToOtherEndComponent = {
						x: this.componentData[this.state.componentID].left - this.componentData[hostComponent].left,
						y: this.componentData[this.state.componentID].top - this.componentData[hostComponent].top
					}
					var refVector = this.props.hostComponent.height / this.props.hostComponent.width;
					updatedFace = getFaceString(vectorToOtherEndComponent, refVector);
					interfaceSide = updatedFace
				}

				else if (this.state.componentID == hostComponent){
					var vectorToCursor = null;
	
					vectorToCursor = {
						x: this.state.cursorX - (this.props.hostComponent.width/2) - this.componentData[hostComponent].left,
						y: this.state.cursorY - (this.props.hostComponent.height/2) - this.componentData[hostComponent].top
					}
					var refVector = this.props.hostComponent.height / this.props.hostComponent.width;
					updatedFace = getFaceString(vectorToCursor, refVector);
					interfaceSide = updatedFace
				}
			}
			
			if (interfaceSide == "top"){
				var thisLeft = hostCompX + (this.props.hostComponent.width / 2);
				var thisTop = hostCompY ;
			}
			if (interfaceSide == "right"){
				var thisTop = hostCompY + ((this.props.hostComponent.height / 2));
				var thisLeft = hostCompX + this.props.hostComponent.width;
			}
			if (interfaceSide == "bottom" || interfaceSide == "default"){
				var thisLeft = hostCompX + (this.props.hostComponent.width / 2);
				var thisTop = hostCompY + this.props.hostComponent.height;
			}
			if (interfaceSide == "left"){
				var thisTop = hostCompY + ((this.props.hostComponent.height / 2));
				var thisLeft = hostCompX;
			}

			this.componentData[hostComponent]["interfaceTokens"] = [];
			this.componentData[hostComponent]["interfaceTokens"][0] = {
				id: hostComponent,
				mode: thisMode,
				protocol: thisProtocol,
				top: thisTop,
				left: thisLeft,
				face: interfaceSide,
				wireTo: otherEndOfWire,
				vector: vectorToOtherEndComponent	
			};

			var thisToken = this.componentData[hostComponent]["interfaceTokens"][0];

			var thisFillColor = getHSL(0);
			var thisBorderColor = getHSL(0, true);
			
			thisFillColor = getHSL(this.props.protocols[thisProtocol].hue);
			thisBorderColor = getHSL(this.props.protocols[thisProtocol].hue, true);
			
			hostIfcArray.push(
				<HostInterface 
					key = {hostComponent + "interface-1"} 
					tokenObject = {thisToken} 
					isInvalid = {isInvalid} 
					isStartOfNewWire = {isStartOfNewWire} 
					onMouseEnter = {this.ifcMouseEnter} 
					onMouseLeave = {this.ifcMouseLeave} 
					onMouseDown = {this.ifcMouseDown} 
					onMouseUp = {this.ifcMouseUp} 
					color = {thisFillColor} 
					border = {thisBorderColor} 
					ifcDims = {this.props.hostInterface}/>				
			);
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
			var thisProtocol = this.getProtocol(thisWire[0].component, thisWire[0].ifc);
			var wireClass = "";
			if (this.state.isWireInProgress){
				wireClass = "discreet"
			};

    		var isWireExists = false;
    		_.forEach(localGroupArray, function(thisEndpoint) {
    			if (_.isEqual(thisEndpoint, thisWire[0])){
    				isWireExists = true;
    			}
    		});

    		thisStrokeColor = getHSL(this.props.protocols[thisProtocol].hue, true);

			if (!isWireExists) {
				localGroupArray.push(thisWire[0]);
				localGroupArray.push(thisWire[1]);
				wires.push(
					<Wire
						key = {wire} 
						isPendingDeletion = {this.isPendingDeletion} 
						wireClass = {wireClass} 
						color = {thisStrokeColor} 
						stroke = {this.props.wire.width} 
						componentData = {this.componentData} 
						wire = {thisWire} 
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
				isSnapping = {this.state.isSnapping} 
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
				{hostComponentsArray}
						
				<svg className="ifcContainer" width={this.svgExtents.width} height={this.svgExtents.height}>
					{ifcs}
					{hostIfcArray}
				</svg>		
			</div>
		);
	},
});

var HostComponent = React.createClass({
	onMouseDown: function() {
		this.props.onMouseDown(this.props.componentID)
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
				className="hostComponent" 
				style={containerStyle}
				onMouseDown={this.onMouseDown}>
				hostIfcName
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

		var x2 = this.props.thisAbsX;
		var y2 = this.props.thisAbsY;
		if (this.props.isSnapping){
			x2 = this.props.componentData[this.props.isSnapping.component].interfaceGroups[this.props.isSnapping.ifcGroup].left;
			y2 = this.props.componentData[this.props.isSnapping.component].interfaceGroups[this.props.isSnapping.ifcGroup].top
		}

		return (
			<line 
				className = "wire" 
				x1 = {this.props.componentData[end1Comp].interfaceGroups[end1Int].left} 
				y1 = {this.props.componentData[end1Comp].interfaceGroups[end1Int].top} 
				x2 = {x2}
				y2 = {y2}
				style = {componentStyle}/>
		);
	}
});