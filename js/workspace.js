var Workspace = React.createClass({

	getInitialState: function() {
		return {
			mouseDown: false,
			dragging: false,
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
		if (this.state.wireType){
			this.setState({
				isSnapping: tokenObject,
			});
		}
	},

	objectMouseDown: function(objectID, objectType) {
		if (event.button == 0){	
			event.stopPropagation();
			this.addDocumentEvents();

			var workspaceBox = React.findDOMNode(this).getBoundingClientRect();
			this.workspaceOriginX = workspaceBox.left;
			this.workspaceOriginY = workspaceBox.top;
			this.startX = event.pageX - this.workspaceOriginX;
			this.startY = event.pageY - this.workspaceOriginY;
			if (objectType == "component"){
				this.dragStartX = this.componentData[objectID].left;
				this.dragStartY = this.componentData[objectID].top;
			}
			else if (objectType == "hostComponent"){
				this.dragStartX = this.hostComponentData[objectID].left;
				this.dragStartY = this.hostComponentData[objectID].top;
			}
			else if (objectType == "policy"){
				this.dragStartX = this.policiesData[objectID].left;
				this.dragStartY = this.policiesData[objectID].top;
			}

			this.setState({
				mouseDown: objectID
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

	onMouseUp: function(event) {
		var finalX = event.pageX - this.workspaceOriginX;
		var finalY = event.pageY - this.workspaceOriginY;
		var deltaX = finalX - this.startX;
		var deltaY = finalY - this.startY;

		this.removeDocumentEvents();

		if (this.state.dragging){
			if (typeof this.state.dragging == "string"){ //dropping component
				this.props.handleObjectDrop(this.state.dragging, deltaX, deltaY);
			}

			if (this.state.wireType == "existing"){ //dropping an existing wire
				if (!_.isEqual(this.state.mouseDown, this.state.isSnapping)){
					this.props.deleteWire(this.state.mouseDown);
				}	
			}

			this.setState({
				dragging: false,
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
		var policiesObject = selectedProject.policies || {};

		//set up policies data object
		this.policiesData = {};
		for (var policyID in policiesObject) {
			var policyViewData = selectedProject.view[policyID];
			var moduleID = policiesObject[policyID].module;
			//debugger
			this.policiesData[policyID] = {
				moduleID: moduleID,
				module: dependenciesObject[moduleID], 
				left: policyViewData.left, 
				top: policyViewData.top, 
				width: policyViewData.width, 
				height: policyViewData.height
			}
		}

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

  			//sort arrays by protocol and mode
  			tokenArrays = sortTokenArrays(tokenArrays);
  			thisComponent["tokenArrays"] = tokenArrays

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
				thisPolicy.left = this.dragStartX + this.state.cursorX - this.startX;
				thisPolicy.top = this.dragStartY + this.state.cursorY - this.startY;	
			}
		
			if (thisPolicy.left <= 0 || thisPolicy.top <= headerHeight) { //component is outside of canvas, e.g. during drag operation
				this.isPendingDeletion = policyID
			}
			
  			policies.push(
  				<Policy
					key = {policyID} 
					isPendingDeletion = {this.isPendingDeletion} 
					onMouseDown = {this.objectMouseDown} 
					//dims = {this.props.component} 
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
		};


		//render host components and interfaces
		var hostComponents = [];
		var hostIfcArray = [];
		for (var hostComponentID in this.hostComponentData) {
			var thisHostComponent = this.hostComponentData[hostComponentID];

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


		//render wire in progress if required
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


		//return
		return (
			<div className="ui-module workspace pattern">		
				<svg className="wireContainer" width={this.svgExtents.width} height={this.svgExtents.height}>
					{wires}
					{wireInProgress}
				</svg>	
				{policies}
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