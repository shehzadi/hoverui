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

	handleDeleteProjectClick: function(){
		this.props.deleteProject()
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

		selectedProjectObject = this.props.selectedProject;

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

		return (
			<div className="tools">
				{projectName}
				<span className="version">{version}</span>
				<button className="disabled">Save Version&hellip;</button>
				<button className="disabled">Duplicate</button>
				<button className="disabled">Export JSON</button>
				<button className="disabled">Save as Module&hellip;</button>
				<button onClick = {this.handleDeleteProjectClick}>Delete Project</button>
				<div className="buttons">
					<button className="disabled">Deploy to IO Visor&hellip;</button>
				</div>
			</div>
		);
	},
});