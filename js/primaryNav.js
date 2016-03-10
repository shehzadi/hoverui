var PrimaryNav = React.createClass({
	render: function() {	
		return (
			<div className="primaryNav">
				<ProjectSection 
					//callbacks
                    onProjectClick = {this.props.onProjectClick} 
                    //data
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