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

	ifcMouseLeave: function(componentID, interfaceGroupID, isInvalid) {
		if (this.state.isWireInProgress){
			this.setState({
				isSnapping: false,
			});
		}
	},

	ifcMouseEnter: function(componentID, interfaceGroupID, isInvalid) {

		if (this.state.isWireInProgress && isInvalid == false){
			var snapObject = {
				component: componentID,
				ifcGroup: interfaceGroupID
			}

			this.setState({
				isSnapping: snapObject,
			});
		}
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

		this.setState({
			isSnapping: false
		});		
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
			var dependentModulesObject = {};
			if (selectedProjectObject.dependencies){
				dependentModulesObject = selectedProjectObject.dependencies;
    		}

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

		var getFaceString = function(vector, refVector){
			var refMultiplier = refVector;
			var interfaceSide = "";

			if ((vector.x * refMultiplier) <= vector.y){
				if ((vector.x * -refMultiplier) < vector.y){
					interfaceSide = "bottom";
				}
				else {
					interfaceSide = "left";
					//nLeft += 1;
					//nBottom -= 1
				}
			}

			else {
				if ((vector.x * -refMultiplier) > vector.y){
					interfaceSide = "top";
					//nTop += 1;
					//nBottom -= 1
				}
				else {
					interfaceSide = "right";
					//nRight += 1;
					//nBottom -= 1
				}
			}
			return interfaceSide
		}

		this.isPendingDeletion = false;

		this.componentData = {};

		var components = [];
		for (var componentID in componentsObject) {
			this.componentData[componentID] = {};

			var componentModuleID = componentsObject[componentID].module;
			var componentModuleObject = dependentModulesObject[componentModuleID];

			var componentViewData = selectedProjectObject.view[componentID];
			//console.log(componentViewData);

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

		var hostComponentsArray = [];
		var hostPortsArray = [];
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

			hostComponentsArray.push(
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

			this.componentData[hostInterface] = {
				left: hostInterfaceX,
				top: hostInterfaceY
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

			// host interface ports
			// figure out component at other end, vector, face etc.
			var otherEndOfWire = getOtherEndOfWire(hostInterface, "interface-1", selectedProjectObject);
			//console.log(otherEndOfWire);
			var vectorToOtherEndComponent = null;
			var interfaceSide = null;

			if (otherEndOfWire){
				var verticalDist = this.componentData[otherEndOfWire.component].top - this.componentData[hostInterface].top;
				var horizontalDist = this.componentData[otherEndOfWire.component].left - this.componentData[hostInterface].left;

				vectorToOtherEndComponent = {
					x: horizontalDist,
					y: verticalDist
				}

				var refMultiplier = this.props.hostInterface.height / this.props.hostInterface.width;

				if ((vectorToOtherEndComponent.x * refMultiplier) <= vectorToOtherEndComponent.y){
					if ((vectorToOtherEndComponent.x * -refMultiplier) < vectorToOtherEndComponent.y){
						interfaceSide = "bottom";
					}
					else {
						interfaceSide = "left";
					}
				}

				else {
					if ((vectorToOtherEndComponent.x * -refMultiplier) > vectorToOtherEndComponent.y){
						interfaceSide = "top";
					}
					else {
						interfaceSide = "right";
					}
				}
			}

			else {
				interfaceSide = "default"
			}

			var updatedFace = null;
			if (this.state.isWireInProgress){ 				
				if (!isInvalid){ //this is a valid interface
					var vectorToOtherEndComponent = null;
	
					vectorToOtherEndComponent = {
						x: this.componentData[this.state.componentID].left - this.componentData[hostInterface].left,
						y: this.componentData[this.state.componentID].top - this.componentData[hostInterface].top
					}
					var refVector = this.props.hostInterface.height / this.props.hostInterface.width;
					updatedFace = getFaceString(vectorToOtherEndComponent, refVector);
					interfaceSide = updatedFace
				}

				else if (this.state.componentID == hostInterface){
					var vectorToCursor = null;
	
					vectorToCursor = {
						x: this.state.cursorX - (this.props.hostInterface.width/2) - this.componentData[hostInterface].left,
						y: this.state.cursorY - (this.props.hostInterface.height/2) - this.componentData[hostInterface].top
					}
					var refVector = this.props.hostInterface.height / this.props.hostInterface.width;
					updatedFace = getFaceString(vectorToCursor, refVector);
					interfaceSide = updatedFace
				}
			}
			
			if (interfaceSide == "top"){
				var thisLeft = hostInterfaceX + (this.props.hostInterface.width / 2);
				var thisTop = hostInterfaceY ;
			}
			if (interfaceSide == "right"){
				var thisTop = hostInterfaceY + ((this.props.hostInterface.height / 2));
				var thisLeft = hostInterfaceX + this.props.hostInterface.width;
			}
			if (interfaceSide == "bottom" || interfaceSide == "default"){
				var thisLeft = hostInterfaceX + (this.props.hostInterface.width / 2);
				var thisTop = hostInterfaceY + this.props.hostInterface.height;
			}
			if (interfaceSide == "left"){
				var thisTop = hostInterfaceY + ((this.props.hostInterface.height / 2));
				var thisLeft = hostInterfaceX;
			}


			this.componentData[hostInterface]["interfaceGroups"] = {};
			this.componentData[hostInterface].interfaceGroups = {
				"interface-1": {
					//top: ifcY + (this.props.attachmentInterface.height / 2),
					//left: ifcX + (this.props.attachmentInterface.width / 2),
					top: thisTop,
					left: thisLeft,
					face: interfaceSide,
					wireTo: otherEndOfWire,
					vector: vectorToOtherEndComponent
				}
			};
			var thisFillColor = getHSL(0);
			var thisBorderColor = getHSL(0, true);
			
			thisFillColor = getHSL(this.props.protocols[thisProtocol].hue);
			thisBorderColor = getHSL(this.props.protocols[thisProtocol].hue, true);
			
			hostPortsArray.push(
				<HostPort 
					key = {hostInterface + "interface-1"} 
					isInvalid = {isInvalid} 
					isStartOfNewWire = {isStartOfNewWire} 
					mode = {thisMode} 
					onMouseEnter = {this.ifcMouseEnter} 
					onMouseLeave = {this.ifcMouseLeave} 
					onMouseDown = {this.onMouseDown} 
					onMouseUp = {this.onInterfaceMouseUp} 
					color = {thisFillColor} 
					face = {interfaceSide} 
					border = {thisBorderColor} 
					width = {this.props.attachmentInterface.width} 
					height = {this.props.attachmentInterface.height} 
					left = {thisLeft} 
					top = {thisTop} 
					apex = {this.props.attachmentInterface.apex} 
					interfaceID = "interface-1" 
					componentID = {hostInterface}/>				
			);
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




			this.componentData[componentID]["interfaceTokens"] = refModuleObject.interfaces.slice(0);//add unwired tokens

			var interfaceTokenArray = thisComponentData["interfaceTokens"];

			//var interfaceTokenArray = refModuleObject.interfaces.slice(0); //copy of module to establish non-wired tokens

			if (componentObject.interfaces){ //component has wired interfaces so add these to the token array
				for (var interfaceID in componentObject.interfaces) {
					//find wire ID
					var thisEndpoint = {
						"component": componentID,
						"ifc": interfaceID
					}
					var wireID = null;
					var otherEnd = null;
					var vectorToOtherEndComponent = null;
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
						vectorToOtherEndComponent = {
							x: this.componentData[otherEnd.component].left - this.componentData[componentID].left,
							y: this.componentData[otherEnd.component].top - this.componentData[componentID].top
						}
						var refVector = this.props.component.height / this.props.component.width;
						interfaceSide = getFaceString(vectorToOtherEndComponent, refVector);
						console.log(interfaceSide);
						if (interfaceSide == "top"){thisComponentData.faceN.top += 1}
						if (interfaceSide == "right"){thisComponentData.faceN.right += 1}
						if (interfaceSide == "bottom"){thisComponentData.faceN.bottom += 1}
						if (interfaceSide == "left"){thisComponentData.faceN.left += 1}
					}

					var interfaceToken = {
						"capacity": 1,
						"id": interfaceID,
						"mode": componentObject.interfaces[interfaceID].mode,
						"protocol": componentObject.interfaces[interfaceID].protocol,
						"wire": wireID,
						"otherEnd": otherEnd,
						"face": interfaceSide,
					}
					interfaceTokenArray.push(interfaceToken)
				}
				
			}

			
			//debugger;


	  		//var thisComponentX = thisComponentData.left;
	  		//var thisComponentY = thisComponentData.top;


			//loop through internal interface groups and get coordinates of other end components

			//var nRight = 0; 
			//var nLeft = 0;
			//var nTop = 0;
			var that = this;
			//var nBottom = interfaceTokenArray.length;
			_.forEach(interfaceTokenArray, function(thisToken) {
			//for (var i = 0; i < interfaceTokenArray.length; i++) {
			//for (var groupID in interfaceGroups) {

				
			    

				
				//var vectorToOtherEndComponent = null;
				//var interfaceSide = null;

				//get number of interfaces in group
				//var tokenCapacity = thisInterfaceTokenObject.capacity;
				//get protocol and mode
				//var referenceInterface = Object.keys(thisInterfaceGroup)[0];
				//var tokenProtocol = thisInterfaceTokenObject.protocol;
			
		
				/*if (otherEndOfWire){
					vectorToOtherEndComponent = {
						x: this.componentData[otherEndOfWire.component].left - this.componentData[componentID].left,
						y: this.componentData[otherEndOfWire.component].top - this.componentData[componentID].top
					}
					var refVector = this.props.component.height / this.props.component.width;
					interfaceSide = getFaceString(vectorToOtherEndComponent, refVector)
				}
				else {
					interfaceSide = "default"					
				}
				*/

				//calculate start-of-new-wire & validity
				var isInvalid = false;
				var isStartOfNewWire = false;

				if (that.state.isWireInProgress){ //test for mode, protocol and number of interfaces	
					isInvalid = true;

					if ((thisToken.mode != this.thisWireInProgressStartMode || thisToken.mode == "bi")
						&& (thisToken.protocol == this.thisWireInProgressProtocol)) {
						isInvalid = false;
					}

					//if (componentID == this.state.componentID) { //other interfaces on same component
					//	isInvalid = true;
					//}

					// test for existing wire
					//var thisRefEndpoint = {
					//	"component": componentID,
					//	"ifc": referenceInterface
					//};

					//if (isExistingWire(thisRefEndpoint, wiresObject)){
					//	isInvalid = true;
					//}

					//test for self
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
				console.log(interfaceTokenArray);

				/*{
					capacity: thisToken.capacity,
					mode: thisToken.mode,
					protocol: thisToken.protocol,
					id: thisToken.id,
					wire: thisToken.wire,
					face: interfaceSide,
					top: null,
					left: null,
					isInvalid: isInvalid,
					isStartOfNewWire: isStartOfNewWire,
					wireTo: otherEndOfWire,
					vector: vectorToOtherEndComponent
				}
				console.log(interfaceTokenArray);
				interfaceTokenArray.push(interfaceTokenObject);
				console.log(interfaceTokenArray);
				*/

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

//--------

			var groupIndex = 0;
			var rightIndex = 0; 
			var leftIndex = 0;
			var topIndex = 0;
			var bottomIndex = 0;

			//for (var i = 0; i < this.componentData[componentID]["interfaceTokens"].length; i++) {
			var that = this;
			_.forEach(interfaceTokenArray, function(thisToken, i) {
			//for (var groupID in interfaceGroups) {

				//var thisGroupID = groupID;
			    //var thisInterfaceTokenObject = this.componentData[componentID]["interfaceTokens"][i];


				//get number of interfaces for token
				//var nInterfacesInGroup = thisInterfaceTokenObject.capacity;
				//var tokenCapacity = thisToken.capacity;


				//get protocol and mode
				//var interfaceGroupProtocol = this.getProtocol(componentID, referenceInterface);
				//var interfaceGroupMode = interfacesObject[referenceInterface].mode;
				//var tokenProtocol = thisInterfaceTokenObject.protocol;
				//var tokenMode = thisInterfaceTokenObject.mode;

				//calculate location
				//get face

				//var tokenFace = thisInterfaceTokenObject.face;
				console.log(thisComponentData);
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

				var thisFillColor = getHSL(that.props.protocols[thisToken.protocol].hue);
				var thisBorderColor = getHSL(that.props.protocols[thisToken.protocol].hue, true);

				var thisKey = "" + componentID + i;

				ifcs.push(
					<InterfaceToken 
						isPendingDeletion = {that.isPendingDeletion} 
						key = {thisKey} 
						onMouseEnter = {that.ifcMouseEnter} 
						onMouseLeave = {that.ifcMouseLeave} 
						onMouseDown = {that.onMouseDown} 
						onMouseUp = {that.onInterfaceMouseUp} 
						interfaceMode = {thisToken.mode} 
						face = {thisToken.face} 
						color = {thisFillColor} 
						border = {thisBorderColor} 
						width = {that.props.ifc.width} 
						height = {that.props.ifc.height} 
						componentData = {that.componentData} 
						componentHeight = {that.props.component.height} 
						componentWidth = {that.props.component.width} 
						tokenObject = {thisToken} 
						componentID = {componentID}/>				
				);

				groupIndex += 1;
			});
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

			/*
			var endpoints = {
				"endpoint-1": {
					"component": thisWire[0].component,
					"ifc": thisWire[0].ifc
					//"interfaceGroup": convertToGroup(thisWire[0].component, thisWire[0].ifc, selectedProjectObject.view)
				},
				"endpoint-2": {
					"component": thisWire[1].component,
					"ifc": thisWire[1].ifc
					//"interfaceGroup": convertToGroup(thisWire[1].component, thisWire[1].ifc, selectedProjectObject.view)
				}
			};
			*/

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
					<WireGroup
						key = {wire} 
						isPendingDeletion = {this.isPendingDeletion} 
						wireClass = {wireClass} 
						color = {thisStrokeColor} 
						stroke = {this.props.wire.width} 
						componentData = {this.componentData} 
						endpoints = {thisWire} 
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
					{hostPortsArray}
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
				hostIfcName
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