var PriorityList = React.createClass({
  handleClick: function(event) {
    this.props.handleActions(event)
  },

	render: function() {	
    var policies = this.props.project.policies;
    var dependencies = this.props.project.dependencies;
    var policyModuleArray = [];

    _.forEach(policies, function(policy, id){
      policyModuleArray.push({
        "module": policy.module,
        "name": dependencies[policy.module].name,
        "version": dependencies[policy.module].version,
        "priority": policy.priority
      });
    });

    policyModuleArray = _.uniqWith(policyModuleArray, _.isEqual);
    policyModuleArray = _.sortBy(policyModuleArray, 'priority');

    var listJSX = [];

    _.forEach(policyModuleArray, function(item, i){
      listJSX.push(
        <div className="listItem" key={i}>
          <span>{(i+1) + ": "}</span>
          <span className="itemName">{item.name}</span>
          <span className="version">{item.version}</span>
          <button className="priorityUp" onClick={this.handleClick} name="priorityUp" data-module={item.module} data-priority={item.priority}><span className="caretUp"></span></button>
          <button className="priorityDown" onClick={this.handleClick} name="priorityDown" data-module={item.module} data-priority={item.priority}><span className="caret"></span></button>
        </div>
      )
    }.bind(this))

  	return (
      <div className="priorityContainer">
        <div className="priorityList">
          {listJSX}
        </div>
      </div>
		);
	},
});