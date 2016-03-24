var Home = React.createClass({
	openMenu: function(event){
		this.props.openMenu(event)
	},

	render: function() {
        var addObjectClass = "add";
        var homeActionsClass = "app-actions";
        var openMenuClass = " isOpenMenu"

        if (this.props.menuTarget.name == "homeActions"){
            homeActionsClass += openMenuClass
        }
        if (this.props.menuTarget.name == "addObject"){
            addObjectClass += openMenuClass
        }
		return (
			<div className="home">
				<img className="logo" src="img/logo.png"/>
				<h1>Hover Console</h1>
				<button className={addObjectClass} name="addObject" onClick={this.openMenu}>+</button>
				<button className={homeActionsClass} name="homeActions" onClick={this.openMenu}></button>
			</div>
		);
	},
});