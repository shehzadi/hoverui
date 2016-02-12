var IOConsole = React.createClass({
	getInitialState: function() {
		var projectsSrc = this.getLocalSetting("projectsSrc") || "https://boiling-torch-3324.firebaseio.com/v3/users/maxb/projects";
		var modulesSrc = this.getLocalSetting("modulesSrc") || "https://boiling-torch-3324.firebaseio.com/v3/modules";
        
        var categoryVisibility = this.getLocalSetting("categoryVisibility") || {};
		
        var selectedProjectID = this.getLocalSetting("selectedProjectID");

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
            popoverTarget: false, 
    		startX: 0,
    		startY: 0,
    		cursorX: 0,
    		cursorY: 0,
    		selectedProjectID: selectedProjectID,
    		categoryVisibility: categoryVisibility,
            projectsSrc: projectsSrc,
            modulesSrc: modulesSrc
    	};
  	},

  	getDefaultProps: function() {
    	return {
    		componentInProgress: {
    			width: 145,
    			height: 76
    		},
            policyInProgress: {
                width: 200,
                height: 120
            }
    	};
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
    },

    updateDataSources: function(payload){
        if (payload.projectsSrc != this.state.projectsSrc){     
            this.firebaseProjectsRef.off();
            this.firebaseProjectsRef = new Firebase(payload.projectsSrc);

            this.firebaseProjectsRef.on("value", function(dataSnapshot) {                
                var isSeeded = dataSnapshot.exists() && dataSnapshot.val() !== true;
                if (!isSeeded){
                    this.firebaseProjectsRef.set(projectsSeed);
                }
                else {
                    this.handleFirebaseProjects(dataSnapshot)
                }       
            }.bind(this));

            this.setLocalSetting("projectsSrc", payload.projectsSrc);
            this.setState({
                projectsSrc: payload.projectsSrc
            });
        }

        if (payload.modulesSrc != this.state.modulesSrc){
            this.firebaseModulesRef.off();
            this.firebaseModulesRef = new Firebase(payload.modulesSrc);

            //check for existance of seed data (at least)
            this.firebaseModulesRef.on("value", function(dataSnapshot) {
                var isSeeded = dataSnapshot.exists() && dataSnapshot.child("data").exists() && dataSnapshot.child("shared").exists();
                if (!isSeeded){
                    this.firebaseModulesRef.set(modulesSeed);
                }
                else {
                    this.handleFirebaseModules(dataSnapshot)
                }
            }.bind(this));

            this.setLocalSetting("modulesSrc", payload.modulesSrc);
            this.setState({
                modulesSrc: payload.modulesSrc
            }); 
        }
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

        // check for selected project validity
        var currentSelectedProjectID = this.state.selectedProjectID;
        var isValidSelectionID = _.includes(sortedProjectArray, currentSelectedProjectID);
        var targetSelectionID = currentSelectedProjectID;
        if (!isValidSelectionID){
            targetSelectionID = sortedProjectArray[0]
        }

        this.setState({
            selectedProjectID: targetSelectionID,
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

    openSettings: function(){
        console.log("open settings")
    },

    handleActions: function(event){
        var eventName = event.target.name;
        if (eventName == "newProject"){this.createNewProject(projectTemplate)}
        if (eventName == "repositories"){this.openModal("librariesSettings")}
        
    },

   	deleteWire: function(interfaceToken) {
   		var selectedProject = this.state.projectsObject[this.state.selectedProjectID];
   		var updatedProjectTopologyObject = _.cloneDeep(selectedProject.topology);

        var thisWire = interfaceToken.wire;
        var interface1Component = interfaceToken.componentID;
        var interface1Interface = interfaceToken.interfaceID || null;

        var interface2Component = interfaceToken.wireTo.component;
        var interface2Interface = interfaceToken.wireTo.ifc || null;

        updatedProjectTopologyObject.wires[thisWire] = null;

        if (interface1Interface){
            updatedProjectTopologyObject.components[interface1Component].interfaces[interface1Interface] = null
        }

        if (interface2Interface){
            updatedProjectTopologyObject.components[interface2Component].interfaces[interface2Interface] = null
        }

		this.firebaseProjectsRef.child(this.state.selectedProjectID).child("topology").set(updatedProjectTopologyObject);

    },

	handleNewWireDrop: function(tokenObject1, tokenObject2) {
		var selectedProject = this.state.projectsObject[this.state.selectedProjectID];
        var tokenArray = [tokenObject1, tokenObject2];
		newProjectTopologyObject = _.cloneDeep(selectedProject.topology);

        var newWire = [];

        _.forEach(tokenArray, function(token) {
            var newInterface = {
                "component": token.componentID || token.hostComponentID,
                "ifc": null
            }
            if (token.componentID){
                newInterface.ifc = "ifc-" + ioid();
                if (!newProjectTopologyObject.components[token.componentID].interfaces){
                    newProjectTopologyObject.components[token.componentID]["interfaces"] = {};
                }
                newProjectTopologyObject.components[token.componentID].interfaces[newInterface.ifc] = {
                    "mode": token.mode,
                    "protocol": token.protocol
                }
            }
            newWire.push(newInterface)
        });

        if (!newProjectTopologyObject.wires){
            newProjectTopologyObject.wires = {};
        }

        var newWireID = "wire-" + ioid();
        newProjectTopologyObject.wires[newWireID] = newWire;

		this.firebaseProjectsRef.child(this.state.selectedProjectID).child("topology").set(newProjectTopologyObject);

    },

	handleNewObjectDrop: function(moduleID, posX, posY){
        var moduleObject = this.state.modulesObject[moduleID];
        var moduleType = moduleObject.type || "component";
     	var newProjectViewObject = _.cloneDeep(this.state.projectsObject[this.state.selectedProjectID].view) || {};
    	var newProjectComponentsObject = _.cloneDeep(this.state.projectsObject[this.state.selectedProjectID].topology.components) || {};
        var newProjectPoliciesObject = _.cloneDeep(this.state.projectsObject[this.state.selectedProjectID].policies) || {};
        var projectDependenciesObject = this.state.projectsObject[this.state.selectedProjectID].dependencies || {};
        
        if (moduleType == "component"){
            var newID = "comp-" + ioid();
            var newViewData = {
                "x": posX,
                "y": posY
            };
            var newComponentData = {
                "module": moduleID
            };
            newProjectComponentsObject[newID] = newComponentData;
        }
        else if (moduleType == "policy"){
            var newID = "policy-" + ioid();
            var newViewData = {
                "left": posX,
                "top": posY,
                "width": this.props.policyInProgress.width,
                "height": this.props.policyInProgress.height
            };
            var newPolicyData = {
                "module": moduleID
            };
            newProjectPoliciesObject[newID] = newPolicyData;
        }        

        //dependencies
        if (!projectDependenciesObject[moduleID]){ // module is NOT already a dependency, so deal with dependencies
            var newProjectDependenciesObject = _.cloneDeep(projectDependenciesObject) || {};
            var moduleClone = _.cloneDeep(this.state.modulesObject[moduleID]); //must exist because user dragged and dropped
            var moduleCloneDependencies = moduleClone.dependencies || {};

            newProjectDependenciesObject[moduleID] = moduleClone;//original module copied to project
            
            //move modules's nested dependencies to top-level dependencies and change nested dependent modules to "true"
            _.forEach(moduleCloneDependencies, function(nestedModuleObject, nestedModuleID){
                if (!projectDependenciesObject[nestedModuleID]){ // nested module is not already a dependency
                    //add module (data from parent module) to project dependencies
                    newProjectDependenciesObject[nestedModuleID] = _.cloneDeep(moduleCloneDependencies[nestedModuleID]);
                    //
                }
                // change nested module ID value to true
                moduleCloneDependencies[nestedModuleID] = true
            });

            this.firebaseProjectsRef.child(this.state.selectedProjectID).child("dependencies").set(newProjectDependenciesObject);
        }

    	newProjectViewObject[newID] = newViewData;
    	this.firebaseProjectsRef.child(this.state.selectedProjectID).child("view").set(newProjectViewObject);
        this.firebaseProjectsRef.child(this.state.selectedProjectID).child("topology").child("components").set(newProjectComponentsObject);
        this.firebaseProjectsRef.child(this.state.selectedProjectID).child("policies").set(newProjectPoliciesObject)
	},

    handlePolicyUpdate: function(id, left, top, height, width) {
        var newProjectObject = _.cloneDeep(this.state.projectsObject[this.state.selectedProjectID]);
        var policyView = newProjectObject.view[id];
        policyView.left = left;
        policyView.top = top;
        policyView.height = height;
        policyView.width = width;

        if (policyView.left <= 0 || policyView.top <= headerHeight){
            this.deleteObject(id) 
        }
        else {
            this.firebaseProjectsRef.child(this.state.selectedProjectID).set(newProjectObject)
        }      
    },

    updatePoliciesData: function(policiesData) {
        var newProjectPoliciesObject = _.cloneDeep(this.state.projectsObject[this.state.selectedProjectID].policies) || {};
        _.forEach(policiesData, function(policy, policyID){
            var computedInterfaces = policy.computedInterfaces;
            _.set(newProjectPoliciesObject[policyID], 'interfaces', computedInterfaces);
        })
        this.firebaseProjectsRef.child(this.state.selectedProjectID).child("policies").set(newProjectPoliciesObject)
    },

	handleObjectDrop: function(objectID, deltaX, deltaY) {
    	var newProjectObject = _.cloneDeep(this.state.projectsObject[this.state.selectedProjectID]);

    	if (objectID.indexOf('host') == 0){
            newProjectObject.view[objectID].x += deltaX;
            newProjectObject.view[objectID].y += deltaY;

    		if (newProjectObject.view[objectID].x <= 2){
				newProjectObject.view[objectID].x = 2
	    	}
	    	if (newProjectObject.view[objectID].y <= headerHeight + 2){
				newProjectObject.view[objectID].y = headerHeight + 2	
	    	}

    		this.firebaseProjectsRef.child(this.state.selectedProjectID).set(newProjectObject)
    	}
    	
	    else if (objectID.indexOf('comp') == 0){
            newProjectObject.view[objectID].x += deltaX;
            newProjectObject.view[objectID].y += deltaY;

	    	if (newProjectObject.view[objectID].x <= 0 || newProjectObject.view[objectID].y <= headerHeight){
				this.deleteObject(objectID)	
	    	}

	    	else {
	    		this.firebaseProjectsRef.child(this.state.selectedProjectID).set(newProjectObject)
	    	}
	    }

       /* else if (objectID.indexOf('policy') == 0){
            var policyData = newProjectObject.view[objectID];
            policyData.left += deltaX;
            policyData.top += deltaY;
            if (policyData.left <= 0 || policyData.top <= headerHeight){
                this.deleteObject(objectID)  
            }

            else {
                //var newArray = getInterfaceArray(policy, components, hostComponents);
                this.firebaseProjectsRef.child(this.state.selectedProjectID).set(newProjectObject)
            }
        }*/
    },

   	deleteObject: function(objectID) {
        var selectedProject = this.state.projectsObject[this.state.selectedProjectID];        

        var newProjectObject = _.cloneDeep(selectedProject);
   		

        if (objectID.indexOf('comp') == 0){
            var moduleDependencyID = selectedProject.topology.components[objectID].module;

            //delete component from topology
            delete newProjectObject.topology.components[objectID];

            //find wires and delete them
            if (newProjectObject.topology.wires){
                for (var wire in newProjectObject.topology.wires){
                    var wireObject = newProjectObject.topology.wires[wire];
                    if (wireObject[0].component == objectID){
                        newProjectObject.topology.wires[wire] = null;
                        //find interface on other component and delete
                        if (newProjectObject.topology.components[wireObject[1].component]){
                            newProjectObject.topology.components[wireObject[1].component].interfaces[wireObject[1].ifc] = null
                        }
                    }
                    if (wireObject[1].component == objectID){
                        newProjectObject.topology.wires[wire] = null;
                        //find interface on other component and delete
                        if (newProjectObject.topology.components[wireObject[0].component]){
                            newProjectObject.topology.components[wireObject[0].component].interfaces[wireObject[0].ifc] = null
                        }
                    }
                }
            }
        }
        else if (objectID.indexOf('policy') == 0){
            var moduleDependencyID = selectedProject.policies[objectID].module;

            //delete policy from policies
            delete newProjectObject.policies[objectID];
        }
       	
        //delete view data
        delete newProjectObject.view[objectID];

        //manage dependencies
        var topologyComponents = newProjectObject.topology.components;
        var policies = newProjectObject.policies;
   		
        var moduleArray = [];
        _.forEach(topologyComponents, function(component){
            var module = component.module;
            moduleArray.push(module);
        });
        _.forEach(policies, function(policy){
            var module = policy.module;
            moduleArray.push(module);
        });
        moduleArray = _.uniq(moduleArray);



        _.forEach(moduleArray, function(id){
            var directDependency = selectedProject.dependencies[id];
            if (directDependency.dependencies){
                _.forEach(directDependency.dependencies, function(value, key){
                    moduleArray.push(key)     
                });
            }
        });
        moduleArray = _.uniq(moduleArray);

        var newProjectDependencies = {};
        _.forEach(moduleArray, function(id){
            var newDependency = selectedProject.dependencies[id];
            newProjectDependencies[id] = newDependency          
        });
        
        newProjectObject.dependencies = newProjectDependencies;
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
        this.setLocalSetting("selectedProjectID", newProjectID);
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
            this.setLocalSetting("selectedProjectID", newSelectedProject);		
		}
    },

   	renameProject: function(newName) {
		this.firebaseProjectsRef.child(this.state.selectedProjectID).child('name').set(newName)		
    },

    handleCategoryClick: function(category, isOpen) {
        var newVisibility = _.cloneDeep(this.state.categoryVisibility);
        newVisibility[category] = !isOpen;
        this.setState({
            categoryVisibility: newVisibility
        });
        this.setLocalSetting("categoryVisibility", newVisibility);
    },

    handleProjectClick: function(payload) {
        if (payload.projectID != this.state.selectedProjectID){
            this.setState({
                selectedProjectID: payload.projectID
            });
            this.setLocalSetting("selectedProjectID", payload.projectID);
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

    onMouseMove: function(event) { //captured on document
        var cursorX = event.pageX;
        var cursorY = event.pageY;
        var deltaX = cursorX - this.state.startX;
        var deltaY = cursorY - this.state.startY;
        var distance = Math.abs(deltaX) + Math.abs(deltaY);

        if (this.state.dragging == false && distance > 4){ //dragging
            this.setState({
                dragging: this.state.mouseDown
            });
        }

        if (this.state.dragging){   
            this.setState({
                cursorX: cursorX,
                cursorY: cursorY
            });
        }
    },

	onMouseUp: function(event) { //captured on document
		var dropID = this.state.dragging;
        var dropObject = this.state.modulesObject[dropID];

        var dropType = dropObject.type || "component";

		var workspaceElement = this.refs.workspace.getDOMNode().getBoundingClientRect();
		var workspaceOriginX = workspaceElement.left;
		var workspaceOriginY = workspaceElement.top;

        if (dropType == "component"){
            var dims = this.props.componentInProgress
        }
        else if (dropType == "policy") {
            var dims = this.props.policyInProgress
        }

		var newComponentX = event.pageX - workspaceOriginX - (dims.width / 2);
		var newComponentY = event.pageY - workspaceOriginY - (dims.height / 2);

		if (newComponentX > 0 && newComponentY > headerHeight){
			this.handleNewObjectDrop(this.state.dragging, newComponentX, newComponentY)
		}

        this.removeDocumentEvents();

		this.setState({
    		mouseDown: false,
    		dragging: false
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

    closePopover: function() {
        this.setState({
            popoverTarget: false,
        }); 
    },

    openPopover: function(event) {
        this.setState({
            popoverTarget: event.target,
        }); 
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
    	this.cancelModal(modalName)
    },

    setLocalSetting: function(settingName, newObject){
        var setting = JSON.stringify(newObject);
        window.localStorage.setItem(settingName, setting);
    },

    getLocalSetting: function(settingName){
        var setting = window.localStorage.getItem(settingName);
        setting = JSON.parse(setting);
        return setting
    },

    saveAsModule: function(payload){
    	// get interfaces from wired host interfaces
    	// loop through wires and save component id if component is a host interface
        var project = this.state.projectsObject[this.state.selectedProjectID];
    	var projectTopology = project.topology;
        var projectComponents = projectTopology.components;
    	var projectWires = projectTopology.wires;
    	var projectHostInterfaces = projectTopology.host_interfaces;
        var projectDependencies = project.dependencies;

    	var hostInterfaceArray = [];
    	for (var wire in projectWires) {
    		thisWireObject = projectWires[wire];
    		var component1 = thisWireObject[0].component;
    		var component2 = thisWireObject[1].component;
    		if (component1.indexOf('host') == 0){ 
    			hostInterfaceArray.push(component1)
    		}
    		if (component2.indexOf('host') == 0){ 
    			hostInterfaceArray.push(component2)
    		}
    	}
    	// get mode and protocol of host interface
    	var newModuleInterfaceArray = [];
    	for (var i = 0; i < hostInterfaceArray.length; i++){
    		thisInterface = hostInterfaceArray[i];
    		thisInterfaceObject = projectHostInterfaces[thisInterface];
    		var inverseMode = "bi";
    		if (thisInterfaceObject.mode == "out"){
    			inverseMode = "in"
    		}
    		if (thisInterfaceObject.mode == "in"){
    			inverseMode = "out"
    		}
    		newModuleInterfaceArray.push({
                "capacity": 1,
                "id": thisInterface,
                "mode": inverseMode,
                "protocol": thisInterfaceObject.protocol
            });
    	}

    	var newModuleID = "module-" + guid();

    	var categoriesObject = {};

        var isUncategorised = _.isEmpty(payload.categories);

        if (isUncategorised){
            categoriesObject = null
        }
        else {
            for (var category in payload.categories) {
                var thisCategory = payload.categories[category];
                categoriesObject[thisCategory] = true
            } 
        }

        var topologyObject = {
            "interfaces": newModuleInterfaceArray,
            "components": projectComponents,
            "wires": projectWires
        };


    	var moduleObject = {
    		name: payload.name,
    		description: payload.description,
    		categories: categoriesObject,
    		topology: topologyObject,
    		version: "0.0.1",
            dependencies: projectDependencies
    	}

    	this.firebaseModulesRef.child('data').child(newModuleID).set(moduleObject);

        //add module id to the relevant categories
        var categoryObject = {};
        if (isUncategorised){   
            categoryObject[newModuleID] = true;
            this.firebaseModulesRef.child('shared').child('categories').child('uncategorised').child('modules').update(categoryObject);
        }
        else {
        	for (var category in payload.categories) {
        		var thisCategory = payload.categories[category];
        		categoryObject[newModuleID] = true;
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
        var policyInProgress;
		if (this.state.dragging){
            var moduleID = this.state.mouseDown;
            var moduleObject = this.state.modulesObject[moduleID];
			var moduleName = moduleObject.name;
			var moduleVersion = moduleObject.version;
            var moduleType = moduleObject.type || "component";

            if (moduleType == "policy"){
               policyInProgress = <PolicyInProgress
                    moduleID = {moduleID} 
                    module = {moduleObject} 
                    dims = {this.props.policyInProgress} 
                    thisX = {this.state.cursorX} 
                    thisY = {this.state.cursorY}/>
            }
            else if (moduleType == "component"){
                componentInProgress = <ComponentInProgress
                    thisModuleID = {moduleID} 
                    moduleName = {moduleName} 
                    moduleVersion = {moduleVersion} 
                    thisWidth = {this.props.componentInProgress.width} 
                    thisHeight = {this.props.componentInProgress.height} 
                    thisX = {this.state.cursorX} 
                    thisY = {this.state.cursorY}/>
            }			
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

        var popover = null;
        if (this.state.popoverTarget != false){
            popover = (
                <Popover
                    handleActions = {this.handleActions} 
                    closePopover = {this.closePopover} 
                    popoverTarget = {this.state.popoverTarget}/>
            );
        }

		return (
			<div id="IOConsole">
				<div id="navigation">
					<Home 
                        popoverTarget = {this.state.popoverTarget} 
                        openPopover = {this.openPopover}/>
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
							handleObjectDrop = {this.handleObjectDrop} 
                            handlePolicyUpdate = {this.handlePolicyUpdate} 
                            updatePoliciesData = {this.updatePoliciesData}
							handleWireDrop = {this.handleNewWireDrop} 
							deleteWire= {this.deleteWire}
							protocols = {this.state.protocolsObject} 
							selectedProject = {this.state.projectsObject[this.state.selectedProjectID]}/>
					</div>
				</div>
				{componentInProgress}
                {policyInProgress}
				{modalDialogues}
                {popover}
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
	openPopover: function(event){
		this.props.openPopover(event)
	},

	render: function() {
        var addObjectClass = "add";
        var homeActionsClass = "app-actions";
        var openPopoverClass = " isOpenPopover"

        if (this.props.popoverTarget.name == "homeActions"){
            homeActionsClass += openPopoverClass
        }
        if (this.props.popoverTarget.name == "addObject"){
            addObjectClass += openPopoverClass
        }
		return (
			<div className="home">
				<img className="logo" src="img/logo.png"/>
				<h1>IO Visor Console</h1>
				<button className={addObjectClass} name="addObject" onClick={this.openPopover}>+</button>
				<button className={homeActionsClass} name="homeActions" onClick={this.openPopover}></button>
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
				onMouseDown = {this.props.onMouseDown.bind(null, this.props.moduleID)}>
				<div className="content">
	  				<h3>
	  					<span className="name">{this.props.moduleItem.name}</span>
	  					<span className="version">{this.props.moduleItem.version}</span>
	  				</h3>
	  				<div className="moduleDescription">{this.props.moduleItem.description}</div>
  				</div>
  				<div className="affordance">
  				</div>
      		</div>
		);
	}
});

React.render(<IOConsole></IOConsole>, document.body);