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