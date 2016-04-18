var modulesSeed = {
  "data" : {
    "module-0001" : {
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
    "module-0002" : {
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
    "module-0003" : {
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
            "protocol" : "protocol-3we4",
            "view" : {
              "defaultFace" : "bottom"
            }
          },
          {
            "capacity" : 1,
            "mode" : "in",
            "protocol" : "protocol-3we4",
            "view" : {
              "defaultFace" : "bottom"
            }
          },
          {
            "capacity" : 1,
            "mode" : "bi",
            "protocol" : "protocol-3we4",
            "view" : {
              "defaultFace" : "top"
            }
          }
        ]
      },
      "version" : "0.0.1"
    },
    "module-0004" : {
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
    "module-0005" : {
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
            "protocol" : "protocol-3we4",
            "view" : {
              "defaultFace" : "right"
            }
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
    "module-0006" : {
      "categories" : {
        "instrumentation" : true
      },
      "description" : "Count packets and events.",
      "name" : "Count",
      "type" : "instrument",
      "version" : "0.0.1",
      "view" : {
        "height" : 95,
        "width" : 120
      }
    },
    "module-0007" : {
      "categories" : {
        "instrumentation" : true
      },
      "description" : "Plot packets and events.",
      "name" : "Plot",
      "type" : "instrument",
      "version" : "0.0.1",
      "view" : {
        "height" : 200,
        "width" : 300
      }
    },
    "module-0008" : {
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
    "module-0009" : {
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
    "module-0010" : {
      "categories" : {
        "instrumentation" : true
      },
      "description" : "Show statistical analyses of event flow data.",
      "name" : "Histogram",
      "type" : "instrument",
      "version" : "0.0.1",
      "view" : {
        "height" : 200,
        "width" : 300
      }
    },
    "module-0011" : {
      "categories" : {
        "policy" : true
      },
      "description" : "Policy describing scaling rules for components.",
      "name" : "Scaling Policy",
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
        "hue" : 240
      }
    },
    "module-0012" : {
      "categories" : {
        "instrumentation" : true
      },
      "description" : "Flame Graph usefulness...",
      "name" : "Flame",
      "type" : "instrument",
      "version" : "0.0.1",
      "view" : {
        "height" : 200,
        "width" : 300
      }
    },
    "module-0013" : {
      "categories" : {
        "policy" : true
      },
      "description" : "Policy describing other rules.",
      "name" : "Other Policy",
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
        "hue" : 300
      }
    }
  },
  "shared" : {
    "categories" : {
      "instrumentation" : {
        "description" : "Modules for visualizing event streams and flows.",
        "modules" : {
          "module-0006" : true,
          "module-0007" : true,
          "module-0010" : true,
          "module-0012" : true
        }
      },
      "policy" : {
        "description" : "Modules for adding security features to traffic flows.",
        "modules" : {
          "module-0008" : true,
          "module-0011" : true,
          "module-0013" : true
        }
      },
      "topology" : {
        "description" : "Modules for routing traffic flows and for creating network topology.",
        "modules" : {
          "module-0001" : true,
          "module-0002" : true,
          "module-0003" : true,
          "module-0009" : true
        }
      },
      "translation" : {
        "description" : "Modules for translating one event encapsulation format to another.",
        "modules" : {
          "module-0004" : true,
          "module-0005" : true
        }
      }
    },
    "protocols" : {
      "protocol-14rf" : {
        "hue" : 290,
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
        "hue" : 100,
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