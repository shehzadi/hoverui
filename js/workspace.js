var Workspace = React.createClass({

	getInitialState: function() {
		return {
			//dragComponentID: null,
			//interfaceIDObject: null,
			//interfaceGroupID: null,
			//componentID: null,
			mouseDown: false,
			//startFromExistingWire: false,
			dragging: false,
			wireType: false,
			isPendingUpdate: false,
			//workspaceOriginX: 0,
			//workspaceOriginY: 0,
			//startX: 0,
			//startY: 0,
			cursorX: 0,
			cursorY: 0,
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
    			pitch: 25
    		},
    		hostComponent: {
    			width: 90,
    			height: 44
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
    		//console.log("Mouse down on interface: ", tokenObject);
			
    		this.setState({
    			mouseDown: tokenObject
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

	ifcMouseLeave: function(tokenObject) {
		if (this.state.wireType){
			this.setState({
				isSnapping: false,
			});
		}
	},

	ifcMouseEnter: function(tokenObject) {
		//console.log(tokenObject);
		if (this.state.wireType){
			this.setState({
				isSnapping: tokenObject,
			});
		}
	},

	componentMouseDown: function(componentID, componentType) {
		if (event.button == 0){	
			event.stopPropagation();
			this.addDocumentEvents();

			var workspaceBox = React.findDOMNode(this).getBoundingClientRect();
			this.workspaceOriginX = workspaceBox.left;
			this.workspaceOriginY = workspaceBox.top;
			this.startX = event.pageX - this.workspaceOriginX;
			this.startY = event.pageY - this.workspaceOriginY;
			if (componentType == "component"){
				this.dragStartX = this.componentData[componentID].left;
				this.dragStartY = this.componentData[componentID].top;
			}
			else if (componentType == "hostComponent"){
				this.dragStartX = this.hostComponentData[componentID].left;
				this.dragStartY = this.hostComponentData[componentID].top;
			}

			//var startFromExistingWire = false;

			this.setState({
				mouseDown: componentID
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
			

			if (typeof this.state.mouseDown != "string"){ //dragging from interface
				if (this.state.mouseDown.wire){ //dragging drom exiting wired interface
					var wireType = "existing";
					var isPendingUpdate = this.state.mouseDown.wire;
					var sourceObject = getTokenForOtherEnd(this.state.mouseDown, this.componentData, this.hostComponentData);

					//console.log(this.state.mouseDown);
				}
				else {
					var wireType = "new";
					var isPendingUpdate = false;
					var sourceObject = this.state.mouseDown;
				}

			}
			else {
				var sourceObject = this.state.mouseDown;
				var isPendingUpdate = false;
				var wireType = false;
			}

			//console.log(sourceObject);

			this.setState({
				dragging: sourceObject,
				wireType: wireType,
				isPendingUpdate: isPendingUpdate
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
		
		if (this.state.wireType == "existing") {
			
			if (!_.isEqual(this.state.mouseDown, this.state.isSnapping)){
				//console.log("create wire");
				this.props.handleWireDrop(this.state.dragging, this.state.isSnapping);
			}

			//this.props.handleWireDrop(componentID, interfaceGroupID, this.state.componentID, this.state.interfaceGroupID);
		}
		else if (this.state.wireType == "new"){
			//console.log("create wire");
			this.props.handleWireDrop(this.state.dragging, this.state.isSnapping);
		}	
		
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

			if (this.state.wireType == "existing"){ //dropping an existing wire
				if (!_.isEqual(this.state.mouseDown, this.state.isSnapping)){
					this.props.deleteWire(this.state.mouseDown);
					console.log("delete wire", this.state.mouseDown, this.state.isSnapping)
				}	
			}

			this.setState({
				dragging: false,
				//startFromExistingWire: false,
				wireType: false,
				isPendingUpdate: false
				//isWireInProgress: false
				//dragComponentID: null
			});				
		};

		this.setState({
    		mouseDown: false,
    		isSnapping: false
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
  		this.prepData(this.props);
	},

	prepData: function(props) {
		var selectedProject = props.selectedProject;
		var dependenciesObject = selectedProject.dependencies || {} ;
		var componentsObject = selectedProject.topology.components || {};
		var wiresObject = selectedProject.topology.wires || {};
		var hostComponentsObject = selectedProject.topology.host_interfaces || {};

		//set up component data object
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
						interfaceID: interfaceID,
						componentID: componentID,
						mode: thisInterface.mode,
						protocol: thisInterface.protocol
					}
				}
			}
			var componentInterfaces = thisComponent.interfaces;

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

		//set up host component data object
		this.hostComponentData = {};
		for (var hostComponentID in hostComponentsObject) {
			var thisHostComponent = hostComponentsObject[hostComponentID];
			var hostComponentViewData = selectedProject.view[hostComponentID];
			this.hostComponentData[hostComponentID] = {
				hostComponentID: hostComponentID,
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
			var componentInterfaces = thisComponent.interfaces;
			var moduleInterfaces = thisComponent.module.interfaces;

			var ioCapability = [];

			_.forEach(moduleInterfaces, function(interface){
				var thisCapability = {
					componentID: componentID,
					mode: interface.mode,
					protocol: interface.protocol,
					capacity: interface.capacity,
					used: 0
				};

				// test for used capabilities
				var that = this;
				_.forEach(componentInterfaces, function(interface){
					if (interface.mode == thisCapability.mode && interface.protocol == thisCapability.protocol){
						thisCapability.used += 1
					}
				});
				ioCapability.push(thisCapability)
			});

			this.componentData[componentID]["ioCapability"] = ioCapability;	
		};

		//set up wire data object
		this.wireData = {};
		for (var wireID in wiresObject) {

			var thisWire = wiresObject[wireID];

			this.wireData[wireID] = [];
			var that = this;
			_.forEach(thisWire, function(endpoint, i){
				//console.log(endpoint);
				var thisEndpoint = {};
				if (endpoint.ifc){//endpoint is component NOT host
					var thisProtocol = that.componentData[endpoint.component].interfaces[endpoint.ifc].protocol;
					var thisMode = that.componentData[endpoint.component].interfaces[endpoint.ifc].mode;
					var thisIfc = endpoint.ifc;
				}
				else {
					var thisProtocol = that.hostComponentData[endpoint.component].protocol;
					var thisMode = that.hostComponentData[endpoint.component].mode;
					var thisIfc = null;
				}
				thisEndpoint = {
					"wire": wireID,
					"component": endpoint.component,
					"ifc": thisIfc,
					"protocol": thisProtocol,
					"mode": thisMode
				}
				that.wireData[wireID].push(thisEndpoint)
			});
		}

		//add data from wire data
		for (var wire in this.wireData) {
			var thisWire = this.wireData[wire];
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
				writeLocation["wire"] = wire;
			});
		};

		this.positionInterfaces();
	},

	positionInterfaces: function() {
		//add positional and face data etc.
		for (var wire in this.wireData) {
			var thisWire = this.wireData[wire];
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
				
				if (otherEnd.ifc){//otherEnd is component, not host
					var otherComponent = that.componentData[otherEnd.component];
				}
				else {//otherEnd is a host
					var otherComponent = that.hostComponentData[otherEnd.component];
				}

				var faceString = getFaceString(thisComponent, otherComponent);

				writeLocation["face"] = faceString;
				
			});
		};

		//create token arrays
		for (var componentID in this.componentData) {
			var thisComponent = this.componentData[componentID];
			var tokenArrays = {
				"top": [],
				"right": [],
				"bottom": [],
				"left": []
  			}

  			_.forEach(thisComponent.ioCapability, function(thisToken) {
  				tokenArrays.bottom.push(thisToken)
  			})

  			if (thisComponent.interfaces){
				for (var interfaceID in thisComponent.interfaces){
					thisInterface = thisComponent.interfaces[interfaceID];
					thisInterfaceFace = thisInterface.face;
					if (thisInterfaceFace == "top"){tokenArrays.top.push(thisInterface)}
					if (thisInterfaceFace == "right"){tokenArrays.right.push(thisInterface)}
					if (thisInterfaceFace == "bottom"){tokenArrays.bottom.push(thisInterface)}
					if (thisInterfaceFace == "left"){tokenArrays.left.push(thisInterface)}
				}
  			}

  			// sort arrays by protocol and mode
  			tokenArrays = sortTokenArrays(tokenArrays);
  			thisComponent["tokenArrays"] = tokenArrays

  			// calculate locations of interface tokens
  			tokenArrays = positionTokens(thisComponent, this.props.ifc);
		};

		//position host interfaces
		for (var hostComponentID in this.hostComponentData) {
			var thisHostComponent = this.hostComponentData[hostComponentID];
			
			if (thisHostComponent.face == "top"){
				thisHostComponent['ifcLeft'] = thisHostComponent.left + (thisHostComponent.width / 2);
				thisHostComponent['ifcTop'] = thisHostComponent.top;
			}
			else if (thisHostComponent.face == "right"){
				thisHostComponent['ifcLeft'] = thisHostComponent.left + thisHostComponent.width;
				thisHostComponent['ifcTop'] = thisHostComponent.top + (thisHostComponent.height / 2);
			}
			else if (thisHostComponent.face == "left"){
				thisHostComponent['ifcLeft'] = thisHostComponent.left;
				thisHostComponent['ifcTop'] = thisHostComponent.top + (thisHostComponent.height / 2);
			}
			else {
				thisHostComponent['ifcLeft'] = thisHostComponent.left + (thisHostComponent.width / 2);
				thisHostComponent['ifcTop'] = thisHostComponent.top + thisHostComponent.height;
			}
		};

	},

	componentWillReceiveProps: function(nextProps) {
  		this.prepData(nextProps)
	},

	render: function() {
		this.isPendingDeletion = false;

		//render components
		var components = [];
		for (var componentID in this.componentData) {
			var thisComponent = this.componentData[componentID];

			if (componentID == this.state.dragging){ //component is being dragged
				thisComponent.left = this.dragStartX + this.state.cursorX - this.startX;
				thisComponent.top = this.dragStartY + this.state.cursorY - this.startY;	
				this.positionInterfaces();		
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
					component = {thisComponent} 
					componentID = {componentID}/>
  			);
		};













		//interfaces
		var ifcs = [];
		for (var componentID in this.componentData) {
			var thisComponent = this.componentData[componentID];
			var thisTokenArrays = thisComponent.tokenArrays;
/*
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
			*/
			var that = this;
			_.forEach(thisTokenArrays, function(thisTokenArray, i) {
				_.forEach(thisTokenArray, function(thisToken, j) {
					var key = "" + componentID + i + j;
					ifcs.push(
					<InterfaceToken 
						tokenObject = {thisToken} 
						key = {key} 
						isPendingDeletion = {that.isPendingDeletion} 
						onMouseEnter = {that.ifcMouseEnter} 
						onMouseLeave = {that.ifcMouseLeave} 
						onMouseDown = {that.ifcMouseDown} 
						onMouseUp = {that.ifcMouseUp} 
						protocols = {that.props.protocols} 
						componentID = {componentID} 
						componentData = {that.componentData} 
						dragging = {that.state.dragging} 
						wireType = {that.state.wireType} 
						mouseDown = {that.state.mouseDown}
						isPendingUpdate = {that.state.isPendingUpdate}
						ifcDims = {that.props.ifc}/>			
					);
				});
			});

			/*
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
			*/
		};
















		var hostComponents = [];
		var hostIfcArray = [];
		for (var hostComponentID in this.hostComponentData) {
			var thisHostComponent = this.hostComponentData[hostComponentID];

		/*
			var hostCompX = thisHostComponent.left;
			var hostCompY = thisHostComponent.top;

			if (hostComponentID == this.state.dragging){
				hostCompX += this.state.cursorX - this.startX;
				hostCompY += this.state.cursorY - this.startY;
				if (hostCompX <= 0){hostCompX = 0}
				if (hostCompY <= headerHeight + 1){hostCompY = headerHeight + 1}
			};

		*/

			if (hostComponentID == this.state.dragging){ //component is being dragged
				thisHostComponent.left = this.dragStartX + this.state.cursorX - this.startX;
				thisHostComponent.top = this.dragStartY + this.state.cursorY - this.startY;
				if (thisHostComponent.top <= headerHeight + 2){thisHostComponent.top = headerHeight + 2}
				if (thisHostComponent.left <= 2){thisHostComponent.left = 2}	
				this.positionInterfaces();		
			}

			hostComponents.push(
				<HostComponent
					key = {hostComponentID} 
					onMouseDown = {this.componentMouseDown} 
					onMouseUp = {this.ifcMouseUp} 
					hostCompDims = {this.props.hostComponent} 
					hostComponent = {thisHostComponent} 
					hostComponentID = {hostComponentID}/>
			);
		/*
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
		*/
			// host interface ports
			// figure out component at other end, vector, face etc.
		/*	
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
		*/

			//console.log(thisHostComponent);
			//if (thisHostComponent.wire){}
			
			hostIfcArray.push(
				<HostInterface 
					key = {hostComponentID} 
					tokenObject = {thisHostComponent} 
					//isInvalid = {isInvalid} 
					//isStartOfNewWire = {isStartOfNewWire} 
					wireType = {this.state.wireType} 
					mouseDown = {this.state.mouseDown}
					dragging = {this.state.dragging} 
					isPendingUpdate = {this.state.isPendingUpdate}
					onMouseEnter = {this.ifcMouseEnter} 
					onMouseLeave = {this.ifcMouseLeave} 
					onMouseDown = {this.ifcMouseDown} 
					onMouseUp = {this.ifcMouseUp} 
					protocols = {this.props.protocols} 
					//color = {thisFillColor} 
					//border = {thisBorderColor} 
					hostCompDims = {this.props.hostComponent}/>				
			);
		};


		var wires = [];
		//var localGroupArray = [];

		/*this.existingWireEndpoint = false;
		if (this.state.startFromExistingWire && this.state.dragging){
			this.existingWireEndpoint = {
				component: this.state.startFromExistingWire.component,
				interfaceGroup: convertToGroup(this.state.startFromExistingWire.component, this.state.startFromExistingWire.ifc, selectedProjectObject.view)
			};
		};
		*/

		//var selectedProject = this.props.selectedProject;
		//var wiresObject = selectedProject.topology.wires || {};


		for (var wire in this.wireData) {
			var thisWire = this.wireData[wire];
			var wireClass = "";
			if (this.state.isWireInProgress){
				wireClass = "discreet"
			};

    		var isWireExists = false;
    		/*
    		_.forEach(localGroupArray, function(thisEndpoint) {
    			if (_.isEqual(thisEndpoint, thisWire[0])){
    				isWireExists = true;
    			}
    		});

    		thisStrokeColor = getHSL(this.props.protocols[thisProtocol].hue, true);
    		*/

			if (!isWireExists) {
			//	localGroupArray.push(thisWire[0]);
			//	localGroupArray.push(thisWire[1]);
				wires.push(
					<Wire
						key = {wire} 
						isPendingDeletion = {this.isPendingDeletion} 
						wireClass = {wireClass} 
						//protocol = {thisWire[0].protocol} 
						//stroke = {this.props.wire.width} 
						isPendingUpdate = {this.state.isPendingUpdate} 
						dragging = {this.state.dragging} 
						wireID = {wire} 
						protocols = {this.props.protocols} 
						componentData = {this.componentData} 
						hostComponentData = {this.hostComponentData} 
						wire = {thisWire} 
						existingWireEndpoint = {this.existingWireEndpoint}/>
				);
			}
		};


		// render wire in progress if possible
		if (this.state.wireType) {
			var wireInProgress = <WireInProgress
				protocols = {this.props.protocols} 
				dragging = {this.state.dragging} 
				isPendingUpdate = {this.state.isPendingUpdate}
				wireType = {this.state.wireType} 
				isSnapping = {this.state.isSnapping} 
				componentData = {this.componentData} 
				hostComponentData = {this.hostComponentData}
				cursorX = {this.state.cursorX} 
				cursorY = {this.state.cursorY}/>	
		}

		//figure out size of svg container
		this.svgExtents = defineSvgSize(this.componentData, this.hostComponentData, this.state.cursorX, this.state.cursorY)

		return (
			<div className="ui-module workspace pattern">		
				<svg className="wireContainer" width={this.svgExtents.width} height={this.svgExtents.height}>
					{wires}
					{wireInProgress}
				</svg>	
				{components}
				{hostComponents}
						
				<svg className="ifcContainer" width={this.svgExtents.width} height={this.svgExtents.height}>
					{ifcs}
					{hostIfcArray}
				</svg>		
			</div>
		);
	},
});