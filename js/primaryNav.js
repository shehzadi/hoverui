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
					//callbacks
					onCategoryClick = {this.props.onCategoryClick} 
					onModuleMouseDown = {this.props.onModuleMouseDown} 
					//data
					modules = {this.props.modules} 
					sortedModuleArray = {this.props.sortedModuleArray} 
					categories = {this.props.categories} 
					categoryVisibility = {this.props.categoryVisibility}/>
			</div>
		);
	},
});