var Workspace = React.createClass({

	getInitialState: function() {
		return {
			mouseDown: false,
			dragging: false,
			resizing: false,
			wireType: false,
			isPendingUpdate: false,
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
    			width: 16,
    			height: 1,
    			pitch: 20
    		},
    		hostComponent: {
    			width: 95,
    			height: 55
    		}	
    	};
	},

	componentDidUpdate: function(prevProps){
		if (!_.isEqual(this.props, prevProps)){
			this.props.updatePoliciesData(this.policiesData)
		}		
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
			
    		this.setState({
    			mouseDown: tokenObject
    		});
		}
	},

	dragMouseDown: function(instrumentID, instrumentObject) {			
		if (event.button == 0){	
			event.stopPropagation();
			this.addDocumentEvents();

			var workspaceBox = React.findDOMNode(this).getBoundingClientRect();
			this.workspaceOriginX = workspaceBox.left;
			this.workspaceOriginY = workspaceBox.top;
			this.startX = event.pageX - this.workspaceOriginX;
    		this.startY = event.pageY - this.workspaceOriginY;
			
    		this.setState({
    			mouseDown: instrumentObject
    		});
		}
	},


	ifcMouseLeave: function(tokenObject) {
		if (this.state.wireType){
			this.setState({
				isSnapping: false,
			});
		}
	},

	ifcMouseEnter: function(tokenObject) {
		if (this.state.wireType){
			this.setState({
				isSnapping: tokenObject,
			});
		}
	},

	objectMouseDown: function(objectID, objectType, direction) {
		if (event.button == 0){	
			this.addDocumentEvents();
			var workspaceBox = React.findDOMNode(this).getBoundingClientRect();
			this.workspaceOriginX = workspaceBox.left;
			this.workspaceOriginY = workspaceBox.top;
			this.startX = event.pageX - this.workspaceOriginX;
			this.startY = event.pageY - this.workspaceOriginY;
			switch(objectType) {
				case "component":
		    		this.dragStartX = this.componentData[objectID].left;
					this.dragStartY = this.componentData[objectID].top;
		    		break;
		    	case "hostComponent":
		    		this.dragStartX = this.hostComponentData[objectID].left;
					this.dragStartY = this.hostComponentData[objectID].top;
		    		break;
		    	case "policy":
		    		this.dragStartX = this.policiesData[objectID].left;
					this.dragStartY = this.policiesData[objectID].top;
					this.dragStartW = this.policiesData[objectID].width;
					this.dragStartH = this.policiesData[objectID].height;
		    		break;
		    	case "instrument":
		    		this.dragStartX = this.instrumentData[objectID].left;
					this.dragStartY = this.instrumentData[objectID].top;
					this.dragStartW = this.instrumentData[objectID].width;
					this.dragStartH = this.instrumentData[objectID].height;
		    		break;
			}

			this.setState({
				mouseDown: objectID,
				resizing: direction || false
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
			console.log(this.state.mouseDown);
			if (typeof this.state.mouseDown != "string"){ //dragging from interface
				if (this.state.mouseDown.wire){ //dragging drom exiting wired interface
					var wireType = "existing";
					var isPendingUpdate = this.state.mouseDown.wire;
					var sourceObject = getTokenForOtherEnd(this.state.mouseDown, this.componentData, this.hostComponentData);
				}
				else if (this.state.mouseDown.height){ //dragging from instrument drag
					console.log("Instrument drag");
					var wireType = "instrument";
					var isPendingUpdate = false;
					var sourceObject = this.state.mouseDown;
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

			this.setState({
				dragging: sourceObject,
				wireType: wireType,
				isPendingUpdate: isPendingUpdate
			});
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
				this.props.handleWireDrop(this.state.dragging, this.state.isSnapping);
			}
		}
		else if (this.state.wireType == "new"){
			this.props.handleWireDrop(this.state.dragging, this.state.isSnapping);
		}
		
	},

	getPolicyPosition: function(id, deltaX, deltaY, mode) {
		var thisPolicy = this.policiesData[id];
		if (mode){
			if (_.includes(mode, 'top')) {
				thisPolicy.top = this.dragStartY + deltaY;
			    thisPolicy.height = this.dragStartH - deltaY;
			    if (thisPolicy.height <= minPolicyDim){thisPolicy.top = this.dragStartY + this.dragStartH - minPolicyDim}
			}
			if (_.includes(mode, 'right')) {
				thisPolicy.width = this.dragStartW + deltaX;
			}
			if (_.includes(mode, 'bottom')) {
				thisPolicy.height = this.dragStartH + deltaY;
			}
			if (_.includes(mode, 'left')) {
				thisPolicy.left = this.dragStartX + deltaX;
			    thisPolicy.width = this.dragStartW - deltaX;
			    if (thisPolicy.width <= minPolicyDim){thisPolicy.left = this.dragStartX + this.dragStartW - minPolicyDim}
			}			   
			if (thisPolicy.height <= minPolicyDim){thisPolicy.height = minPolicyDim}
			if (thisPolicy.width <= minPolicyDim){thisPolicy.width = minPolicyDim}
		}
		else {
			thisPolicy.left = this.dragStartX + deltaX;
			thisPolicy.top = this.dragStartY + deltaY;
		}
	},

	getInstrumentPosition: function(id, deltaX, deltaY, mode) {
		var thisInstrument = this.instrumentData[id];
		if (mode){
			thisInstrument.width = _.clamp(this.dragStartW + deltaX, 120, Infinity);
			thisInstrument.height =_.clamp(this.dragStartH + deltaY, 95, Infinity);
		}
		else {
			thisInstrument.left = this.dragStartX + deltaX;
			thisInstrument.top = this.dragStartY + deltaY;
		}
	},

	onDocumentMouseUp: function(event) {
		var finalX = event.pageX - this.workspaceOriginX;
		var finalY = event.pageY - this.workspaceOriginY;
		var deltaX = finalX - this.startX;
		var deltaY = finalY - this.startY;

		this.removeDocumentEvents();

		if (this.state.dragging){
			dragee = this.state.dragging;
			if (typeof dragee == "string"){ //dropping component
				if (_.startsWith(dragee, 'policy')){
					var thisPolicy = this.policiesData[dragee];
					this.getPolicyPosition(dragee, deltaX, deltaY, this.state.resizing);
					this.handlePolicyUpdate(dragee, thisPolicy.left, thisPolicy.top, thisPolicy.height, thisPolicy.width)
				}
				else if (_.startsWith(dragee, 'instrument')){
					var thisInstrument = this.instrumentData[dragee];
					this.getInstrumentPosition(dragee, deltaX, deltaY, this.state.resizing);
					this.props.handleInstrumentUpdate(dragee, thisInstrument)
				}
				else {
					this.props.handleObjectDrop(dragee, deltaX, deltaY);
				}
			}

			if (this.state.wireType == "existing"){ //dropping an existing wire
				if (!_.isEqual(this.state.mouseDown, this.state.isSnapping)){
					this.props.deleteWire(this.state.mouseDown);
				}	
			}

			this.setState({
				dragging: false,
				resizing: false,
				wireType: false,
				isPendingUpdate: false
			});				
		};

		this.setState({
    		mouseDown: false,
    		isSnapping: false
    	});		
	},

	addDocumentEvents: function() {
    	document.addEventListener('mousemove', this.onMouseMove);
    	document.addEventListener('mouseup', this.onDocumentMouseUp);
	},

	removeDocumentEvents: function() {
    	document.removeEventListener('mousemove', this.onMouseMove);
    	document.removeEventListener('mouseup', this.onDocumentMouseUp);
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
		var policiesObject = selectedProject.policies || {};
		var instrumentsObject = selectedProject.instruments || {};

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
						protocol: thisInterface.protocol,
						policies: []
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
				protocol: thisHostComponent.protocol,
				policies: []
			};
		};

		//add io capability data
		for (var componentID in this.componentData) {
			var thisComponent = this.componentData[componentID];
			var componentInterfaces = thisComponent.interfaces;
			var moduleInterfaces = thisComponent.module.topology.interfaces;

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
			_.forEach(thisWire, function(thisEnd, i){
				if (i == 0){
					var otherEnd = thisWire[1]
				}
				else {
					var otherEnd = thisWire[0]
				}

				if (thisEnd.ifc){//thisEnd is component, not host
					var thisComponent = this.componentData[thisEnd.component];
					var writeLocation = thisComponent.interfaces[thisEnd.ifc]
				}
				else {//thisEnd is a host
					var thisComponent = this.hostComponentData[thisEnd.component];
					var writeLocation = thisComponent
				}

				var otherComponentID = otherEnd.component;

				if (_.startsWith(otherComponentID, 'host')){
					var otherComponent = this.hostComponentData[otherComponentID]
				}
				else {
					var otherComponent = this.componentData[otherComponentID]
				}

				//console.log(thisComponent, otherComponent);

				writeLocation["wireTo"] = {
					component: otherComponentID,
					ifc: otherEnd.ifc || false
					//vector: getVector(thisComponent, otherComponent)
				}
				writeLocation["wire"] = wire;
			}.bind(this));
		};

		//set up policies data object
		this.policiesData = {};
		for (var policyID in policiesObject) {
			var policyViewData = selectedProject.view[policyID];
			var policy = policiesObject[policyID];
			var moduleID = policy.module;
			var policyView = selectedProject.dependencies[moduleID].view;
			//debugger
			this.policiesData[policyID] = {
				moduleID: moduleID,
				module: dependenciesObject[moduleID], 
				interfaces: policy.interfaces || null, 
				view: policyView,
				computedInterfaces: [], 
				left: policyViewData.left, 
				top: policyViewData.top, 
				width: policyViewData.width, 
				height: policyViewData.height
			}
		};

		//set up instruments data object
		this.instrumentData = {};
        _.forEach(instrumentsObject, function(instrument, id){
            var moduleID = instrument.module;
            var instrumentViewData = selectedProject.view[id];
            this.instrumentData[id] = {
                module: dependenciesObject[moduleID],
                interfaces: [],
                top: instrumentViewData.top,
                left: instrumentViewData.left,
                width: instrumentViewData.width,
                height: instrumentViewData.height
            }

            var interfaces = instrument.interfaces || [];
            _.forEach(interfaces, function(ifc){
                var newInterface = {
                    component: ifc.component,
                    ifc: ifc.ifc
                }
                this.instrumentData[id].interfaces.push(newInterface)
            }.bind(this))
        }.bind(this));

		this.positionInterfaces();
		this.applyPoliciesToInterfaces();
		this.addPositionsToInstruments();
	},

	addPositionsToInstruments: function() {
		_.forEach(this.instrumentData, function(instrument, id){
			var interfaces = instrument.interfaces;
			_.forEach(interfaces, function(ifc){
				var thisIfc = this.componentData[ifc.component].interfaces[ifc.ifc];
				ifc["left"] = thisIfc.left;
				ifc["top"] = thisIfc.top;			
			}.bind(this))
		}.bind(this))
    },

	applyPoliciesToInterfaces: function() {
		// clear policies
		_.forEach(this.policiesData, function(policy, policyID){
			policy.computedInterfaces = []
		});

		_.forEach(this.componentData, function(component, componentID){
			var interfaces = component.interfaces;

			_.forEach(interfaces, function(ifc, ifcID){
				var ifcTop = ifc.top;
				var ifcLeft = ifc.left;
				ifc.policies = [];

				_.forEach(this.policiesData, function(policy, policyID){
					var policyLeft = policy.left;
					var policyRight = policyLeft + policy.width;
					var policyTop = policy.top;
					var policyBottom = policyTop + policy.height;

					if (_.inRange(ifcLeft, policyLeft, policyRight) && _.inRange(ifcTop, policyTop, policyBottom)){
						//add policyID to interface data
						ifc.policies.push(policyID);
						//add interfaceID to policy data
						policy.computedInterfaces.push({
							"component": componentID,
							"ifc": ifcID
						});
					}
				}.bind(this));
			}.bind(this));
		}.bind(this));

		_.forEach(this.hostComponentData, function(hostComponent, hostComponentID){
				var ifcTop = hostComponent.ifcTop;
				var ifcLeft = hostComponent.ifcLeft;
				hostComponent.policies = [];

				_.forEach(this.policiesData, function(policy, policyID){
					var policyLeft = policy.left;
					var policyRight = policyLeft + policy.width;
					var policyTop = policy.top;
					var policyBottom = policyTop + policy.height;

					if (_.inRange(ifcLeft, policyLeft, policyRight) && _.inRange(ifcTop, policyTop, policyBottom)){
						//add policyID to interface data
						hostComponent.policies.push(policyID);
						//add interfaceID to policy data
						policy.computedInterfaces.push({
							"component": hostComponentID,
							"ifc": false
						});
					}
				}.bind(this));
		}.bind(this));
	},

    handlePolicyUpdate: function(id, left, top, height, width) {
        this.props.handlePolicyUpdate(id, left, top, height, width);
    },

    getNewInterfaceArray: function(policyID, componentData, hostComponentData) {
    	returnArray = [];
    	_.forEach(componentData, function(component, componentID){
    		var thisInterfaces = component.interfaces;

    		_.forEach(thisInterfaces, function(ifc, ifcID){
	    		var thisPolicies = ifc.policies;

	    		_.forEach(thisPolicies, function(id){
	    			if (policyID == id){
		    			returnArray.push({
		    				"component": componentID,
		    				"ifc": ifcID
		    			})
		    		}
		    	});
	    	});
    	});

    	_.forEach(hostComponentData, function(hostComponent, hostComponentID){
    		_.forEach(hostComponent.policies, function(id){
    			if (id == policyID){
	    			returnArray.push({
	    				"component": hostComponentID,
	    				"ifc": false
	    			})
	    		}
	    	});
    	});
    	return returnArray
    },

	positionInterfaces: function() {
		//add positional and face data etc.
		for (var wire in this.wireData) {
			var thisWire = this.wireData[wire];
			_.forEach(thisWire, function(thisEnd, i){
				if (i == 0){
					var otherEnd = thisWire[1]
				}
				else {
					var otherEnd = thisWire[0]
				}

				if (thisEnd.ifc){//thisEnd is component, not host
					var thisComponent = this.componentData[thisEnd.component];
					var writeLocation = thisComponent.interfaces[thisEnd.ifc]
				}
				else {//thisEnd is a host
					var thisComponent = this.hostComponentData[thisEnd.component];
					var writeLocation = thisComponent
				}
				
				if (otherEnd.ifc){//otherEnd is component, not host
					var otherComponent = this.componentData[otherEnd.component];
				}
				else {//otherEnd is a host
					var otherComponent = this.hostComponentData[otherEnd.component];
				}

				//add face data
				var faceString = getFaceString(thisComponent, otherComponent);
				writeLocation["face"] = faceString;
				thisEnd["face"] = faceString

				//add wireTo vector data
				var wireToVector = getVector(thisComponent, otherComponent);
				writeLocation.wireTo["vector"] = wireToVector;
				
			}.bind(this));
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
  				var remaining = thisToken.capacity - thisToken.used;
  				if (remaining > 0){	//only add if not empty
  					if (thisToken.mode == "in"){
  						tokenArrays.top.push(thisToken)
  					}
  					else {
  						tokenArrays.bottom.push(thisToken)
  					}				
  				}
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
  			thisComponent["tokenArrays"] = tokenArrays
		};

		for (var componentID in this.componentData) {
			var thisComponent = this.componentData[componentID];
			var tokenArrays = thisComponent.tokenArrays;

  			//sort arrays by location, protocol and mode
  			tokenArrays = sortTokenArrays(tokenArrays);

  			//calculate locations of interface tokens
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

		//render policies
		var policies = [];
		for (var policyID in this.policiesData) {
			var thisPolicy = this.policiesData[policyID];

			if (policyID == this.state.dragging){ //component is being dragged
				var deltaX = this.state.cursorX - this.startX;
				var deltaY = this.state.cursorY - this.startY;
				this.getPolicyPosition(policyID, deltaX, deltaY, this.state.resizing);
				this.applyPoliciesToInterfaces();	
			}
		
			if (thisPolicy.left <= 0 || thisPolicy.top <= headerHeight) { //component is outside of canvas, e.g. during drag operation
				this.isPendingDeletion = policyID
			}
			
  			policies.push(
  				<Policy
					key = {policyID} 
					isPendingDeletion = {this.isPendingDeletion} 
					onMouseDown = {this.objectMouseDown} 
					handlePolicyUpdate = {this.handlePolicyUpdate} 
					componentData = {this.componentData} 
					hostComponentData = {this.hostComponentData} 
					policyObject = {thisPolicy} 
					policyID = {policyID}/>
  			);
		};

		//render components
		var components = [];
		for (var componentID in this.componentData) {
			var thisComponent = this.componentData[componentID];

			if (componentID == this.state.dragging){ //component is being dragged
				thisComponent.left = this.dragStartX + this.state.cursorX - this.startX;
				thisComponent.top = this.dragStartY + this.state.cursorY - this.startY;	
				this.positionInterfaces();	
				this.addPositionsToInstruments();
				this.applyPoliciesToInterfaces();	
			}
		
			if (thisComponent.left <= 0 || thisComponent.top <= headerHeight) { //component is outside of canvas, e.g. during drag operation
				this.isPendingDeletion = componentID
			}
			
  			components.push(
  				<Component
					key = {componentID} 
					isPendingDeletion = {this.isPendingDeletion} 
					onMouseDown = {this.objectMouseDown} 
					compDims = {this.props.component} 
					component = {thisComponent} 
					componentID = {componentID}/>
  			);
		};

		//render interfaces
		var ifcs = [];
		for (var componentID in this.componentData) {
			var thisComponent = this.componentData[componentID];
			var thisTokenArrays = thisComponent.tokenArrays;
			var policiesData = this.policiesData;

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
						policiesData = {policiesData} 
						dependencies = {that.props.selectedProject.dependencies} 
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
		};

		//render host components and interfaces
		var hostComponents = [];
		var hostIfcArray = [];
		for (var hostComponentID in this.hostComponentData) {
			var thisHostComponent = this.hostComponentData[hostComponentID];
			var policiesData = this.policiesData;

			if (hostComponentID == this.state.dragging){ //component is being dragged
				thisHostComponent.left = this.dragStartX + this.state.cursorX - this.startX;
				thisHostComponent.top = this.dragStartY + this.state.cursorY - this.startY;
				if (thisHostComponent.top <= headerHeight + 2){thisHostComponent.top = headerHeight + 2}
				if (thisHostComponent.left <= 2){thisHostComponent.left = 2}	
				this.positionInterfaces();	
				this.applyPoliciesToInterfaces();	
			}

			hostComponents.push(
				<HostComponent
					key = {hostComponentID} 
					onMouseDown = {this.objectMouseDown} 
					onMouseUp = {this.ifcMouseUp} 
					hostCompDims = {this.props.hostComponent} 
					hostComponent = {thisHostComponent} 
					hostComponentID = {hostComponentID}/>
			);
	
			hostIfcArray.push(
				<HostInterface 
					key = {hostComponentID} 
					tokenObject = {thisHostComponent} 
					wireType = {this.state.wireType} 
					mouseDown = {this.state.mouseDown}
					dragging = {this.state.dragging} 
					isPendingUpdate = {this.state.isPendingUpdate}
					onMouseEnter = {this.ifcMouseEnter} 
					onMouseLeave = {this.ifcMouseLeave} 
					onMouseDown = {this.ifcMouseDown} 
					onMouseUp = {this.ifcMouseUp} 
					protocols = {this.props.protocols} 
					policiesData = {policiesData} 
					dependencies = {this.props.selectedProject.dependencies} 
					hostCompDims = {this.props.hostComponent}/>				
			);
		};

		//render wires
		var wires = [];
		for (var wire in this.wireData) {
			var thisWire = this.wireData[wire];
			var wireClass = "";
			if (this.state.isWireInProgress){
				wireClass = "discreet"
			};

    		var isWireExists = false;

			if (!isWireExists) {
				wires.push(
					<Wire
						key = {wire} 
						isPendingDeletion = {this.isPendingDeletion} 
						wireClass = {wireClass} 
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

		//render instruments
		var instruments = [];
		_.forEach(this.instrumentData, function(instrument, id){

			if (id == this.state.dragging){ //component is being dragged
				var deltaX = this.state.cursorX - this.startX;
				var deltaY = this.state.cursorY - this.startY;
				this.getInstrumentPosition(id, deltaX, deltaY, this.state.resizing);

				if (instrument.left <= 0 || instrument.top <= headerHeight) { //component is outside of canvas, e.g. during drag operation
					this.isPendingDeletion = id
				}


			}

			instruments.push(
				<Instrument
					key = {id} 
					id = {id} 
					instrument = {instrument} 
					isPendingDeletion = {this.isPendingDeletion} 
					handleInstrumentUpdate = {this.handleInstrumentUpdate}
					dragMouseDown = {this.dragMouseDown}
					onMouseDown = {this.objectMouseDown}/>
			);
		}.bind(this));

		//render instrument links
		var instrumentLinks = [];
		_.forEach(this.instrumentData, function(instrument, id){
			var links = instrument.interfaces;
			_.forEach(links, function(link, i){
				var source = {
					top: link.top,
					left: link.left
				}
				var viewer = {
					top: instrument.top,
					left: instrument.left,
					width: instrument.width,
					height: instrument.height
				}
				instrumentLinks.push(
					<InstrumentLink
						key = {i} 
						id = {id} 
						source = {source}
						viewer = {viewer}/>
				);
			}.bind(this));
		}.bind(this));

		//render wire in progress if required
		if (this.state.wireType == "new" || this.state.wireType == "existing") {
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

		//render link in progress if required
		if (this.state.wireType == "instrument") {
			var instrument = this.state.mouseDown;
			console.log(instrument);
			var source = {
				top: this.state.cursorY,
				left: this.state.cursorX
			}
			var viewer = {
				top: instrument.top,
				left: instrument.left,
				width: instrument.width,
				height: instrument.height
			}
			var linkInProgress = <InstrumentLink
									source = {source}
									viewer = {viewer}/>	
		}


		//figure out size of svg container
		this.svgExtents = defineSvgSize(this.componentData, this.hostComponentData, this.instrumentData, this.state.cursorX, this.state.cursorY)


		//return
		return (
			<div className="ui-module workspace pattern">		
				{policies}
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
				{instruments}
				<svg className="linkContainer" width={this.svgExtents.width} height={this.svgExtents.height}>
					{instrumentLinks}
					{linkInProgress}
				</svg>
			</div>
		);
	},
});