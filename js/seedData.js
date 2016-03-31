var modulesSeed = {
  "data" : {
    "module-seed-0001" : {
      "categories" : {
        "topology" : true
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
        "topology" : true
      },
      "description" : "Merge flows from up to 8 interfaces to a single interface.",
      "name" : "Merge-256",
      "topology" : {
        "interfaces" : [
          {
            "capacity" : 1,
            "mode" : "out",
            "protocol" : "protocol-3we4"
          },
          {
            "capacity" : 256,
            "mode" : "in",
            "protocol" : "protocol-3we4"
          }
        ]
      },
      "version" : "0.0.1"
    },
    "module-seed-0003" : {
      "categories" : {
        "topology" : true
      },
      "description" : "Divide bidirectional flow in to two unidirectional flows",
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
        "instrumentation" : true
      },
      "type" : "instrument",
      "description" : "Count packets and events.",
      "name" : "Count",
      "view" : {
        "height" : 95,
        "width" : 120
      },
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
        "instrumentation" : true
      },
      "description" : "Plot packets and events.",
      "type" : "instrument",
      "name" : "Plot",
      "view" : {
        "height": 200,
        "width" : 300
      },
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
        "policy" : true
      },
      "description" : "Basic security policy.",
      "name" : "Security Policy",
      "rules" : [
        {
          "priority" : "1"
        },
        {
          "priority" : "1"
        },
        {
          "priority" : "1"
        }
      ],
      "type" : "policy",
      "version" : "0.0.1",
      "view" : {
        "hue" : 0
      }
    },
    "module-seed-0009" : {
      "categories" : {
        "topology" : true
      },
      "description" : "Load balance flows between up to 256 interfaces.",
      "name" : "Balance-256",
      "topology" : {
        "interfaces" : [
          {
            "capacity" : 256,
            "mode" : "out",
            "protocol" : "protocol-3we4"
          },
          {
            "capacity" : 1,
            "mode" : "in",
            "protocol" : "protocol-3we4"
          }
        ]
      },
      "version" : "0.0.1"
    },
    "module-seed-0010" : {
      "categories" : {
        "instrumentation" : true
      },
      "description" : "Show statistical analyses of event flow data.",
      "type" : "instrument",
      "name" : "Histogram",
      "view" : {
        "height" : 200,
        "width" : 300
      },
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
    }
  },
  "shared" : {
    "categories" : {
      "instrumentation" : {
        "description" : "Modules for visualizing event streams and flows.",
        "modules" : {
          "module-seed-0006" : true,
          "module-seed-0007" : true,
          "module-seed-0010" : true
        }
      },
      "policy" : {
        "description" : "Modules for adding security features to traffic flows.",
        "modules" : {
          "module-seed-0008" : true
        }
      },
      "topology" : {
        "description" : "Modules for routing traffic flows and for creating network topology.",
        "modules" : {
          "module-seed-0001" : true,
          "module-seed-0002" : true,
          "module-seed-0003" : true,
          "module-seed-0009" : true
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
  "version": "0.0.1"
}

var projectsSeed = {
  "project-00001" : projectTemplate
}