var modulesSeed = {
  "data" : {
    "module-seed-0001" : {
      "categories" : {
        "routing" : true
      },
      "description" : "Mirror flow to up to 8 interfaces.",
      "name" : "Mirror-8",
      "topology" : {
        "interfaces" : [
          {
            "capacity" : 1,
            "mode" : "in",
            "protocol" : "protocol-3we4"
          },
          {
            "capacity" : 8,
            "mode" : "out",
            "protocol" : "protocol-3we4"
          }
        ]
      },
      "version" : "0.0.1"
    },
    "module-seed-0002" : {
      "categories" : {
        "routing" : true
      },
      "description" : "Merge flows from up to 8 interfaces to a single interface.",
      "name" : "Merge-8",
      "topology" : {
        "interfaces" : [
          {
            "capacity" : 1,
            "mode" : "out",
            "protocol" : "protocol-3we4"
          },
          {
            "capacity" : 8,
            "mode" : "in",
            "protocol" : "protocol-3we4"
          }
        ]
      },
      "version" : "0.0.1"
    },
    "module-seed-0003" : {
      "categories" : {
        "routing" : true
      },
      "description" : "Divide bidirectional flow in to two bidirectional flows",
      "name" : "Divide",
      "topology" : {
        "interfaces" : [
          {
            "capacity" : 1,
            "mode" : "out",
            "protocol" : "protocol-3we4"
          },
          {
            "capacity" : 1,
            "mode" : "in",
            "protocol" : "protocol-3we4"
          },
          {
            "capacity" : 1,
            "mode" : "bi",
            "protocol" : "protocol-3we4"
          }
        ]
      },
      "version" : "0.0.1"
    },
    "module-seed-0004" : {
      "categories" : {
        "translation" : true
      },
      "description" : "Translate <format1Name> to <format2Name>, <format3Name> or <format4Name> formats.",
      "name" : "Translate",
      "topology" : {
        "interfaces" : [
          {
            "capacity" : 1,
            "mode" : "in",
            "protocol" : "protocol-3we4"
          },
          {
            "capacity" : 1,
            "mode" : "out",
            "protocol" : "protocol-14rf"
          },
          {
            "capacity" : 1,
            "mode" : "out",
            "protocol" : "protocol-26tg"
          },
          {
            "capacity" : 1,
            "mode" : "out",
            "protocol" : "protocol-49iu"
          }
        ]
      },
      "version" : "0.0.1"
    },
    "module-seed-0005" : {
      "categories" : {
        "security" : true,
        "translation" : true
      },
      "description" : "Filter event streams.",
      "name" : "Filter",
      "topology" : {
        "interfaces" : [
          {
            "capacity" : 1,
            "mode" : "in",
            "protocol" : "protocol-3we4"
          },
          {
            "capacity" : 1,
            "mode" : "out",
            "protocol" : "protocol-3we4"
          },
          {
            "capacity" : 1,
            "mode" : "out",
            "protocol" : "protocol-26tg"
          }
        ]
      },
      "version" : "0.0.1"
    },
    "module-seed-0006" : {
      "categories" : {
        "analysis" : true
      },
      "description" : "Count packets and events.",
      "name" : "Count",
      "topology" : {
        "interfaces" : [
          {
            "capacity" : 1,
            "mode" : "in",
            "protocol" : "protocol-3we4"
          }
        ]
      },
      "version" : "0.0.1"
    },
    "module-seed-0007" : {
      "categories" : {
        "analysis" : true
      },
      "description" : "Plot packets and events.",
      "name" : "Plot",
      "topology" : {
        "interfaces" : [
          {
            "capacity" : 1,
            "mode" : "in",
            "protocol" : "protocol-3we4"
          }
        ]
      },
      "version" : "0.0.1"
    },
    "module-seed-0008" : {
      "categories" : {
        "security" : true
      },
      "description" : "Apply security policy rules to event streams.",
      "name" : "Policy",
      "topology" : {
        "interfaces" : [
          {
            "capacity" : 1,
            "mode" : "in",
            "protocol" : "protocol-3we4"
          },
          {
            "capacity" : 1,
            "mode" : "out",
            "protocol" : "protocol-3we4"
          }
        ]
      },
      "version" : "0.0.1"
    }
  },
  "shared" : {
    "categories" : {
      "analysis" : {
        "description" : "Modules for visualizing event streams and flows.",
        "modules" : {
          "module-seed-0006" : true,
          "module-seed-0007" : true
        }
      },
      "routing" : {
        "description" : "Modules for routing traffic flows and for creating network topology.",
        "modules" : {
          "module-seed-0001" : true,
          "module-seed-0002" : true,
          "module-seed-0003" : true
        }
      },
      "security" : {
        "description" : "Modules for adding security features to traffic flows.",
        "modules" : {
          "module-seed-0005" : true,
          "module-seed-0008" : true
        }
      },
      "translation" : {
        "description" : "Modules for translating one event encapsulation format to another.",
        "modules" : {
          "module-seed-0004" : true,
          "module-seed-0005" : true
        }
      }
    },
    "protocols" : {
      "protocol-14rf" : {
        "hue" : 112,
        "name" : "DCOM"
      },
      "protocol-26tg" : {
        "hue" : 190,
        "name" : "FTP"
      },
      "protocol-3we4" : {
        "hue" : 220,
        "name" : "IMAP"
      },
      "protocol-49iu" : {
        "hue" : 300,
        "name" : "TCP-IP"
      }
    }
  }
}

var projectTemplate = {
  "name": "Untitled Project",
  "version": "0.0.1",
  "topology": {
    "host_interfaces": {
      "host-0001": {
        "mode": "bi",
        "protocol": "protocol-3we4"
      },
      "host-0002": {
        "mode": "bi",
        "protocol": "protocol-14rf"
      },
      "host-0003": {
        "mode": "bi",
        "protocol": "protocol-49iu"
      },
      "host-0004": {
        "mode": "bi",
        "protocol": "protocol-26tg"
      }
    }
  },
  "view": {
    "host-0001": {
      "x": 20,
      "y": headerHeight + 15
    },
    "host-0002": {
      "x": 130,
      "y": headerHeight + 15
    },
    "host-0003": {
      "x": 240,
      "y": headerHeight + 15
    },
    "host-0004": {
      "x": 350,
      "y": headerHeight + 15
    }
  }
}

var projectsSeed = {
  "project-00001" : projectTemplate
}