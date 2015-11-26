var IOConsole = React.createClass({
	getInitialState: function() {
		var projectsSrc = this.getSetting("projectsSrc") || "https://boiling-torch-3324.firebaseio.com/development/users/jdoe/projects";
		var modulesSrc = this.getSetting("modulesSrc") || "https://boiling-torch-3324.firebaseio.com/development/modules";
		var selectedProjectID = this.getSetting("selectedProjectID");

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
    		selectedProjectID: selectedProjectID,
    		categoryVisibility: {},
            projectsSrc: projectsSrc,
            modulesSrc: modulesSrc
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

    openSettings: function(){
        console.log("open settings")
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

        this.setState({
            selectedProjectID: newProjectID
        });
        this.setSetting("selectedProjectID", newProjectID);
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

			this.firebaseProjectsRef.child(this.state.selectedProjectID).remove();
			this.setState({
                selectedProjectID: newSelectedProject
            });
            this.setSetting("selectedProjectID", newSelectedProject);
			
		}
    },

   	renameProject: function(newName) {
		this.firebaseProjectsRef.child(this.state.selectedProjectID).child('name').set(newName)		
    },

    handleFirebaseProjects: function(dataSnapshot) {
        var rootProjectsObject = dataSnapshot.val();
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
    },

    handleFirebaseModules: function(dataSnapshot) {
        var rootModulesObject = dataSnapshot.val();
        var sortedModuleArray = [];

        var modulesObject = rootModulesObject.data;
        for (var key in modulesObject) {
            sortedModuleArray.push({
                key: key,
                name: modulesObject[key].name
            })
        };
        sortedModuleArray.sort(function(a, b){
            return a.name.localeCompare(b.name)
        });
        sortedModuleArray = sortedModuleArray.map(function(obj){ 
           return obj.key;
        });

        var categoriesObject = rootModulesObject.shared.categories;
        var protocolsObject = rootModulesObject.shared.protocols;

        this.setState({
            modulesObject: modulesObject,
            sortedModuleArray: sortedModuleArray,
            categoriesObject: categoriesObject,
            protocolsObject: protocolsObject
        }); 
    },

  	componentWillMount: function() {
		this.firebaseProjectsRef = new Firebase(this.state.projectsSrc);
		this.firebaseProjectsRef.on("value", function(dataSnapshot) {
            this.handleFirebaseProjects(dataSnapshot)
        }.bind(this));

		this.firebaseModulesRef = new Firebase(this.state.modulesSrc);
		this.firebaseModulesRef.on("value", function(dataSnapshot) {
			this.handleFirebaseModules(dataSnapshot)
		}.bind(this));

		if (this.state.selectedProjectID == null){
        	var newSelectedProject = this.state.sortedProjectArray[0];
        	this.setSetting("selectedProjectID", newSelectedProject);
        	this.setState({
                selectedProjectID: this.state.sortedProjectArray[0]
            });
        }
	},

    handleCategoryClick: function(category, isOpen) {
        var newVisibility = _.cloneDeep(this.state.categoryVisibility);
        newVisibility[category] = !isOpen;
        this.setState({
            categoryVisibility: newVisibility
        });
        this.setSetting("categoryVisibility", newVisibility);
    },

    handleProjectClick: function(payload) {
        if (payload.projectID != this.state.selectedProjectID){
            this.setState({
                selectedProjectID: payload.projectID
            });
            this.setSetting("selectedProjectID", payload.projectID);
        } 
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

    openModal: function(modalName) {
    	var newArray = _.cloneDeep(this.state.modalArray);
    	newArray.push(modalName);
    	this.setState({
			modalArray: newArray,
		});	
    },

    cancelModal: function(modalName) {
    	var newArray = _.cloneDeep(this.state.modalArray);
    	var indexToRemove = newArray.indexOf(modalName);
    	newArray.splice(indexToRemove, 1);
    	this.setState({
			modalArray: newArray,
		});	
    },

    submitModal: function(modalName, payload) {
    	if (modalName == "saveAsModule"){
    		this.saveAsModule(payload)
    	}
        if (modalName == "librariesSettings"){
            
            this.updateDataSources(payload)
        }
        console.log("closing");
    	this.cancelModal(modalName)
    },

    updateDataSources: function(payload){
        if (payload.modulesSrc != this.state.modulesSrc){
            this.firebaseModulesRef.off();
            this.firebaseModulesRef = new Firebase(payload.modulesSrc);
            this.firebaseModulesRef.on("value", function(dataSnapshot) {
                this.handleFirebaseModules(dataSnapshot)
            }.bind(this));

            this.setSetting("modulesSrc", payload.modulesSrc);

            this.setState({
                modulesSrc: payload.modulesSrc
            }); 
        }
        if (payload.projectsSrc != this.state.projectsSrc){
             
            this.firebaseProjectsRef.off();
            this.firebaseProjectsRef = new Firebase(payload.projectsSrc);
            this.firebaseProjectsRef.on("value", function(dataSnapshot) {
                this.handleFirebaseProjects(dataSnapshot)
            }.bind(this));

            this.setSetting("projectsSrc", payload.projectsSrc);
            window.localStorage.removeItem("selectedProjectID"); 
        
            this.setState({
                projectsSrc: payload.projectsSrc,
                selectedProjectID: null
            });  
        }
    },

    setSetting: function(settingName, newObject){
        var setting = JSON.stringify(newObject);
        window.localStorage.setItem(settingName, setting);
    },

    getSetting: function(settingName){
        var setting = window.localStorage.getItem(settingName);
        setting = JSON.parse(setting);
        return setting
    },

    saveAsModule: function(payload){
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

    	var moduleID = "module-" + guid();

        //add module to module object
    	var categoriesObject = {};

        var isUncategorised = _.isEmpty(payload.categories);

        if (isUncategorised){
            categoriesObject["uncategorised"] = true
        }
        else {
            for (var category in payload.categories) {
                var thisCategory = payload.categories[category];
                categoriesObject[thisCategory] = true
            } 
        }

    	var moduleObject = {
    		name: payload.name,
    		description: payload.description,
    		categories: categoriesObject,
    		interfaces: interfaceObject,
    		version: "0.0.1"
    	}

        console.log(moduleObject);

    	this.firebaseModulesRef.child('data').child(moduleID).set(moduleObject);

        //add module id to the relevant categories
        var categoryObject = {};
        if (isUncategorised){   
            categoryObject[moduleID] = true;
            this.firebaseModulesRef.child('shared').child('categories').child('uncategorised').child('modules').update(categoryObject);
        }
        else {
        	for (var category in payload.categories) {
        		var thisCategory = payload.categories[category];
        		categoryObject[moduleID] = true;
        		this.firebaseModulesRef.child('shared').child('categories').child(thisCategory).child('modules').update(categoryObject);
        	}
        }
    },

	render: function() {
        if (_.isEmpty(this.state.modulesObject) || _.isEmpty(this.state.projectsObject)){
            return false
        }

        var nProjects = Object.keys(this.state.projectsObject).length;

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
                    projectsSrc = {that.state.projectsSrc} 
                    modulesSrc = {that.state.modulesSrc}
                    key = {modalName} 
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
						createNewProject = {this.createNewProject}
                        openModal = {this.openModal}/>
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
                            nProjects = {nProjects} 
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
    			}
    		}
    	};
	},

	handleNewProjectClick: function(){
		this.props.createNewProject(this.props.projectTemplate)
	},

    handleMenuControlClick: function(){
        this.props.openModal("librariesSettings")
    },

	render: function() {	
		return (
			<div className="home">
				<img className="logo" src="img/logo.png"/>
				<h1>IO Visor Console</h1>
				<button className="add" onClick={this.handleNewProjectClick}>+</button>
				<button className="app-actions" onClick={this.handleMenuControlClick}></button>
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
		var categoryItems = [];

		for (var category in this.props.categories) {
			var moduleList = this.props.categories[category].modules;
            var isOpen = false;
            if (this.props.categoryVisibility[category]){
                isOpen = this.props.categoryVisibility[category];

            }
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