var ModuleSection = React.createClass({

	getInitialState: function() {
    	return {
    		isScrollAtTop: true
    	};
  	},

	handleSectionScroll: function() {
		var sectionElement = this.refs.ioModules.getDOMNode();
		this.setState({
			isScrollAtTop: sectionElement.scrollTop == 0
		});

	},

	render: function() {
		var categoryItems = [];

		for (var category in this.props.categories) {
			var moduleList = this.props.categories[category].modules;
            var isOpen = false;
            if (this.props.categoryVisibility[category]){
                isOpen = this.props.categoryVisibility[category];

            }
      		categoryItems.push(
      			<Category
      				key = {category}
      				category = {category}
      				onCategoryClick = {this.props.onCategoryClick}
      				isOpen = {isOpen}
      				moduleList = {moduleList}
      				sortedModuleArray = {this.props.sortedModuleArray}
      				onModuleMouseDown = {this.props.onModuleMouseDown}
      				modules = {this.props.modules}/>
      		);
    	};
    	var classString = "ioModules";
    	if (this.state.isScrollAtTop == false){
    		classString += " scrolled"
    	}

    	return (
			<section
				ref = "ioModules"
				className = {classString}
				onScroll = {this.handleSectionScroll}>
				<h1>IO Modules</h1>
				{categoryItems}
			</section>
		);
	},
});