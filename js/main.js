
var IOConsole = React.createClass({
    getInitialState: function() {
        var projectsSrc = this.getLocalSetting("projectsSrc") || "https://boiling-torch-3324.firebaseio.com/v3/users/maxb/projects";
        var modulesSrc = this.getLocalSetting("modulesSrc") || "https://boiling-torch-3324.firebaseio.com/v3/modules";
        var iovisorLoc = this.getLocalSetting("iovisorLoc") || "";
        
        var categoryVisibility = this.getLocalSetting("categoryVisibility") || {};

        var selectedProjectID = this.getLocalSetting("selectedProjectID");
        var projectsIfcMapping = this.getLocalSetting("projectsIfcMapping") || {};

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
            menuTarget: false, 
            popoverTarget: false, 
            startX: 0,
            startY: 0,
            cursorX: 0,
            cursorY: 0,
            selectedProjectID: selectedProjectID,
            projectsIfcMapping: projectsIfcMapping,
            categoryVisibility: categoryVisibility,
            projectsSrc: projectsSrc,
            modulesSrc: modulesSrc,
            iovisorLoc: iovisorLoc
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

        this.updateIOVisorPath({iovisorLoc: this.state.iovisorLoc});
   
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
        }

        this.setState({
            projectsSrc: payload.projectsSrc,
            modulesSrc: payload.modulesSrc
        });
    },

    updateIOVisorPath: function(payload){
        this.setLocalSetting("iovisorLoc", payload.iovisorLoc)
        this.setState({
            iovisorLoc: payload.iovisorLoc
        });
        if (payload.iovisorLoc == ""){
            console.log("Empty IO Visor path provided");
            console.log("Using placeholder network interface");
            this.setState({
                networkInterfaces: networkInterfaces
            });
        } else{
            $.ajax({
                url: this.state.iovisorLoc + "/modules/host/interfaces/"
            }).then(
                function(data) {
                    this.setState({
                        networkInterfaces: data
                    });
                }.bind(this),
                function() {
                    console.log("Could not get network interfaces from " + "/modules/host/interfaces/");
                    console.log("Using placeholder network interface");
                    this.setState({
                        networkInterfaces: networkInterfaces
                    });
                }.bind(this)
            );
        }
    },

    handleProjectsIfcMapping: function(projectsObj, selectedProject) {
        var projectsIfcMapping = _.cloneDeep(this.state.projectsIfcMapping);

        if (!projectsIfcMapping[selectedProject]){
            projectsIfcMapping[selectedProject] = {};
            var hostInterfaces = _.get(projectsObj[selectedProject], 'topology.host_interfaces', {});
            for (var ifc in hostInterfaces){
                projectsIfcMapping[selectedProject][ifc] = {};
            }
            this.setLocalSetting("projectsIfcMapping", projectsIfcMapping);
        }
        return projectsIfcMapping;        
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
            targetSelectionID = sortedProjectArray[0];
        }

        var projectsIfcMapping = this.handleProjectsIfcMapping(rootProjectsObject, targetSelectionID);
        this.setState({
            selectedProjectID: targetSelectionID,
            projectsObject: rootProjectsObject,
            sortedProjectArray: sortedProjectArray,
            projectsIfcMapping: projectsIfcMapping
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

    editPriority: function(payload){
        var selectedProject = this.state.projectsObject[this.state.selectedProjectID];
        var projectDependencies = selectedProject.dependencies;
        var policyModuleArray = [];
        _.forEach(projectDependencies, function(module, id){
            if (module.type == "policy"){
                policyModuleArray.push(module)
            }
        });
        var numberOfPolicies = policyModuleArray.length;

        var updatedProjectPoliciesObject = _.cloneDeep(selectedProject.policies);

        var targetModule = payload.target.getAttribute("data-module");
        var currentPriority = parseInt(payload.target.getAttribute("data-priority"));
        var moveDirection =  payload.target.name;

        if (moveDirection == "priorityDown"){
            var targetPriority = currentPriority + 1
        }
        else {
            var targetPriority = currentPriority - 1
        }

        if (targetPriority > numberOfPolicies || targetPriority < 1){
            return false
        }

        _.forEach(updatedProjectPoliciesObject, function(policy, id){
            if (policy.module == targetModule){
                policy.priority = targetPriority
            }
            else {
                if (moveDirection == "priorityDown" && policy.priority - 1 == currentPriority){
                   policy.priority -= 1
                }
                if (moveDirection == "priorityUp" && policy.priority + 1 == currentPriority){
                   policy.priority += 1
                }
            }
        });

        this.firebaseProjectsRef.child(this.state.selectedProjectID).child("policies").set(updatedProjectPoliciesObject);
    },

    handleActions: function(event){
        var eventName = event.target.name;

        switch(eventName) {
            case "priorityUp":
                this.editPriority(event); break;
            case "priorityDown":
                this.editPriority(event); break;
            case "newProject":
                this.createNewProject(projectTemplate); break;
            case "importProjectJSON":
                this.openModal("importJSON"); break;
            case "repositories":
                this.openModal("librariesSettings"); break;
            case "iovisorPath":
                this.openModal("IOVisorSettings"); break;
            case "downloadJSON":
                document.getElementById('download').click(); break;
            case "deleteProject":
                this.deleteProject(); break;
            case "saveIOModule":
                this.openModal("saveAsModule"); break;
            case "ifcReMap":
                var hostID =  event.target.getAttribute("data-host");
                var newMap = event.target.getAttribute("data-newmap");
                this.updateMappingCookie(hostID, newMap);
                break
            default:
                return false
        }
    },

    updateMappingCookie: function(hostID, newIfcName){                   
        var updatedObj = this.state.projectsIfcMapping;  
        if (newIfcName == "false"){
            newIfcName = {}
        }
        updatedObj[this.state.selectedProjectID][hostID] = newIfcName;
        this.setLocalSetting("projectsIfcMapping", updatedObj);
        this.setState({
            projectsIfcMapping: this.state.projectsIfcMapping
        })
    },

    deleteLink: function(linkObject){
        var selectedProject = this.state.projectsObject[this.state.selectedProjectID];
        var updatedProjectObject = _.cloneDeep(selectedProject);

        var instrumentID = linkObject.instrument.uuid;
        var componentID = linkObject.component;
        var interfaceID = linkObject.ifc || false;

        var interfaceArray = updatedProjectObject.instruments[instrumentID].interfaces || [];
        
        var pull = null;
        _.forEach(interfaceArray, function(ifc, i){
            if (!ifc.ifc){
                if (ifc.component == componentID){
                    pull = i
                }
            }
            else {
                if (ifc.component == componentID && ifc.ifc == interfaceID){
                    pull = i
                }
            }
        })
        interfaceArray = _.pullAt(interfaceArray, pull);
        interfaceArray = _.uniqWith(interfaceArray, _.isEqual);
        this.firebaseProjectsRef.child(this.state.selectedProjectID).set(updatedProjectObject);
    },

    deleteWire: function(interfaceToken) {
        var selectedProject = this.state.projectsObject[this.state.selectedProjectID];
        var updatedProjectObject = _.cloneDeep(selectedProject);

        var thisWire = interfaceToken.wire;
        var interface1Component = interfaceToken.componentID;
        var interface1Interface = interfaceToken.interfaceID || null;

        var interface2Component = interfaceToken.wireTo.component;
        var interface2Interface = interfaceToken.wireTo.ifc || null;

        delete updatedProjectObject.topology.wires[thisWire];

        if (interface1Interface){
           delete updatedProjectObject.topology.components[interface1Component].interfaces[interface1Interface]
        }

        if (interface2Interface){
           delete updatedProjectObject.topology.components[interface2Component].interfaces[interface2Interface]
        }

        //find instrument wires and delete them
        updatedProjectObject = this.updateInstrumentLinks(updatedProjectObject);

        this.firebaseProjectsRef.child(this.state.selectedProjectID).set(updatedProjectObject);
    },

    updateInstrumentLinks: function(projectObject){
        _.forEach(projectObject.instruments, function(instrument, instrumentID){
            var pullArray = [];
            _.forEach(instrument.interfaces, function(ifc, i){
                var interfaceExists = false;

                _.forEach(projectObject.topology.wires, function(wire, j){
                    if (_.isEqual(wire[0], ifc) || _.isEqual(wire[1], ifc)){
                        interfaceExists = true
                    }
                })

                if (interfaceExists == false){
                    pullArray.push(i)
                } 
            })
            _.pullAt(projectObject.instruments[instrumentID].interfaces, pullArray) 
        })
        return projectObject
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

    handleNewLinkDrop: function(data, source) {
        if (!source.wireTo){return false};

        var selectedProject = this.state.projectsObject[this.state.selectedProjectID];
        newInstrumentObject = _.cloneDeep(selectedProject.instruments[data.instrument.uuid]);

        if (!newInstrumentObject.interfaces){
           newInstrumentObject.interfaces = [] 
        }

        if (source.interfaceID){
            var newInterface = {
                "component": source.componentID,
                "ifc": source.interfaceID
            };
        }
        else {
            var newInterface = {
                "component": source.hostComponentID,
            };
        }

        newInstrumentObject.interfaces.push(newInterface);
        newInstrumentObject.interfaces = _.uniqWith(newInstrumentObject.interfaces, _.isEqual);

        this.firebaseProjectsRef.child(this.state.selectedProjectID).child("instruments").child(data.instrument.uuid).set(newInstrumentObject);
    },

    handleNewObjectDrop: function(moduleID, posX, posY){
        var selectedProject = this.state.projectsObject[this.state.selectedProjectID];

        var selectedProjectFirebaseRef = this.firebaseProjectsRef.child(this.state.selectedProjectID);

        var moduleObject = this.state.modulesObject[moduleID];
        var moduleType = moduleObject.type || "component";

        var newProjectObject = _.cloneDeep(selectedProject);

        var newProjectTopologyObject = newProjectObject.topology || {};
        var newProjectViewObject = newProjectObject.view || {};
        
        var newProjectComponentsObject = newProjectTopologyObject.components || {};
        var newProjectPoliciesObject = newProjectObject.policies || {};
        var projectDependenciesObject = newProjectObject.dependencies || {};
        
        if (moduleType == "component" || "bpf/forward"){
            var newID = "comp-" + ioid();
            var newViewData = {
                "x": posX,
                "y": posY
            };
            var newComponentData = {
                "module": moduleID
            };
            _.set(newProjectObject, 'topology.components.' + newID, newComponentData)
        }
        else if (moduleType == "policy"){
            var newID = "policy-" + ioid();
            var newViewData = {
                "left": posX,
                "top": posY,
                "width": this.props.policyInProgress.width,
                "height": this.props.policyInProgress.height
            };
            //set new policy with priority of existing policies with the same module
            //or find the lowest priority (highest number) and +1
            var newPolicyObject = newProjectObject.policies || {};
            var newPriority = 1;
            
            if (!_.includes(JSON.stringify(newPolicyObject), moduleID)){
                var highestPriorityNumber = 0;
                _.forEach(newProjectObject.policies, function(policy, id){
                    if (policy.priority > highestPriorityNumber){
                        highestPriorityNumber = policy.priority
                    }
                })
                newPriority = highestPriorityNumber + 1
            }
            else {
                _.forEach(newProjectObject.policies, function(policy, id){
                    if (policy.module == moduleID){
                        newPriority = policy.priority
                    }
                })
            }

            var newPolicyData = {
                "module": moduleID,
                "priority": newPriority
            };
            _.set(newProjectObject, 'policies.' + newID, newPolicyData)
        }
        else if (moduleType == "instrument"){
            var newID = "instrument-" + ioid();
            var newViewData = {
                "left": posX,
                "top": posY,
                "width": moduleObject.view.width,
                "height": moduleObject.view.height
            };
            var newInstrumentData = {
                "module": moduleID
            };
            _.set(newProjectObject, 'instruments.' + newID, newInstrumentData)
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
                }
                // change nested module ID value to true
                moduleCloneDependencies[nestedModuleID] = true
            });

            _.set(newProjectObject, 'dependencies', newProjectDependenciesObject);
        }
        _.set(newProjectObject, 'view.' + newID, newViewData)

        selectedProjectFirebaseRef.set(newProjectObject);
    },

    handleNewHostIfc: function(newHostID, ifcType, payload){
        var selectedProject = this.state.projectsObject[this.state.selectedProjectID];

        var selectedProjectFirebaseRef = this.firebaseProjectsRef.child(this.state.selectedProjectID);
        var newProjectObject = _.cloneDeep(selectedProject);

        var updatedObj = this.state.projectsIfcMapping;
        var currentProjectIfcMap = updatedObj[this.state.selectedProjectID];

        var newProjectHostIfcObject = {
            "mode": "bi",
            "protocol": "protocol-3we4",
            "type": ifcType
        }

        var xArray = [];
        for (id in newProjectObject.view){
            if (_.startsWith(id, 'host') && newProjectObject.view[id].y == 50){ //host interfaces at y=50
                var dimX = newProjectObject.view[id].x
                xArray.push(dimX)
            }
        }

        var pitch = 105;
        var availablePositionX =  10;

        while (_.includes(xArray, availablePositionX)){
            availablePositionX += pitch
        }

        var newViewData = {
            "x": availablePositionX,
            "y": 50
        }
        _.set(newProjectObject, 'view.' + newHostID, newViewData);
        _.set(newProjectObject, 'topology.host_interfaces.' + newHostID, newProjectHostIfcObject);

        selectedProjectFirebaseRef.set(newProjectObject);

        currentProjectIfcMap[newHostID] = payload;
        this.setLocalSetting("projectsIfcMapping", updatedObj);
        this.setState({
            projectsIfcMapping: updatedObj
        })
    },

    handleDelHostIfc: function(newHostID){
        var newProjectViewObject = this.state.projectsObject[this.state.selectedProjectID].view || {};
        var newProjectHostIfcObject = this.state.projectsObject[this.state.selectedProjectID].topology.host_interfaces || {};

        newProjectHostIfcObject[newHostID] = {
            "mode": "bi",
            "protocol": "protocol-3we4",
            "type": ifcType
        }

        newProjectViewObject[newHostID] = {
            "x": 10,
            "y": 10
        }

        this.firebaseProjectsRef.child(this.state.selectedProjectID).child("view").set(newProjectViewObject)
        this.firebaseProjectsRef.child(this.state.selectedProjectID).child("topology").child("host_interfaces").set(newProjectHostIfcObject)
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

    handleInstrumentUpdate: function(id, instrument) {
        var newProjectObject = _.cloneDeep(this.state.projectsObject[this.state.selectedProjectID]);
        var instrumentView = newProjectObject.view[id];
        instrumentView.left = instrument.left;
        instrumentView.top = instrument.top;
        instrumentView.height = instrument.height;
        instrumentView.width = instrument.width;

        if (instrumentView.left <= 0 || instrumentView.top <= headerHeight){
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

    deleteHostIfc: function(hostID) {
        var confirmObjectDeletion = confirm("Delete this item?");
        if (confirmObjectDeletion == true) {

            var selectedProject = this.state.projectsObject[this.state.selectedProjectID];
            var newProjectObject = _.cloneDeep(selectedProject);

            //delete view data
            newProjectObject.view[hostID] = null;

            //delete component from topology
            delete newProjectObject.topology.host_interfaces[hostID];

            var topologyComponents = newProjectObject.topology.components;

            //find wires and delete them
            if (newProjectObject.topology.wires){
                for (var wire in newProjectObject.topology.wires){
                    var wireObject = newProjectObject.topology.wires[wire];
                    if (wireObject[0].component == hostID){
                        delete newProjectObject.topology.wires[wire];
                        //find interface on other component and delete
                        if (newProjectObject.topology.components[wireObject[1].component]){
                            newProjectObject.topology.components[wireObject[1].component].interfaces[wireObject[1].ifc] = null
                        }
                    }
                    if (wireObject[1].component == hostID){
                        delete newProjectObject.topology.wires[wire];
                        //find interface on other component and delete
                        if (newProjectObject.topology.components[wireObject[0].component]){
                            newProjectObject.topology.components[wireObject[0].component].interfaces[wireObject[0].ifc] = null
                        }
                    }
                }
            }

            //update instrument links
            newProjectObject = this.updateInstrumentLinks(newProjectObject);

            var updatedObj = this.state.projectsIfcMapping;

            if (updatedObj[this.state.selectedProjectID][hostID]){
                delete updatedObj[this.state.selectedProjectID][hostID];
            }

            this.setLocalSetting("projectsIfcMapping", updatedObj);
            this.setState({
                projectsIfcMapping: updatedObj
            })
            this.firebaseProjectsRef.child(this.state.selectedProjectID).set(newProjectObject);
        }
        else {
            this.forceUpdate()     
        }
    },

    handleObjectDrop: function(objectID, deltaX, deltaY) {
        var newProjectObject = _.cloneDeep(this.state.projectsObject[this.state.selectedProjectID]);

        newProjectObject.view[objectID].x += deltaX;
        newProjectObject.view[objectID].y += deltaY;

        if (newProjectObject.view[objectID].x <= 0 || newProjectObject.view[objectID].y <= headerHeight){
            if (objectID.indexOf('host') == 0){
                this.deleteHostIfc(objectID);
            }else{
                this.deleteObject(objectID);
            }
        }else {
            this.firebaseProjectsRef.child(this.state.selectedProjectID).set(newProjectObject);
        }
    },

    deleteObject: function(objectID) {
        var confirmObjectDeletion = confirm("Delete this item?");
        if (confirmObjectDeletion == true) {
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
                            delete newProjectObject.topology.wires[wire];
                            //find interface on other component and delete
                            var otherComponent = newProjectObject.topology.components[wireObject[1].component] || false;
                            if (otherComponent){
                                otherComponent.interfaces[wireObject[1].ifc] = null
                            }
                        }
                        //repeat for other end
                        if (wireObject[1].component == objectID){
                            delete newProjectObject.topology.wires[wire];
                            //find interface on other component and delete
                            var otherComponent = newProjectObject.topology.components[wireObject[0].component] || false;
                            if (otherComponent){
                                otherComponent.interfaces[wireObject[0].ifc] = null
                            }
                        }
                    }
                }

                //find instrument wires and delete them
                newProjectObject = this.updateInstrumentLinks(newProjectObject);

            }
            else if (objectID.indexOf('policy') == 0){
                var moduleDependencyID = selectedProject.policies[objectID].module;
                var deletedPriority = selectedProject.policies[objectID].priority;

                //delete policy from policies
                delete newProjectObject.policies[objectID];
                //update priorities of remaining policies
                // check to see if any more of the deleted policy
                if (!_.includes(JSON.stringify(newProjectObject.policies), moduleDependencyID)){
                    _.forEach(newProjectObject.policies, function(policy, id){
                        if (policy.priority > deletedPriority){
                            policy.priority -= 1
                        }
                    })
                }
            }

            else if (objectID.indexOf('instrument') == 0){
                var moduleDependencyID = selectedProject.instruments[objectID].module;

                //delete instrument from instruments
                delete newProjectObject.instruments[objectID];
            }
            
            //delete view data
            delete newProjectObject.view[objectID];

            //manage dependencies
            var topologyComponents = _.get(newProjectObject, 'topology.components', {});
            var policies = newProjectObject.policies;
            var instruments = newProjectObject.instruments;
            
            var moduleArray = [];
            _.forEach(topologyComponents, function(component){
                var module = component.module;
                moduleArray.push(module);
            });
            _.forEach(policies, function(policy){
                var module = policy.module;
                moduleArray.push(module);
            });
            _.forEach(instruments, function(instrument){
                var module = instrument.module;
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
        }
        else {
            this.forceUpdate()
        }
    },

    createNewProject: function(projectTemplate) {
        var newProjectsObject = _.cloneDeep(this.state.projectsObject);
        var newProjectID = "project-" + guid();

        newProjectsObject[newProjectID] = projectTemplate;

        this.firebaseProjectsRef.set(newProjectsObject);
        var projectsIfcMapping = this.handleProjectsIfcMapping(newProjectsObject, newProjectID);
        this.setState({
            selectedProjectID: newProjectID,
            projectsIfcMapping: projectsIfcMapping
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
            var projectsIfcMapping = this.handleProjectsIfcMapping(this.state.projectsObject, payload.projectID);
            this.setLocalSetting("selectedProjectID", payload.projectID);
            this.setState({
                selectedProjectID: payload.projectID,
                projectsIfcMapping: projectsIfcMapping
            });            
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

        if (dropType == "component" || dropType == "bpf/forward"){
            var dims = this.props.componentInProgress
        }
        else if (dropType == "policy") {
            var dims = this.props.policyInProgress
        }
        else if (dropType == "instrument") {
            var dims = dropObject.view
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

    closeMenu: function() {
        this.setState({
            menuTarget: false,
        }); 
    },

    openMenu: function(event) {
        this.setState({
            menuTarget: event.target,
        }); 
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
        if (modalName == "IOVisorSettings"){
            this.updateIOVisorPath(payload)
        }
        if (modalName == "importJSON"){
            importProjectTemplate = JSON.parse(payload);
            importProjectTemplate.name = "Imported Project";
            this.createNewProject(importProjectTemplate)
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

    onHostIfcClick : function(payload, ifcType){
        var projectsObj = this.state.projectsObject;

        var updatedObj = this.state.projectsIfcMapping;
        var hostIfcMap = updatedObj[this.state.selectedProjectID];
        var found = 0;
        for (var ifc in hostIfcMap){
            if (hostIfcMap[ifc] == payload){
                this.deleteHostIfc(ifc);
                found = 1;
            }
        }
        if (found == 0){
            var newKey="host-" + guid();
            this.handleNewHostIfc(newKey, ifcType, payload)
        }
    },

    render: function() {
        if (_.isEmpty(this.state.modulesObject) || _.isEmpty(this.state.projectsObject)){
            return false
        }

        var selectedProject = this.state.projectsObject[this.state.selectedProjectID];

        var componentInProgress;
        var policyInProgress;
        var instrumentInProgress;
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
            else if (moduleType == "instrument"){
               instrumentInProgress = <InstrumentInProgress
                    moduleID = {moduleID} 
                    module = {moduleObject} 
                    thisX = {this.state.cursorX} 
                    thisY = {this.state.cursorY}/>
            }
            else if (moduleType == "component" || moduleType == "bpf/forward"){
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
            
            _.forEach(this.state.modalArray, function(modalName) {
                var modalDialogue = (<ModalDialogue
                    projectsSrc = {this.state.projectsSrc}
                    modulesSrc = {this.state.modulesSrc}
                    iovisorLoc = {this.state.iovisorLoc}
                    key = {modalName}
                    modalName = {modalName}
                    categories = {this.state.categoriesObject}
                    selectedProject = {selectedProject}
                    projectID = {this.state.selectedProjectID}
                    submitModal = {this.submitModal}
                    cancelModal = {this.cancelModal}/>
                );

                modalDialogues.push(modalDialogue)
            }.bind(this));
        }

        var menu = null;
        if (this.state.menuTarget != false){
            menu = (
                <Menu
                    projects = {this.state.projectsObject} 
                    selectedProject = {selectedProject} 
                    ifcMap = {this.state.projectsIfcMapping[this.state.selectedProjectID]}
                    networkInterfaces = {this.state.networkInterfaces}
                    handleActions = {this.handleActions} 
                    closeMenu = {this.closeMenu} 
                    menuTarget = {this.state.menuTarget}/>
            );
        }

        var popover = null;
        if (this.state.popoverTarget != false){
            popover = (
                <Popover
                    projects = {this.state.projectsObject}
                    iovisorLoc = {this.state.iovisorLoc} 
                    selectedProject = {selectedProject} 
                    onHostIfcClick = {this.onHostIfcClick} 
                    handleActions = {this.handleActions} 
                    closePopover = {this.closePopover} 
                    networkInterfaces = {this.state.networkInterfaces}
                    selectedProjectIfcMapping = {this.state.projectsIfcMapping[this.state.selectedProjectID] || {}} 
                    popoverTarget = {this.state.popoverTarget}/>
            );
        }

        var downloadData = "data: text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedProject));

        return (
            <div id="IOConsole">
                <div id="navigation">
                    <Home 
                        menuTarget = {this.state.menuTarget} 
                        openMenu = {this.openMenu}/>
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
                            selectedProject = {selectedProject}
                            openModal = {this.openModal} 
                            openMenu = {this.openMenu}
                            openPopover = {this.openPopover}
                            renameProject = {this.renameProject}
                            iovisorLoc = {this.state.iovisorLoc}/>
                    </div>
                    <div id="workspace">
                        <Workspace 
                            ref = "workspace" 
                            className = "ui-module workspace" 
                            menuTarget = {this.state.menuTarget} 
                            handleObjectDrop = {this.handleObjectDrop} 
                            openMenu = {this.openMenu} 
                            openPopover = {this.openPopover}
                            handleInstrumentUpdate = {this.handleInstrumentUpdate} 
                            handlePolicyUpdate = {this.handlePolicyUpdate} 
                            updatePoliciesData = {this.updatePoliciesData}
                            handleWireDrop = {this.handleNewWireDrop} 
                            handleLinkDrop = {this.handleNewLinkDrop} 
                            deleteWire = {this.deleteWire}
                            deleteLink = {this.deleteLink}
                            protocols = {this.state.protocolsObject} 
                            selectedProjectID = {this.state.selectedProjectID}
                            selectedProjectIfcMapping = {this.state.projectsIfcMapping[this.state.selectedProjectID] || {}} 
                            selectedProject = {selectedProject}/>
                    </div>
                </div>
                {componentInProgress}
                {policyInProgress}
                {instrumentInProgress}
                {modalDialogues}
                {popover}
                {menu}
                <a 
                    href = {downloadData}
                    download = {selectedProject.name + " (" + selectedProject.version + ").json"}
                    id = "download"
                    hidden></a>
            </div>

        );
    },
});

React.render(<IOConsole></IOConsole>, document.body);
