var IOConsole = React.createClass({
	getInitialState: function() {
    	return {
    		projectsObject: {},
    		sortedProjectArray: [],
    		modulesObject: {},
    		sortedModuleArray: [],
    		categoriesObject: {},
    		protocolsObject: {},
    		mouseDown: false,
    		dragging: false,
    		modalArray: [], 
    		startX: 0,
    		startY: 0,
    		cursorX: 0,
    		cursorY: 0,
    		selectedProjectID: null,
    		categoryVisibility: {}
    	};
  	},

  	getDefaultProps: function() {
    	return {
    		componentInProgress: {
    			width: 145,
    			height: 76
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
	    	if (newProjectObject.view[dropComponent].y <= headerHeight){
				newProjectObject.view[dropComponent].y = headerHeight + 2	
	    	}

    		this.firebaseProjectsRef.child(this.state.selectedProjectID).set(newProjectObject)
    	}
    	
	    else {

	    	if (newProjectObject.view[dropComponent].x <= 0 || newProjectObject.view[dropComponent].y <= headerHeight){
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
   		var confirmProjectDeletion = confirm("Delete all versions of " + this.state.projectsObject[this.state.selectedProjectID].name + "?");
		if (confirmProjectDeletion == true) {
		    
			var indexOfSelectedProject = _.indexOf(this.state.sortedProjectArray, this.state.selectedProjectID);
			
			var newSelectedProjectIndex = indexOfSelectedProject - 1;
			if (newSelectedProjectIndex == -1){
				newSelectedProjectIndex = 1
			}
			var newSelectedProject = this.state.sortedProjectArray[newSelectedProjectIndex];
			console.log(newSelectedProject);

			this.firebaseProjectsRef.child(this.state.selectedProjectID).remove();
			this.firebaseUserRef.child('settings').child('selectedProject').set(newSelectedProject);
			
		}
    },

   	renameProject: function(newName) {
		this.firebaseProjectsRef.child(this.state.selectedProjectID).child('name').set(newName)		
    },

  	componentWillMount: function() {
  		var rootProjectsObject = {};
  		var rootModulesObject = {};
  		var rootCategoriesObject = {};
  		var rootProtocolsObject = {};
  		var rootUserObject = {};

		this.firebaseProjectsRef = new Firebase("https://boiling-torch-3324.firebaseio.com/projects");
		this.firebaseProjectsRef.on("value", function(dataSnapshot) {
			rootProjectsObject = dataSnapshot.val();

			var sortedProjectArray = [];
			for (var key in rootProjectsObject) {
				sortedProjectArray.push({
					key: key,
					name: rootProjectsObject[key].name
				})
			};

			sortedProjectArray.sort(function(a, b){
				return a.name.localeCompare(b.name)
			});

			sortedProjectArray = sortedProjectArray.map(function(obj){ 
			   return obj.key;
			});

			this.setState({
				projectsObject: rootProjectsObject,
				sortedProjectArray: sortedProjectArray
			});		
		}.bind(this));

		this.firebaseModulesRef = new Firebase("https://boiling-torch-3324.firebaseio.com/modules");
		this.firebaseModulesRef.on("value", function(dataSnapshot) {
			rootModulesObject = dataSnapshot.val();

			var sortedModuleArray = [];
			for (var key in rootModulesObject) {
				sortedModuleArray.push({
					key: key,
					name: rootModulesObject[key].name
				})
			};

			sortedModuleArray.sort(function(a, b){
				return a.name.localeCompare(b.name)
			});

			sortedModuleArray = sortedModuleArray.map(function(obj){ 
			   return obj.key;
			});

			this.setState({
				modulesObject: rootModulesObject,
				sortedModuleArray: sortedModuleArray
			});
		}.bind(this));

		this.firebaseCategoriesRef = new Firebase("https://boiling-torch-3324.firebaseio.com/categories");
		this.firebaseCategoriesRef.on("value", function(dataSnapshot) {
			rootCategoriesObject = dataSnapshot.val();

			this.setState({
				categoriesObject: rootCategoriesObject
			});
		}.bind(this));

		this.protocolsRef = new Firebase("https://boiling-torch-3324.firebaseio.com/protocols");
		this.protocolsRef.on("value", function(dataSnapshot) {
			rootProtocolsObject = dataSnapshot.val();
			this.setState({
				protocolsObject: rootProtocolsObject
			});
		}.bind(this));

		this.firebaseUserRef = new Firebase("https://boiling-torch-3324.firebaseio.com/users/johnkelley");
		this.firebaseUserRef.on("value", function(dataSnapshot) {
			rootUserObject = dataSnapshot.val();
			this.setState({
				selectedProjectID: rootUserObject.settings.selectedProject,
				categoryVisibility: rootUserObject.settings.categoryVisibility
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

		if (newComponentX > 0 && newComponentY > headerHeight){
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
			this.firebaseUserRef.child('settings').child('selectedProject').set(payload.projectID)
        }  
    },

    openModal: function(modalName) {
    	var newArray = _.cloneDeep(this.state.modalArray);
    	newArray.push(modalName);
    	this.setState({
			modalArray: newArray,
		});	
    },

    cancelModal: function(modalName) {
    	console.log(modalName);
    	var newArray = _.cloneDeep(this.state.modalArray);
    	var indexToRemove = newArray.indexOf(modalName);
    	newArray.splice(indexToRemove, 1);
    	this.setState({
			modalArray: newArray,
		});	
    },

    submitModal: function(modalName, payload) {
    	console.log(modalName);
    	if (modalName == "saveAsModule"){
    		this.saveAsModule(payload)
    	}
    	this.cancelModal(modalName)
    },

    saveAsModule: function(payload){
    	console.log(payload);
    	// get interfaces from wired host interfaces
    	// loop through wires and save component id if component is a host interface
    	var projectTopology = this.state.projectsObject[this.state.selectedProjectID].topology;
    	var projectWires = projectTopology.wires;
    	var projectHostInterfaces = projectTopology.host_interfaces;
    	var hostInterfaceArray = [];
    	for (var wire in projectWires) {
    		thisWireObject = projectWires[wire];
    		var component1 = thisWireObject["endpoint-1"].component;
    		var component2 = thisWireObject["endpoint-2"].component;
    		if (component1.indexOf('host') == 0){ 
    			hostInterfaceArray.push(component1)
    		}
    		if (component2.indexOf('host') == 0){ 
    			hostInterfaceArray.push(component2)
    		}
    	}
    	// get mode and protocol of host interface
    	var interfaceObject = {};
    	for (var i = 0; i < hostInterfaceArray.length; i++){
    		thisInterface = hostInterfaceArray[i];
    		thisInterfaceObject = projectHostInterfaces[thisInterface];
    		var inverseMode = "bidirectional";
    		if (thisInterfaceObject.mode == "output"){
    			inverseMode = "input"
    		}
    		if (thisInterfaceObject.mode == "input"){
    			inverseMode = "output"
    		}
    		interfaceObject["interface-" + i] = {
    			"mode": inverseMode,
    			"protocol": thisInterfaceObject.protocol
    		}
    	}
    	console.log(interfaceObject)

    },

	handleCategoryClick: function(category, isOpen) {
        this.firebaseUserRef.child('settings').child('categoryVisibility').child(category).set(!isOpen)
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

		var modalDialogues = [];
		if (this.state.modalArray.length > 0){
			var selectedProject = this.state.projectsObject[this.state.selectedProjectID];
			var that = this;
			_.forEach(this.state.modalArray, function(modalName) {
    			var modalDialogue = (<ModalDialogue
					modalName = {modalName} 
					categories = {that.state.categoriesObject} 
					selectedProject = {selectedProject} 
					projectID = {that.state.selectedProjectID} 
					submitModal = {that.submitModal}
					cancelModal = {that.cancelModal}/>
				);

				modalDialogues.push(modalDialogue)
    		});
		}

		//console.log(this.state.categoriesObject);

		return (
			<div id="IOConsole">
				<div id="navigation">
					<Home 
						createNewProject = {this.createNewProject} />
					<PrimaryNav 
						onProjectClick = {this.handleProjectClick} 
						onCategoryClick = {this.handleCategoryClick} 
						onModuleMouseDown = {this.onModuleMouseDown} 
						projects = {this.state.projectsObject} 
						sortedProjectArray = {this.state.sortedProjectArray} 
						modules = {this.state.modulesObject} 
						sortedModuleArray = {this.state.sortedModuleArray} 
						categories = {this.state.categoriesObject} 
						categoryVisibility = {this.state.categoryVisibility} 
						selectedProjectID = {this.state.selectedProjectID}/>

				</div>
				<div id="main">
					<div id="header">
						<Tools 
							selectedProject = {this.state.projectsObject[this.state.selectedProjectID]}
							deleteProject = {this.deleteProject} 
							openModal = {this.openModal}
							renameProject = {this.renameProject}/>
					</div>
					<div id="workspace">
						<Workspace 
							ref = "workspace" 
							className = "ui-module workspace" 
							handleComponentDrop = {this.handleComponentDrop} 
							handleWireDrop = {this.handleNewWireDrop} 
							deleteWires = {this.deleteWires} 
							protocols = {this.state.protocolsObject} 
							selectedProject = {this.state.projectsObject[this.state.selectedProjectID]} 
							modules = {this.state.modulesObject}/>
					</div>
				</div>
				{componentInProgress}
				{modalDialogues}
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
    						mode: "output",
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
    					y: headerHeight + 15
    				},
    				"host_interface-2": {
    					x: 130,
    					y: headerHeight + 15
    				},
    				"host_interface-3": {
    					x: 240,
    					y: headerHeight + 15
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
		return (
			<div className="home">
				<img className="logo" src="img/logo.png"/>
				<h1>IO Visor Console</h1>
				<button 
						onClick = {this.handleNewProjectClick} 
						className="add">+</button>
				<button className="app-actions disabled"></button>
			</div>
		);
	},
});

var PrimaryNav = React.createClass({
	render: function() {	
		return (
			<div className="primaryNav">
				<ProjectSection 
					onProjectClick = {this.props.onProjectClick} 
					projects = {this.props.projects} 
					sortedProjectArray = {this.props.sortedProjectArray} 
					selectedProjectID = {this.props.selectedProjectID}/>

				<ModuleSection 
					modules = {this.props.modules} 
					sortedModuleArray = {this.props.sortedModuleArray} 
					categories = {this.props.categories} 
					onCategoryClick = {this.props.onCategoryClick} 
					categoryVisibility = {this.props.categoryVisibility}
					onModuleMouseDown = {this.props.onModuleMouseDown} />
			</div>
		);
	},
});

var ProjectSection = React.createClass({

	getInitialState: function() {
    	return {
    		isScrollAtTop: true
    	};
  	},

	handleSectionScroll: function() {
		var sectionElement = this.refs.projects.getDOMNode();
		this.setState({
			isScrollAtTop: sectionElement.scrollTop == 0
		});
	},

	render: function() {
		var projectsObject = this.props.projects;
		var sortedProjectArray = this.props.sortedProjectArray;
		if (projectsObject){
			var projectsCode = [];

			for (var i = 0; i < sortedProjectArray.length; i++){
				var projectID = sortedProjectArray[i];
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

		var classString = "projects";
    	if (this.state.isScrollAtTop == false){
    		classString += " scrolled"
    	}
		
		return (
			<section 
				ref = "projects"
				className = {classString}
				onScroll = {this.handleSectionScroll}>
				<h1>Projects
				</h1>
				<div>{projectsCode}</div>
			</section>
		);
	},
});

var ModuleSection = React.createClass({

	getInitialState: function() {
    	return {
    		isScrollAtTop: true
    	};
  	},

	handleSectionScroll: function() {
		var sectionElement = this.refs.ioModules.getDOMNode();
		this.setState({
			isScrollAtTop: sectionElement.scrollTop == 0
		});

	},

	render: function() {	
		var categoryItems = []

		for (var category in this.props.categories) {
			var moduleList = this.props.categories[category].modules;
			var isOpen = this.props.categoryVisibility[category];
      		categoryItems.push(
      			<Category
      				key = {category} 
      				category = {category} 
      				onCategoryClick = {this.props.onCategoryClick} 
      				isOpen = {isOpen}
      				moduleList = {moduleList} 
      				sortedModuleArray = {this.props.sortedModuleArray} 
      				onModuleMouseDown = {this.props.onModuleMouseDown}
      				modules = {this.props.modules}/>
      		);
    	};
    	//console.log(categoryItems);
    	var classString = "ioModules";
    	if (this.state.isScrollAtTop == false){
    		classString += " scrolled"
    	}

    	return (
			<section
				ref = "ioModules" 
				className = {classString} 
				onScroll = {this.handleSectionScroll}>
				<h1>IO Modules</h1>
				{categoryItems}
			</section>
		);
	},
});

var Category = React.createClass({
	onCategoryClick: function() {
		this.props.onCategoryClick(this.props.category, this.props.isOpen)
	},

	render: function() {
		var moduleItems = [];
		var classString = "disclosure";
		var nModulesInCategory = Object.keys(this.props.moduleList).length;
		var contentString = this.props.category + " (" + nModulesInCategory + ")";
		var sortedModuleArray = this.props.sortedModuleArray;
		if (this.props.isOpen){
			for (var i = 0; i < sortedModuleArray.length; i++){
				var thisModuleID = sortedModuleArray[i];
				if(this.props.moduleList[thisModuleID]){
					var thisModuleItem = this.props.modules[thisModuleID];
					moduleItems.push(
	      			<ModuleItem
	      				key = {thisModuleID} 
	      				onMouseDown = {this.props.onModuleMouseDown} 
	      				moduleID = {thisModuleID} 
	      				moduleItem = {thisModuleItem}/>
	      			);
				}
			}

	    	classString += " open"
    	}
    	else {
    		classString += " closed"
    	}

		return (
			<div 
				className="categorySection">
  				<h2
  					onClick={this.onCategoryClick}>
  					<span className={classString}></span>
  					<span className="category">{contentString}</span>
  				</h2>
  				{moduleItems}
      		</div>
		);
	}
});

var ModuleItem = React.createClass({
	render: function() {
		return (
			<div 
				className="moduleItem"
				onMouseDown = {this.props.onMouseDown.bind(null, this.props.moduleID)} >
  				<h3>
  					<span className="name">{this.props.moduleItem.name}</span>
  					<span className="version">{this.props.moduleItem.version}</span>
  				</h3>
  				<div className="moduleDescription">{this.props.moduleItem.description}</div>
      		</div>
		);
	}
});



React.render(<IOConsole></IOConsole>, document.body);