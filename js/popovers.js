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
		return (
			<ul className="popoverContent">
				<li className = "menuSection">More Project Actions</li>
				<li><a name="duplicate" onMouseUp={this.handleActions}>Duplicate Project</a></li>
				<li className = "menuSection"></li>
				<li><a name="delete" onMouseUp={this.handleActions}>Delete Project</a></li>
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
	  						handleActions = {this.handleActions}/>
	  				</div>
	  			</div>	
			)
		}

		return popover
	},
});