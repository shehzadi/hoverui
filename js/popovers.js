var HomeActions = React.createClass({
	handleActions: function(event){
		this.props.handleActions(event)
	},

	render: function() {
		return (
			<ul className="popoverContent">
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
			<ul className="popoverContent">
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
			<ul className="popoverContent">
				<li><a className="disabled" name="duplicate" onMouseUp={this.handleActions}>Duplicate Project</a></li>
				<li><a name="saveIOModule" className={saveAsModuleButtonClass} onMouseUp={this.handleActions}>Save as IO Module&hellip;</a></li>
				<li><a name="downloadJSON" onMouseUp={this.handleActions}>Download JSON</a></li>
				<li className = "menuSection"></li>
				<li><a name="deleteProject" className={deleteButtonClass} onMouseUp={this.handleActions}>Delete Project&hellip;</a></li>
			</ul>
		)
	}
});

var Popover = React.createClass({
	handleActions: function(event) {
		this.props.handleActions(event)
	},

	closePopover: function() {
		this.props.closePopover()
	},

	render: function() {
		var popover = false;

		var targetRect = this.props.popoverTarget.getBoundingClientRect();

		var popoverPosition = {
			left: targetRect.left,
			top: targetRect.bottom
		}
		
		if (this.props.popoverTarget.name == "homeActions"){
			popover = (
				<div id="popoverBackground" onClick={this.closePopover}>
	  				<div style={popoverPosition} className="popoverContainer">
	  					<HomeActions 
	  						handleActions = {this.handleActions}/>
	  				</div>
	  			</div>	
			)
		}

		if (this.props.popoverTarget.name == "addObject"){
			popover = (
				<div id="popoverBackground" onClick={this.closePopover}>
	  				<div style={popoverPosition} className="popoverContainer">
	  					<AddObject 
	  						handleActions = {this.handleActions}/>
	  				</div>
	  			</div>	
			)
		}

		if (this.props.popoverTarget.name == "projectActions"){
			popover = (
				<div id="popoverBackground" onClick={this.closePopover}>
	  				<div style={popoverPosition} className="popoverContainer">
	  					<ProjectActions 
	  						selectedProject = {this.props.selectedProject}
	  						projects = {this.props.projects}
	  						handleActions = {this.handleActions}/>
	  				</div>
	  			</div>	
			)
		}

		return popover
	},
});