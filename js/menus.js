var HomeActions = React.createClass({
	handleActions: function(event){
		this.props.handleActions(event)
	},

	render: function() {
		return (
			<ul className="menuContent">
				<li className = "menuSection">Settings</li>
				<li><a name="repositories" onMouseUp={this.handleActions}>Data Repositories</a></li>
				<li><a name="iovisorPath" onMouseUp={this.handleActions}>IO Visor</a></li>
			</ul>
		)
	}
});

var AddObject = React.createClass({
	handleActions: function(event){
		this.props.handleActions(event)
	},

	render: function() {
		return (
			<ul className="menuContent">
				<li className = "menuSection">Create Object</li>
				<li><a name="newProject" onMouseUp={this.handleActions}>New Project</a></li>
				<li className="disabled"><a name="newModule" onMouseUp={this.handleActions}>New Module&hellip;</a></li>
				<li className="disabled"><a name="newProtocol" onMouseUp={this.handleActions}>New Protocol&hellip;</a></li>
				<li className = "menuSection">Import Object</li>
				<li><a name="importProjectJSON" onMouseUp={this.handleActions}>Import Project JSON&hellip;</a></li>
				<li className="disabled"><a name="importModule" onMouseUp={this.handleActions}>Import Module&hellip;</a></li>
			</ul>
		)
	}
});

var ProjectActions = React.createClass({
	handleActions: function(event){
		this.props.handleActions(event)
	},

	render: function() {
		var deleteButtonClass = "";
		if (_.size(this.props.projects) == 1){
			deleteButtonClass = "disabled"
		}
		var wiresObject = _.get(this.props.selectedProject, 'topology.wires', {})

		var saveAsModuleButtonClass = "";
		var nWiresToHostInterfaces = 0;

		var isConnectionsToHostInterfaces = _.find(wiresObject, function(wire) {
			return !wire[0].ifc || !wire[1].ifc;
		});

		if (!isConnectionsToHostInterfaces){
			saveAsModuleButtonClass = "disabled"
		}

		return (
			<ul className="menuContent">
				<li className="disabled"><a name="duplicate" onMouseUp={this.handleActions}>Duplicate Project</a></li>
				<li className={saveAsModuleButtonClass} ><a name="saveIOModule" onMouseUp={this.handleActions}>Save as IO Module&hellip;</a></li>
				<li><a name="downloadJSON" onMouseUp={this.handleActions}>Save Project JSON</a></li>
				<li className = "menuSection"></li>
				<li className={deleteButtonClass}><a name="deleteProject"  onMouseUp={this.handleActions}>Delete Project&hellip;</a></li>
			</ul>
		)
	}
});

var InterfaceSelectionList = React.createClass({
	handleActions: function(event){
		this.props.handleActions(event)
	},

	render: function() {
		var ifcMap = this.props.ifcMap;
		var hostID = this.props.hostID;
		var networkInterfaces = this.props.networkInterfaces;
		var storageInterfaces = this.props.storageInterfaces;

		var noSelectionClassString = "selected";

		networkListJSXArray = [];
		_.forEach(networkInterfaces, function(hostInterface){
			var hostInterfaceName = hostInterface.name;
			var id = hostInterface.id;
			var classString = "";

			_.forEach(ifcMap, function(hostIfcName, mappedHostID){
				if (hostInterfaceName == hostIfcName){
					classString = "disabled";
					if (hostID == mappedHostID){
						classString = "selected";
						noSelectionClassString = ""
					}
				}
			})

			networkListJSXArray.push(
				<li key={id} className={classString}><a name="ifcReMap" data-newmap={hostInterfaceName} data-host={hostID} onMouseUp={this.handleActions}>{hostInterfaceName}</a></li>
			)
		}.bind(this));

		storageListJSXArray = [];
		_.forEach(this.props.storageInterfaces, function(hostInterface){
			var hostInterfaceName = hostInterface.name;
			var id = hostInterface.id;
			var classString = "";

			_.forEach(ifcMap, function(hostIfcName, mappedHostID){
				if (hostInterfaceName == hostIfcName){
					classString = "disabled";
					if (hostID == mappedHostID){
						classString = "selected";
						noSelectionClassString = ""
					}
				}
			})

			storageListJSXArray.push(
				<li key={id} className={classString}><a name="ifcReMap" data-newmap={hostInterfaceName} data-host={hostID} onMouseUp={this.handleActions}>{hostInterfaceName}</a></li>
			)
		}.bind(this))

		return (
			<ul className="menuContent">
				<li className = {noSelectionClassString}><a name="ifcReMap" data-newmap="false" data-host={hostID} onMouseUp={this.handleActions}>No Mapping</a></li>
				<li className = "menuSection">Network Interfaces</li>
				{networkListJSXArray}
				<li className = "menuSection">Drive Interfaces</li>
				{storageListJSXArray}
			</ul>
		)
	}
});

var Menu = React.createClass({
	handleActions: function(event) {
		this.props.handleActions(event)
	},

	closeMenu: function() {
		this.props.closeMenu()
	},

	render: function() {
		var menu = false;

		var targetRect = this.props.menuTarget.getBoundingClientRect();
		var networkInterfaces = this.props.networkInterfaces;

		var menuPosition = {
			left: targetRect.left,
			top: targetRect.bottom + 1
		}

		if (this.props.menuTarget.name == "mapHostInterface"){
			menu = (
				<div id="menuBackground" onClick={this.closeMenu}>
	  				<div style={menuPosition} className="menuContainer">
	  					<InterfaceSelectionList
	  						hostID = {this.props.menuTarget.value}
	  						ifcMap = {this.props.ifcMap}
	  						networkInterfaces = {networkInterfaces}
	  						storageInterfaces = {storageInterfaces}
	  						handleActions = {this.handleActions}/>
	  				</div>
	  			</div>
			)
		}
		
		if (this.props.menuTarget.name == "homeActions"){
			menu = (
				<div id="menuBackground" onClick={this.closeMenu}>
	  				<div style={menuPosition} className="menuContainer">
	  					<HomeActions 
	  						handleActions = {this.handleActions}/>
	  				</div>
	  			</div>	
			)
		}

		if (this.props.menuTarget.name == "addObject"){
			menu = (
				<div id="menuBackground" onClick={this.closeMenu}>
	  				<div style={menuPosition} className="menuContainer">
	  					<AddObject 
	  						handleActions = {this.handleActions}/>
	  				</div>
	  			</div>	
			)
		}

		if (this.props.menuTarget.name == "projectActions"){
			menu = (
				<div id="menuBackground" onClick={this.closeMenu}>
	  				<div style={menuPosition} className="menuContainer">
	  					<ProjectActions 
	  						selectedProject = {this.props.selectedProject}
	  						projects = {this.props.projects}
	  						handleActions = {this.handleActions}/>
	  				</div>
	  			</div>	
			)
		}

		return menu
	},
});