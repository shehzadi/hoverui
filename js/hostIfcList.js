var HostIfcList = React.createClass({
/*
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
*/
  onNetworkClick : function(event){
    console.log(event);
  },

  onStorageClick : function(event){
    console.log(event);
  },

  onNetIfcClick : function(event){
    //console.log(event.target.className, event.target.getAttribute("name"));
    this.props.onIfcClick(event.target.getAttribute("name"), "network");
    
  },

  onStorIfcClick : function(event){
    //console.log(event.target.className, event.target.getAttribute("name"));
    this.props.onIfcClick(event.target.getAttribute("name"), "storage");
    
  },
	render: function() {	
		//var categoryItems = [];
    var projectHostIfcs = this.props.selectedProjectHostIfcs;
    var localHostIfcMap = this.props.selectedProjectIfcMapping;

    var networkJsxArr = [];
    var storageJsxArr = [];

    var styleString = {
      position: "absolute",
      top: 0,
      left: 0,
      width: 200,
      height: 300,
      backgroundColor: "red"
    }

    

    //console.log(this.props.selectedProjectIfcMapping, this.props.selectedProjectHostIfcs);

    var selectedLocalIfcs = [];
    for (var projectIfc in localHostIfcMap) {
      console.log("Project IFCs", projectHostIfcs);
      if (projectHostIfcs[projectIfc]){
        //console.log("Adding to selectedLocalIfcs", localHostIfcMap[projectIfc]);
        selectedLocalIfcs.push(localHostIfcMap[projectIfc]);
      }
    }
    console.log(selectedLocalIfcs);

    for (var i in networkInterfaces) {
      //console.log(_.includes(selectedLocalIfcs,networkInterfaces[i].name));
      var classString = "";
      if (_.includes(selectedLocalIfcs,networkInterfaces[i].name)) {
        classString = "selected"
      }
      networkJsxArr.push(
        <div name={networkInterfaces[i].name} className={classString} onClick={this.onNetIfcClick}>
        {networkInterfaces[i].name}
        </div>
      )
      //console.log(networkInterfaces[i]);
    }
    for (var i in storageInterfaces)  {
      var classString = "";
      if (_.includes(selectedLocalIfcs,storageInterfaces[i].name)) {
        classString = "selected"
      }
      storageJsxArr.push(
          <div name={storageInterfaces[i].name} className={classString} onClick={this.onStorIfcClick}>
          {storageInterfaces[i].name}
          </div>
        )
      //console.log(networkInterfaces[i]);
    }
    //networkInterfaces
    //storageInterfaces

  	return (
      <div className="ifcContainer" style={styleString}>
        <div className="ifcList">
          <h2 onClick={this.onNetworkClick}>Network</h2>
          {networkJsxArr}
        </div>
        <div className="ifcList">
          <h2 onClick={this.onStorageClick}>Storage</h2>
          {storageJsxArr}
        </div>
      </div>
		);
	},
});