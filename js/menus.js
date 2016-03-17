var HomeActions = React.createClass({
	handleActions: function(event){
		this.props.handleActions(event)
	},

	render: function() {
		return (
			<ul className="menuContent">
				<li className = "menuSection">Settings</li>
				<li><a name="repositories" onMouseUp={this.handleActions}>Data Repositories</a></li>
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
				<li><a name="newModule" className="disabled" onMouseUp={this.handleActions}>New Module&hellip;</a></li>
				<li><a name="newProtocol" className="disabled" onMouseUp={this.handleActions}>New Protocol&hellip;</a></li>
				<li className = "menuSection">Import Object</li>
				<li><a name="importProject" className="disabled" onMouseUp={this.handleActions}>Import Project&hellip;</a></li>
				<li><a name="importModule" className="disabled" onMouseUp={this.handleActions}>Import Module&hellip;</a></li>
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
		var wiresObject = this.props.selectedProject.topology.wires || {};

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
				<li><a className="disabled" name="duplicate" onMouseUp={this.handleActions}>Duplicate Project</a></li>
				<li><a name="saveIOModule" className={saveAsModuleButtonClass} onMouseUp={this.handleActions}>Save as IO Module&hellip;</a></li>
				<li><a name="downloadJSON" onMouseUp={this.handleActions}>Download JSON</a></li>
				<li className = "menuSection"></li>
				<li><a name="deleteProject" className={deleteButtonClass} onMouseUp={this.handleActions}>Delete Project&hellip;</a></li>
			</ul>
		)
	}
});

var InterfaceSelectionList = React.createClass({
	handleActions: function(event){
		this.props.handleActions(event)
	},

	render: function() {
		return (
			<ul className="menuContent">
				<li><a>No Mapping</a></li>
				<li className = "menuSection">Network Interfaces</li>
				<li><a className="disabled">eth0</a></li>
				<li><a>eth1</a></li>
				<li><a>eth2</a></li>
				<li><a className="disabled">wlan0</a></li>
				<li className = "menuSection">Drive Interfaces</li>
				<li><a className="disabled">sda0</a></li>
				<li><a className="disabled">sda1</a></li>
				<li><a className="disabled">sdb</a></li>
				<li><a className="disabled">sdc</a></li>
				<li><a className="disabled">usb0</a></li>
				<li><a className="disabled">usb1</a></li>
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

		var menuPosition = {
			left: targetRect.left,
			top: targetRect.bottom + 1
		}

		console.log(this.props.menuTarget.value);

		if (this.props.menuTarget.name == "mapHostInterface"){
			menu = (
				<div id="menuBackground" onClick={this.closeMenu}>
	  				<div style={menuPosition} className="menuContainer">
	  					<InterfaceSelectionList 
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