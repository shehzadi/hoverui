var NameEditor = React.createClass({
	getInitialState: function() {
   		return {
   			projectNameValue: this.props.name
   		};
	},

	handleFormChange: function(event) {
   		this.setState({
   			projectNameValue: event.target.value
   		});
	},

	handleKeyPress: function(event) {
   		if (event.which == 13) {
      		event.preventDefault();
        	this.refs.nameEditorInput.getDOMNode().blur()
    	}
	},

	handleFormBlur: function(event) {
   		this.props.handleFormBlur()
	},

	componentDidMount: function(){
		this.refs.nameEditorInput.getDOMNode().select();
	},

	render: function() {
		return (
			<input 
				type="text" 
				className="projectNameInput" 
				ref="nameEditorInput"
				value={this.state.projectNameValue} 
				onChange={this.handleFormChange}
				onKeyPress={this.handleKeyPress}
				onBlur={this.props.handleFormBlur}/>
			);
	}
});

var Tools = React.createClass({
	getInitialState: function() {
   		return {
   			isEditingName: false,
   		};
	},

	openPopover: function(event){
		this.props.openPopover(event)
	},

	handleDeleteProjectClick: function(){
		this.props.deleteProject()
	},

	handleSaveAsProjectClick: function(){
		this.props.openModal("saveAsModule")
	},

	handleEditClick: function(event) {
   		this.setState({
   			isEditingName: true,
   		});   		
	},

	handleFormBlur: function(event) {
   		this.setState({
   			isEditingName: false,
   		});
   		if (event.target.value != this.props.selectedProject.name){
   			this.props.renameProject(event.target.value);
   		}
   		
	},

	render: function() {
		var project = "";
		var version = "";

		var selectedProjectObject = this.props.selectedProject;
		var wiresObject = selectedProjectObject.topology.wires || {};

		if (selectedProjectObject){
			project = selectedProjectObject.name;
			version = selectedProjectObject.version;		
		}

		var projectName = (
			<span 
				className="projectName" 
				onClick={this.handleEditClick}>
				{project}
			</span>
		);

		if (this.state.isEditingName) {
			projectName = (<NameEditor 
				ref="nameInput" 
				type="text" 
				name={project} 
				handleFormChange={this.handleFormChange} 
				handleFormBlur={this.handleFormBlur}/>
			)
		}

		var deleteButtonClass = "";
		if (this.props.nProjects == 1){
			deleteButtonClass = "disabled"
		}

		var publishModuleButtonClass = "";
		var nWiresToHostInterfaces = 0;

		isConnectionsToHostInterfaces = _.find(wiresObject, function(wire) {
			return !wire[0].ifc || !wire[1].ifc;
		});

		if (!isConnectionsToHostInterfaces){
			publishModuleButtonClass = "disabled"
		}

		var downloadData = "data: text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.props.selectedProject));

		return (
			<div className="tools">
				{projectName}
				<span className="version">{version}</span>
				<button className="disabled">Save Version&hellip;</button>
				<button className="disabled">Duplicate</button>
				<a href={downloadData} download={selectedProjectObject.name + " (" + selectedProjectObject.version + ").json"}>Download JSON</a>
				<button className={publishModuleButtonClass} onClick = {this.handleSaveAsProjectClick}>Publish as IO Module&hellip;</button>
				<button className={deleteButtonClass} onClick = {this.handleDeleteProjectClick}>Delete Project</button>
				<button className="" name="projectActions" onClick={this.openPopover}>More Actions</button>
				<div className="buttons">
					<button className="disabled">Deploy to IO Visor&hellip;</button>
				</div>
			</div>
		)
	}
})