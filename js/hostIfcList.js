var HostIfcList = React.createClass({

  onNetIfcClick : function(event){
    this.props.onIfcMappingClick(event.target.getAttribute("name"), "network");   
  },

  onStorIfcClick : function(event){
    this.props.onIfcMappingClick(event.target.getAttribute("name"), "storage");    
  },

	render: function() {	
    var projectHostIfcs = this.props.selectedProjectHostIfcs;
    var localHostIfcMap = this.props.selectedProjectIfcMapping;
    var networkInterfaces = this.props.networkInterfaces;

    var networkJsxArr = [];
    var storageJsxArr = [];

    var selectedLocalIfcs = [];

    for (var projectIfc in localHostIfcMap) {
      if (projectHostIfcs[projectIfc]){
        selectedLocalIfcs.push(localHostIfcMap[projectIfc]);
      }
    }

    for (var i in networkInterfaces) {
      var classString = "";
      if (_.includes(selectedLocalIfcs,networkInterfaces[i].name)) {
        classString = "selected"
      }
      networkJsxArr.push(
        <div key={i} name={networkInterfaces[i].name} className={classString} onClick={this.onNetIfcClick}>
        {networkInterfaces[i].name}
        </div>
      )
    }

    for (var i in storageInterfaces)  {
      var classString = "";
      if (_.includes(selectedLocalIfcs,storageInterfaces[i].name)) {
        classString = "selected"
      }
      storageJsxArr.push(
          <div key={i} name={storageInterfaces[i].name} className={classString} onClick={this.onStorIfcClick}>
          {storageInterfaces[i].name}
          </div>
        )
    }

  	return (
      <div className="ifcContainer">
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