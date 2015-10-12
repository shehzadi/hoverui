var IOConsole = React.createClass({
	render: function() {
		return (
			<div id="IOConsole">
				<div id="navigation">
					<Home />
					<PrimaryNav />
				</div>
				<div id="main">
					<div id="header">
						<SecondaryNav />
						<Tools />
					</div>
					<div id="workspace">
						<Workspace />
					</div>
				</div>
			</div>
		);
	},
});

var Home = React.createClass({
	render: function() {	
		return (
			<div className="home">
				<img className="logo" src="img/logo.png"/>
				<h1>IO Visor Console</h1>
				<img className="app-actions" src="img/hamburger.svg"/>
			</div>
		);
	},
});

var PrimaryNav = React.createClass({
  render: function() {	
		return (
			<div className="primaryNav">
				<TopologySection />
				<ModuleSection />
			</div>
		);
	},
});

var TopologySection = React.createClass({
	getInitialState: function() {
    	return {
    		topologiesArray: [
    			{"name":"Ethernet Sniffer", "version":"0.2.0", "details":"Some text describing module"},
    			{"name":"Packet Mutilator", "version":"2.2.9", "details":"Some text describing module"},
    			{"name":"Event Manager", "version":"1.2.4", "details":"Some text describing module"}
    		],
    	};
  	},

	render: function() {
		var topologyItemCode = this.state.topologiesArray.map(function(item) {
      		return (
      			<div className="topologyItem">
      				<h2>{item.name}</h2><span>{item.version}</span>
      				<div className="topologyDetails">{item.details}</div>
      			</div>
      		);
    	});

		return (
			<section className="topologies">
				<h1>Projects</h1>
				<div>{topologyItemCode}</div>
			</section>
		);
	},
});

var ModuleSection = React.createClass({
	render: function() {	
		return (
			<section className="ioModules">
				<h1>IO Visor Modules</h1>
				Second Section Content
			</section>
		);
	},
});

var SecondaryNav = React.createClass({
	render: function() {	
		return (
			<div className="secondaryNav">
				Secondary Nav Content
			</div>
		);
	},
});

var Tools = React.createClass({
	render: function() {	
		return (
			<div className="tools">
				Tools Content
			</div>
		);
	},
});

var Workspace = React.createClass({
	render: function() {	
		return (
			<div className="workspace">
				Workspace Content
			</div>
		);
	},
});

React.render(<IOConsole></IOConsole>, document.body);