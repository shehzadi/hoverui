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
			
			if (category == "uncategorised") {continue}
			categoryItems.push(
      			<label key={category}>
      				<input type="checkbox" name={category} value={this.state.analytics} onChange={this.onFromChange}/>
      				{category}
      			</label>
      		);
		}

		return (
		<form id="saveAsModule">
			<header>
				<h1>Save as Module</h1>
				<button onClick={this.cancel}>&times;</button>
			</header>
			<main>
				<div>Module Name</div>
				<input type="text" className={invalidClassString} name="name" value={this.state.name} onChange={this.onFromChange}/>
				<div>Description</div>
				<textarea name="description" value={this.state.description} onChange={this.onFromChange}/>
				<div>Categories</div>
				<p>Select or leave uncategorised.</p>
				{categoryItems} 					
			</main>
			<footer>
				<input type="button" className={buttonClassString} onClick={this.submit} value="Save"/>
				<input type="button" onClick={this.cancel} value="Cancel"/>
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