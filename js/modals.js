var ImportJSONForm = React.createClass({
	getInitialState: function() {
   		return {
			fileData: false
		};
	},

	cancel: function(event) {
		event.preventDefault();
		this.props.cancel(this.props.modalName)
	},

	submit: function(event) {
		event.preventDefault();
		var submitPayload = "";

		var file = this.state.fileData.files[0];

		var reader = new FileReader();
    	reader.readAsText(file);

    	reader.onload = function(event) {
    		submitPayload = reader.result;
    		this.props.submit(this.props.modalName, submitPayload)
    	}.bind(this)		
	},

	onFormChange: function(event) {
		var elementName = event.target.attributes.name.value;
		if (elementName == "uploadField"){
			this.setState({fileData: event.target})
		}
	},

	render: function() {
		var buttonClassString = "affirmative";
		var fileName = this.state.fileName;
		if (fileName == false) {
			buttonClassString += " disabled";
		}
		return (
			<form id="importJSON">
				<header>
					<h1>Import Project JSON</h1>
					<button onClick={this.cancel}>&times;</button>
				</header>
				<main>
					<p>Choose a JSON file to import&hellip;</p>
					<input type="file" name="uploadField" accept="application/json" onChange={this.onFormChange}/>
				</main>
				<footer>
					<input type="button" className={buttonClassString} onClick={this.submit} value="Import"/>
					<input type="button" onClick={this.cancel} value="Cancel"/>
				</footer>
			</form>
		)
	}

});

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

	onFormChange: function(event) {
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
		var buttonClassString = "affirmative";
		var invalidClassString = "";
		if (this.state.name == "") {
			buttonClassString += " disabled";
			invalidClassString = "invalid"
		}
		var categoryItems = [];
		for (var category in this.props.categories) {
			
			if (category == "uncategorised") {continue}
			categoryItems.push(
      			<label key={category}>
      				<input type="checkbox" name={category} value={this.state.analytics} onChange={this.onFormChange}/>
      				{category}
      			</label>
      		);
		}

		return (
		<form id="saveAsModule">
			<header>
				<h1>Publish as IO Module</h1>
				<button onClick={this.cancel}>&times;</button>
			</header>
			<main>
				<div>Name</div>
				<input type="text" className={invalidClassString} name="name" value={this.state.name} onChange={this.onFormChange}/>
				<div>Description</div>
				<textarea name="description" value={this.state.description} onChange={this.onFormChange}/>
				<div>Categories</div>
				<p>Select or leave uncategorised.</p>
				{categoryItems} 					
			</main>
			<footer>
				<input type="button" className={buttonClassString} onClick={this.submit} value="Publish"/>
				<input type="button" onClick={this.cancel} value="Cancel"/>
			</footer>
		</form>
		)
	}
});

var LibrariesForm = React.createClass({
	getInitialState: function() {
   		return {
			modulesSrc: this.props.modulesSrc,
			projectsSrc: this.props.projectsSrc
		};
	},

	cancel: function(event) {
		event.preventDefault();
		this.props.cancel(this.props.modalName)
	},

	submit: function(event) {
		event.preventDefault();

		var submitPayload = {
			modulesSrc: this.state.modulesSrc,
			projectsSrc: this.state.projectsSrc
		}
		this.props.submit(this.props.modalName, submitPayload)
	},

	onFormChange: function(event) {
		var elementName = event.target.attributes.name.value;
		if (elementName == "moduleSrc"){
			this.setState({
				modulesSrc: event.target.value
			})
		}
		else if (elementName == "projectsSrc"){
			this.setState({
				projectsSrc: event.target.value
			})
		}
	},

	render: function() {
		var invalidClassString = "";
		var buttonClassString = "affirmative";
		var validationMessageString = "";
		if (this.state.modulesSrc == this.state.projectsSrc) {
			invalidClassString = "invalid";
			buttonClassString += " disabled";
			validationMessageString = "Locations for Projects and IO Modules must be different"
		}
		return (
		<form id="librariesForm">
			<header>
				<h1>Data Repositories</h1>
				<button onClick={this.cancel}>&times;</button>
			</header>
			<main>
				<p>Provide locations for Projects and IO Modules.</p>
				<div>Projects</div>
				<input className={invalidClassString} type="text" name="projectsSrc" value={this.state.projectsSrc} onChange={this.onFormChange}/>
				<p className="help">e.g. https:&#47;&#47;boiling-torch-3324.firebaseio.com&#47;development&#47;users&#47;jdoe&#47;projects</p>
				<div>IO Modules</div>
				<input className={invalidClassString} type="text" name="moduleSrc" value={this.state.modulesSrc} onChange={this.onFormChange}/>
				<p className="help">e.g. https:&#47;&#47;boiling-torch-3324.firebaseio.com&#47;development&#47;modules</p>
			</main>
			<footer>
				<span className="validationMessage">{validationMessageString}</span>
				<input type="button" className={buttonClassString}  onClick={this.submit} value="Save"/>
				<input type="button" onClick={this.cancel} value="Cancel"/>
			</footer>
		</form>
		)
	}
});

var IOVisorForm = React.createClass({
	getInitialState: function() {
   		return {
			iovisorLoc: this.props.iovisorLoc,
			invalidClassString: "",
			buttonClassString: "affirmative",
			validationMessageString: ""
		};
	},

	cancel: function(event) {
		event.preventDefault();
		this.props.cancel(this.props.modalName)
	},

	submit: function(event) {
		event.preventDefault();

		var submitPayload = {
			iovisorLoc: this.state.iovisorLoc
		}

		this.setState({
			buttonClassString: "affirmative disabled",
			validationMessageString: "Checking IO Visor path..."
		});

        $.ajax({
            url: this.state.iovisorLoc + "/modules/" 
        }).then(
            function(data) {
				this.props.submit(this.props.modalName, submitPayload)
            }.bind(this),
            function() {
            	this.setState({
            		invalidClassString: "invalid",
					buttonClassString: "affirmative disabled",
					validationMessageString: "IO Visor path invalid"
				});
                this.setState({
                    networkInterfaces: networkInterfaces
                });
            }.bind(this)
        );
	},

	onFormChange: function(event) {
		var elementName = event.target.attributes.name.value;
		if (elementName == "iovisorLoc"){
			console.log(event.target.value)
			this.setState({
				iovisorLoc: event.target.value,
				invalidClassString: "",
				buttonClassString: "affirmative",
				validationMessageString: ""
			})
		}
	},

	render: function() {
		return (
		<form id="IOVisorForm">
			<header>
				<h1>IO Visor Settings</h1>
				<button onClick={this.cancel}>&times;</button>
			</header>
			<main>
				<p>Provide Path for IO Visor IO Modules.</p>
				<div>IO Modules</div>
				<input className={this.state.invalidClassString} type="text" name="iovisorLoc" value={this.state.iovisorLoc} onChange={this.onFormChange}/>
				<p className="help">e.g. http://localhost:5000</p>
			</main>
			<footer>
				<span className="validationMessage">{this.state.validationMessageString}</span>
				<input type="button" className={this.state.buttonClassString}  onClick={this.submit} value="Save"/>
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


		if (this.props.modalName == "importJSON"){
			modal = (
				<div className="modalBackground">
	  				<div className="modalContainer">
	  					<ImportJSONForm
	  						modalName = {this.props.modalName}
	  						cancel = {this.cancel} 
	  						submit = {this.submit}/>
	  				</div>
	  			</div>	
			)
		}

		if (this.props.modalName == "librariesSettings"){
			modal = (
				<div className="modalBackground">
	  				<div className="modalContainer">
	  					<LibrariesForm
	  						modalName = {this.props.modalName} 
	  						projectsSrc = {this.props.projectsSrc} 
	  						modulesSrc = {this.props.modulesSrc}
	  						cancel = {this.cancel} 
	  						submit = {this.submit}/>
	  				</div>
	  			</div>	
			)
		}

		if (this.props.modalName == "IOVisorSettings"){
			modal = (
				<div className="modalBackground">
	  				<div className="modalContainer">
	  					<IOVisorForm
	  						modalName = {this.props.modalName}
	  						iovisorLoc = {this.props.iovisorLoc}
	  						cancel = {this.cancel} 
	  						submit = {this.submit}/>
	  				</div>
	  			</div>	
			)
		}

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