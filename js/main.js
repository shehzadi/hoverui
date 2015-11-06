var IOConsole = React.createClass({
	getInitialState: function() {
    	return {
    		projectsObject: {},
    		modulesObject: {},
    		protocolsObject: {},
    		mouseDown: false,
    		dragging: false,
    		startX: 0,
    		startY: 0,
    		cursorX: 0,
    		cursorY: 0,
    		selectedProjectID: null,
    	};
  	},

  	getDefaultProps: function() {
    	return {
    		componentInProgress: {
    			width: 135,
    			height: 72
    		}
    	};
	},

   	deleteWires: function(refEndPoint) {

   		var selectedProject = this.state.projectsObject[this.state.selectedProjectID];

   		var updatedProjectWiresObject = _.cloneDeep(selectedProject.topology.wires);

   		var refGroupID = convertToGroup(refEndPoint.component, refEndPoint.ifc, selectedProject.view);

   		var refGroupObject;

   		if (refEndPoint.component.indexOf('host') == 0){ //is an attachment wire
			refGroupObject = {"interface-1": true}
		}

		else {
   			refGroupObject = selectedProject.view[refEndPoint.component].groups[refGroupID];
		}

   		for (var thisIfc in refGroupObject){
   			var thisEndpoint = {
   				component: refEndPoint.component,
   				ifc: thisIfc
   			}
   			for (thisWire in updatedProjectWiresObject){
   				var endpoint1 = updatedProjectWiresObject[thisWire]["endpoint-1"];
   				var endpoint2 = updatedProjectWiresObject[thisWire]["endpoint-2"];
   				//console.log(endpoint2);
   				if (_.isEqual(endpoint1, thisEndpoint) || _.isEqual(endpoint2, thisEndpoint)) {
   					delete updatedProjectWiresObject[thisWire]
   				}
   			}
   		}

		this.firebaseProjectsRef.child(this.state.selectedProjectID).child("topology").child("wires").set(updatedProjectWiresObject);
    },

	handleNewWireDrop: function(component1, interfaceGroup1, component2, interfaceGroup2) {
		var selectedProject = this.state.projectsObject[this.state.selectedProjectID];
    	var newProjectWiresObject = {};
    	if (selectedProject.topology.wires){
    		newProjectWiresObject = _.cloneDeep(selectedProject.topology.wires);
    	}

		var group1InterfaceArray = ["interface-1"]; // for attachment wire
    	if (component1.indexOf('host') != 0){ // is NOT an attachment wire  		
    		var group1InterfaceObject = selectedProject.view[component1].groups[interfaceGroup1];
    		group1InterfaceArray = Object.keys(group1InterfaceObject);
    	}

    	var group2InterfaceArray = ["interface-1"]; // for attachment wire
    	if (component2.indexOf('host') != 0){ // is NOT an attachment wire	
	    	var group2InterfaceObject = selectedProject.view[component2].groups[interfaceGroup2];
	    	group2InterfaceArray = Object.keys(group2InterfaceObject);
	    }

    	_.forEach(group1InterfaceArray, function(thisInterfaceID, index) {
 			var newWireID = "wire-" + ioid();
    		var newWire = {
	    		"endpoint-1" : {
	    			"component" : component1,
	    			"ifc" : thisInterfaceID
	    		},
	    		"endpoint-2" : {
	    			"component" : component2,
	    			"ifc" : group2InterfaceArray[index]
	    		},
    		}
    		newProjectWiresObject[newWireID] = newWire;
		});

		this.firebaseProjectsRef.child(this.state.selectedProjectID).child("topology").child("wires").set(newProjectWiresObject);

    },

	handleNewComponentDrop: function(moduleID, posX, posY){
     	var newProjectViewObject = {};
     	if (this.state.projectsObject[this.state.selectedProjectID].view){
     		newProjectViewObject = _.cloneDeep(this.state.projectsObject[this.state.selectedProjectID].view);
     	}

    	var newProjectComponentsObject = {};
    	if (this.state.projectsObject[this.state.selectedProjectID].topology.components){
    		newProjectComponentsObject = _.cloneDeep(this.state.projectsObject[this.state.selectedProjectID].topology.components);
    	}
    	var newComponentID = "component-" + ioid();

    	var moduleInterfaces = this.state.modulesObject[moduleID].interfaces;

    	var newInterfaceGroupsObject = {};
    	var groupN = 1;
    	for (thisInterface in moduleInterfaces){
    		var thisInterfaceDetails = moduleInterfaces[thisInterface]; //mode & protocol

    		//check for existing group with these details - return group ID or false
    		var existingGroup = false;
    		for (group in newInterfaceGroupsObject){
    			var existingGroup = false;
    			var existingGroupMemberID = Object.keys(newInterfaceGroupsObject[group])[0];
    			var existingGroupMemberDetails = moduleInterfaces[existingGroupMemberID];
    			if (_.isEqual(thisInterfaceDetails, existingGroupMemberDetails)){
    				existingGroup = group;
    				break
    			}
    		}

    		
    		if (existingGroup == false) {
    			var interfaceGroup = {};
    			interfaceGroup[thisInterface] = true;
    			newInterfaceGroupsObject["group-" + ioid()] = interfaceGroup;
    			groupN += 1
    		}

    		else {
    			newInterfaceGroupsObject[existingGroup][thisInterface] = true;
    		}  		
    	}

    	var newViewData = {
    		"x": posX,
    		"y": posY,
    		"groups": newInterfaceGroupsObject
    	};

    	newProjectViewObject[newComponentID] = newViewData;
    	this.firebaseProjectsRef.child(this.state.selectedProjectID).child("view").set(newProjectViewObject)

    	newProjectComponentsObject[newComponentID] = moduleID;
    	this.firebaseProjectsRef.child(this.state.selectedProjectID).child("topology").child("components").set(newProjectComponentsObject)
	},

	handleComponentDrop: function(dropComponent, deltaX, deltaY) {
    	var newProjectObject = _.cloneDeep(this.state.projectsObject[this.state.selectedProjectID]);

    	newProjectObject.view[dropComponent].x += deltaX;
    	newProjectObject.view[dropComponent].y += deltaY;

    	if (dropComponent.indexOf('host') == 0){
    		if (newProjectObject.view[dropComponent].x <= 0){
				newProjectObject.view[dropComponent].x = 2
	    	}
	    	if (newProjectObject.view[dropComponent].y <= 0){
				newProjectObject.view[dropComponent].y = 2	
	    	}

    		this.firebaseProjectsRef.child(this.state.selectedProjectID).set(newProjectObject)
    	}
    	
	    else {

	    	if (newProjectObject.view[dropComponent].x <= 0 || newProjectObject.view[dropComponent].y <= 0){
				this.deleteComponent(dropComponent)	
	    	}

	    	else {
	    		this.firebaseProjectsRef.child(this.state.selectedProjectID).set(newProjectObject)
	    	}
	    }

		
    },

   	deleteComponent: function(componentID) {
   		var newProjectObject = _.cloneDeep(this.state.projectsObject[this.state.selectedProjectID]);
   		newProjectObject.view[componentID] = null;
   		newProjectObject.topology.components[componentID] = null;

   		//find wires and delete them
   		if (newProjectObject.topology.wires){
	   		for (var wire in newProjectObject.topology.wires){
	   			var wireObject = newProjectObject.topology.wires[wire];
	   			if (wireObject["endpoint-1"].component == componentID || wireObject["endpoint-2"].component == componentID){
	   				newProjectObject.topology.wires[wire] = null
	   			}
	   		}
   		}

   		this.firebaseProjectsRef.child(this.state.selectedProjectID).set(newProjectObject)
    },

	createNewProject: function(projectTemplate) {
		var newProjectsObject = _.cloneDeep(this.state.projectsObject);	

        var newProjectID = "project-" + guid();

        newProjectsObject[newProjectID] = projectTemplate;
        this.firebaseProjectsRef.set(newProjectsObject);

		this.firebaseUserRef.child('settings').child('selectedProject').set(newProjectID);

    },

   	deleteProject: function() {

		this.firebaseProjectsRef.child(this.state.selectedProjectID).remove();

		var projectIDsArray = _.keys(this.state.projectsObject);
		var indexOfSelectedProject = _.indexOf(projectIDsArray, this.state.selectedProjectID);
		var newSelectedProjectIndex = indexOfSelectedProject - 1;
		if (newSelectedProjectIndex == -1){
			newSelectedProjectIndex = 0
		}
		var newSelectedProject = projectIDsArray[newSelectedProjectIndex];

		this.firebaseUserRef.child('settings').child('selectedProject').set(newSelectedProject);
	
    },

  	componentWillMount: function() {

		this.firebaseProjectsRef = new Firebase("https://boiling-torch-3324.firebaseio.com/projects");
		this.firebaseProjectsRef.on("value", function(dataSnapshot) {
			var rootProjectsObject = dataSnapshot.val()
			this.setState({
				projectsObject: rootProjectsObject
			});		
		}.bind(this));

		this.firebaseModulesRef = new Firebase("https://boiling-torch-3324.firebaseio.com/modules");
		this.firebaseModulesRef.on("value", function(dataSnapshot) {
			var rootModulesObject = dataSnapshot.val();
			this.setState({
				modulesObject: rootModulesObject
			});
		}.bind(this));

		this.protocolsRef = new Firebase("https://boiling-torch-3324.firebaseio.com/protocols");
		this.protocolsRef.on("value", function(dataSnapshot) {
			var rootProtocolsObject = dataSnapshot.val();
			this.setState({
				protocolsObject: rootProtocolsObject
			});
		}.bind(this));

		this.firebaseUserRef = new Firebase("https://boiling-torch-3324.firebaseio.com/users/johnkelley");
		this.firebaseUserRef.on("value", function(dataSnapshot) {
			var rootUserObject = dataSnapshot.val();
			this.setState({
				selectedProjectID: rootUserObject.settings.selectedProject,
			});
		}.bind(this));
	},

	onModuleMouseDown: function(thisModule){
		
		if (event.button == 0){	
			
			event.stopPropagation();
			this.addDocumentEvents();

    		this.setState({
    			mouseDown: thisModule,
    			startX: event.pageX,
    			startY: event.pageY
    		});
		}
	},

	onMouseUp: function(event) { //captured on document
		this.removeDocumentEvents();

		var workspaceElement = this.refs.workspace.getDOMNode().getBoundingClientRect();

		var workspaceOriginX = workspaceElement.left;
		var workspaceOriginY = workspaceElement.top;

		var newComponentX = event.pageX - workspaceOriginX - (this.props.componentInProgress.width / 2);
		var newComponentY = event.pageY - workspaceOriginY - (this.props.componentInProgress.height / 2);

		if (newComponentX > 0 && newComponentY >0){
			this.handleNewComponentDrop(this.state.mouseDown, newComponentX, newComponentY)
		}

		this.setState({
    		mouseDown: false,
    		dragging: false
    	});
	},

	onMouseMove: function(event) { //captured on document
		var cursorX = event.pageX;
		var cursorY = event.pageY;
		var deltaX = cursorX - this.state.startX;
		var deltaY = cursorY - this.state.startY;
		var distance = Math.abs(deltaX) + Math.abs(deltaY);

		if (this.state.dragging == false && distance > 4){ //dragging
			this.setState({
				dragging: true,
			});
		}

		if (this.state.dragging){	
			this.setState({
				cursorX: cursorX,
    			cursorY: cursorY
			});
		}
	},

	addDocumentEvents: function() {
    	document.addEventListener('mousemove', this.onMouseMove);
    	document.addEventListener('mouseup', this.onMouseUp);
	},

	removeDocumentEvents: function() {
    	document.removeEventListener('mousemove', this.onMouseMove);
    	document.removeEventListener('mouseup', this.onMouseUp);
	},

	handleProjectClick: function(payload) {
        if (payload.projectID != this.state.selectedProjectID){
        	this.setState({
				selectedProjectID: payload.projectID
			});
			this.firebaseUserRef.child('settings').child('selectedProject').set(payload.projectID)
        }  
    },

	render: function() {
		var componentInProgress;
		if (this.state.dragging){
			var moduleName = this.state.modulesObject[this.state.mouseDown].name;
			var moduleVersion = this.state.modulesObject[this.state.mouseDown].version;
			componentInProgress = <ComponentInProgress
				thisModuleID = {this.state.mouseDown} 
				moduleName = {moduleName} 
				moduleVersion = {moduleVersion} 
				thisWidth = {this.props.componentInProgress.width} 
				thisHeight = {this.props.componentInProgress.height} 
				thisX = {this.state.cursorX} 
				thisY = {this.state.cursorY}/>
		}

		return (
			<div id="IOConsole">
				<div id="navigation">
					<Home />
					<PrimaryNav 
						onProjectClick = {this.handleProjectClick} 
						createNewProject = {this.createNewProject} 
						onModuleMouseDown = {this.onModuleMouseDown} 
						projects = {this.state.projectsObject}
						modules = {this.state.modulesObject}
						selectedProjectID = {this.state.selectedProjectID}/>
				</div>
				<div id="main">
					<div id="header">
						<Tools 
							selectedProject = {this.state.projectsObject[this.state.selectedProjectID]}
							deleteProject = {this.deleteProject}/>
					</div>
					<div id="workspace">
						<Workspace 
							ref = "workspace" 
							className = "ui-module workspace pattern" 
							handleComponentDrop = {this.handleComponentDrop} 
							handleWireDrop = {this.handleNewWireDrop} 
							deleteWires = {this.deleteWires} 
							protocols = {this.state.protocolsObject} 
							selectedProject = {this.state.projectsObject[this.state.selectedProjectID]} 
							modules = {this.state.modulesObject}/>
					</div>
				</div>
				{componentInProgress}
			</div>
		);
	},
});

var ComponentInProgress = React.createClass({

	render: function() {
		var style = {
			width: this.props.thisWidth,
			height: this.props.thisHeight,
			top: this.props.thisY - (this.props.thisHeight / 2),
			left: this.props.thisX - (this.props.thisWidth / 2)
		}
		return (
			<div 
				className="componentInProgress" 
				style={style}>
  				<div className="componentName">
  					{this.props.moduleName}
  				</div>
  				<div className="componentVersion">
  					{this.props.moduleVersion}
  				</div>
  			</div>
			
		);
	},
});

var Home = React.createClass({
	render: function() {	
		return (
			<div className="home">
				<img className="logo" src="img/logo.png"/>
				<h1>IO Visor Console</h1>
				<img className="app-actions" src="img/hamburger.svg"/>
			</div>
		);
	},
});

var PrimaryNav = React.createClass({
	render: function() {	
		return (
			<div className="primaryNav">
				<ProjectSection 
					createNewProject = {this.props.createNewProject} 
					onProjectClick = {this.props.onProjectClick} 
					projects = {this.props.projects} 
					selectedProjectID = {this.props.selectedProjectID}/>

				<ModuleSection 
					modules = {this.props.modules}
					onModuleMouseDown = {this.props.onModuleMouseDown} />
			</div>
		);
	},
});

var ProjectSection = React.createClass({
	getDefaultProps: function() {
    	return {
    		projectTemplate: {
    			name: "Untitled Project",
    			version: "0.0.1",
    			description: null,
    			topology: {
    				host_interfaces: {
    					"host_interface-1": {
    						mode: "output",
    						protocol: "protocol-1"
    					},
    					"host_interface-2": {
    						mode: "input",
    						protocol: "protocol-2"
    					},
    					"host_interface-3": {
    						mode: "bidirectional",
    						protocol: "protocol-3"
    					}
    				},
    				components: null,
    				wires: null
    			},
    			view: {
    				"host_interface-1": {
    					x: 20,
    					y: 15
    				},
    				"host_interface-2": {
    					x: 130,
    					y: 15
    				},
    				"host_interface-3": {
    					x: 240,
    					y: 15
    				}
    			},
    			users: {
    				johnkelley: "owner"
    			},
    		}
    	};
	},

	handleNewProjectClick: function(){
		this.props.createNewProject(this.props.projectTemplate)
	},

	render: function() {

		var projectsObject = this.props.projects;
		if (projectsObject){
			var projectsCode = [];
			for (var projectID in projectsObject) {
				var thisProject = projectsObject[projectID];
				var projectClass = "project";
				if (projectID == this.props.selectedProjectID){
					projectClass += " selected"
				}
				
      			projectsCode.push(
	      			<div 
	      				className={projectClass} 
	      				key={projectID} 
	      				onClick={this.props.onProjectClick.bind(null, {projectID})}>
      					<h2>
      						<span>{thisProject.name}</span>
      						<span className="version">{thisProject.version}</span>
      					</h2>
      					<div className="projectDetails">{thisProject.details}</div>
      				</div>
      			);
    		};	
		}
		
		return (
			<section className="projects">
				<h1>Projects
					<button 
						onClick = {this.handleNewProjectClick} 
						className="add">+</button>
				</h1>
				<div>{projectsCode}</div>
			</section>
		);
	},
});

var ModuleSection = React.createClass({
	render: function() {	

		var moduleItems = []

		for (var moduleItem in this.props.modules) {
			var thisModuleItem = this.props.modules[moduleItem];
      		moduleItems.push(
      			<ModuleItem
      				key = {moduleItem} 
      				onMouseDown = {this.props.onModuleMouseDown} 
      				moduleID = {moduleItem} 
      				moduleItem = {thisModuleItem}/>
      		);
    	};

    	return (
			<section className="ioModules">
				<h1>IO Modules</h1>
				{moduleItems}
			</section>
		);
	},
});

var ModuleItem = React.createClass({
	render: function() {
		return (
			<div 
				className="moduleItem"
				onMouseDown = {this.props.onMouseDown.bind(null, this.props.moduleID)} >
  				<h2>
  					<span className="name">{this.props.moduleItem.name}</span>
  					<span className="version">{this.props.moduleItem.version}</span>
  				</h2>
  				<div className="moduleDescription">{this.props.moduleItem.description}</div>
      		</div>
		);
	}
});


var Tools = React.createClass({
	handleDeleteProjectClick: function(){
		this.props.deleteProject()
	},

	render: function() {
		var project = "";
		var version = "";

		selectedProjectObject = this.props.selectedProject;

		if (selectedProjectObject){
			project = selectedProjectObject.name;
			version = selectedProjectObject.version;		
		}

		return (
			<div className="tools">
				<span>{project}</span>
				<span className="version">{version}</span>
				<button>Save Version&hellip;</button>
				<button>Duplicate&hellip;</button>
				<button>JSON&hellip;</button>
				<button>Save as Module&hellip;</button>
				<button onClick = {this.handleDeleteProjectClick}>Delete Project</button>
				<div className="buttons">
					<button>Deploy to IO Visor&hellip;</button>
				</div>
			</div>
		);
	},
});

React.render(<IOConsole></IOConsole>, document.body);