var SaveAsModuleForm = React.createClass({
	getInitialState: function() {
   		return {
			name: this.props.projectName,
			description: "",
			categories: []
		};
	},

	cancel: function(event) {
		event.preventDefault();
		this.props.cancel(this.props.modalName)
	},

	submit: function(event) {
		event.preventDefault();
		var submitPayload = {
			name: this.state.name,
			description: this.state.description,
			categories: this.state.categories,
			refProject: this.props.projectID
		}
		console.log(submitPayload);
		this.props.submit(this.props.modalName, submitPayload)
	},

	onFromChange: function(event) {
		var elementName = event.target.attributes.name.value;
		if (elementName == "name"){this.setState({name: event.target.value})}
		else if (elementName == "description"){this.setState({description: event.target.value})}
		else {
			var newArray = _.cloneDeep(this.state.categories);
			if (this.state.categories.indexOf(elementName) >= 0){
				//take away category from arry
				_.pull(newArray, elementName)
			}
			else {
				//add category to array
				newArray.push(elementName)
			}
			this.setState({categories: newArray})
		}
	},

	render: function() {
		var buttonClassString = "";
		var invalidClassString = "";
		if (this.state.name == "") {
			buttonClassString = "disabled";
			invalidClassString = "invalid"
		}
		var categoryItems = [];
		for (var category in this.props.categories) {
			var thisValue = false;
			if (this.state.categories.indexOf(category) >= 0){
				thisValue = true;
			}
			categoryItems.push(
      			<label>
      				<input type="checkbox" name={category} value={this.state.analytics} onChange={this.onFromChange}/>
      				{category}
      			</label>
      		);
		}

		return (
		<form id="saveAsModule">
			<header>
				<div>Save Project as Module</div>
				<button>&times;</button>
			</header>
			<main>
				<div>Name</div>
				<input type="text" className={invalidClassString} name="name" value={this.state.name} onChange={this.onFromChange}/>
				<div>Description</div>
				<textarea name="description" value={this.state.description} onChange={this.onFromChange}/>
				<div>Categories</div>
				{categoryItems} 					
			</main>
			<footer>
				<input type="button" onClick={this.cancel} value="Cancel"/>
				<input type="button" className={buttonClassString} onClick={this.submit} value="Save"/>
			</footer>
		</form>
		)
	}
});

var ModalDialogue = React.createClass({
	cancel: function() {
		this.props.cancelModal()
	},

	submit: function(modalName, payload) {
		this.props.submitModal(modalName, payload)
	},

	render: function() {
		var modal;
		if (this.props.modalName == "saveAsModule"){
			modal = (
				<div className="modalBackground">
	  				<div className="modalContainer">
	  					<SaveAsModuleForm
	  						modalName = {this.props.modalName} 
	  						categories = {this.props.categories} 
	  						cancel = {this.cancel} 
	  						submit = {this.submit} 
	  						projectID = {this.props.projectID} 
	  						projectName = {this.props.selectedProject.name}/>
	  				</div>
	  			</div>	
			)
		}
		return modal
	},
});