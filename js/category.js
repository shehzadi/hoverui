var Category = React.createClass({
	onCategoryClick: function() {
		this.props.onCategoryClick(this.props.category, this.props.isOpen)
	},

	render: function() {

		var moduleItems = [];
		var classString = "disclosure";
		var nModulesInCategory = Object.keys(this.props.moduleList).length;
		var contentString = this.props.category + " (" + nModulesInCategory + ")";
		var sortedModuleArray = this.props.sortedModuleArray;
		if (this.props.isOpen){
			for (var i = 0; i < sortedModuleArray.length; i++){
				var thisModuleID = sortedModuleArray[i];
				if(this.props.moduleList[thisModuleID]){
					var thisModuleItem = this.props.modules[thisModuleID];
					moduleItems.push(
	      			<ModuleItem
	      				key = {thisModuleID}
	      				onMouseDown = {this.props.onModuleMouseDown}
	      				moduleID = {thisModuleID}
	      				moduleItem = {thisModuleItem}/>
	      			);
				}
			}

	    	classString += " open"
    	}
    	else {
    		classString += " closed"
    	}

		return (
			<div
				className="categorySection">
  				<h2
  					onClick={this.onCategoryClick}>
  					<span className={classString}></span>
  					<span className="category">{contentString}</span>
  				</h2>
  				{moduleItems}
      		</div>
		);
	}
});