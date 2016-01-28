var projectsSeed = {
  "project-00001" : projectTemplate
}

var modulesSeed = {
  "data" : {
    "module-1" : {
      "categories" : {
        "translation" : true
      },
      "description" : "Packet Translator translates packets from one encapsulation format to another.",
      "interfaces" : {
        "interface-1" : {
          "mode" : "bidirectional",
          "protocol" : "protocol-1"
        },
        "interface-2" : {
          "mode" : "bidirectional",
          "protocol" : "protocol-2"
        },
        "interface-3" : {
          "mode" : "bidirectional",
          "protocol" : "protocol-3"
        },
        "interface-4" : {
          "mode" : "bidirectional",
          "protocol" : "protocol-4"
        }
      },
      "name" : "Packet Translator",
      "version" : "0.0.2"
    },
    "module-2" : {
      "categories" : {
        "routing" : true
      },
      "description" : "Mirrorly mirrors traffic to up to 5 interfaces.",
      "interfaces" : {
        "interface-1" : {
          "mode" : "output",
          "protocol" : "protocol-4"
        },
        "interface-10" : {
          "mode" : "output",
          "protocol" : "protocol-4"
        },
        "interface-11" : {
          "mode" : "output",
          "protocol" : "protocol-4"
        },
        "interface-12" : {
          "mode" : "output",
          "protocol" : "protocol-4"
        },
        "interface-13" : {
          "mode" : "output",
          "protocol" : "protocol-4"
        },
        "interface-14" : {
          "mode" : "output",
          "protocol" : "protocol-4"
        },
        "interface-15" : {
          "mode" : "output",
          "protocol" : "protocol-4"
        },
        "interface-2" : {
          "mode" : "input",
          "protocol" : "protocol-4"
        },
        "interface-3" : {
          "mode" : "output",
          "protocol" : "protocol-4"
        },
        "interface-4" : {
          "mode" : "bidirectional",
          "protocol" : "protocol-3"
        },
        "interface-5" : {
          "mode" : "output",
          "protocol" : "protocol-4"
        },
        "interface-6" : {
          "mode" : "output",
          "protocol" : "protocol-4"
        },
        "interface-7" : {
          "mode" : "output",
          "protocol" : "protocol-4"
        },
        "interface-8" : {
          "mode" : "output",
          "protocol" : "protocol-4"
        },
        "interface-9" : {
          "mode" : "output",
          "protocol" : "protocol-4"
        }
      },
      "name" : "Mirrorly",
      "version" : "0.3.1"
    },
    "module-3" : {
      "categories" : {
        "security" : true
      },
      "description" : "Throttles traffic to a defined rate.",
      "interfaces" : {
        "interface-1" : {
          "mode" : "input",
          "protocol" : "protocol-4"
        },
        "interface-2" : {
          "mode" : "output",
          "protocol" : "protocol-4"
        },
        "interface-3" : {
          "mode" : "output",
          "protocol" : "protocol-1"
        },
        "interface-4" : {
          "mode" : "input",
          "protocol" : "protocol-1"
        }
      },
      "name" : "Throttle",
      "version" : "0.0.1"
    },
    "module-4" : {
      "categories" : {
        "analysis" : true
      },
      "description" : "Graphs traffic by type.",
      "interfaces" : {
        "interface-1" : {
          "mode" : "output",
          "protocol" : "protocol-2"
        },
        "interface-2" : {
          "mode" : "bidirectional",
          "protocol" : "protocol-3"
        },
        "interface-3" : {
          "mode" : "input",
          "protocol" : "protocol-4"
        },
        "interface-4" : {
          "mode" : "output",
          "protocol" : "protocol-4"
        }
      },
      "name" : "Traffic Grapher",
      "version" : "0.0.1"
    },
    "module-5" : {
      "categories" : {
        "uncategorised" : true
      },
      "description" : "Module with long name to test overflow treatment",
      "interfaces" : {
        "interface-1" : {
          "mode" : "input",
          "protocol" : "protocol-1"
        },
        "interface-2" : {
          "mode" : "output",
          "protocol" : "protocol-1"
        },
        "interface-3" : {
          "mode" : "bidirectional",
          "protocol" : "protocol-3"
        },
        "interface-4" : {
          "mode" : "input",
          "protocol" : "protocol-1"
        },
        "interface-5" : {
          "mode" : "input",
          "protocol" : "protocol-1"
        },
        "interface-6" : {
          "mode" : "output",
          "protocol" : "protocol-1"
        },
        "interface-7" : {
          "mode" : "output",
          "protocol" : "protocol-1"
        }
      },
      "name" : "Generic Module",
      "version" : "0.0.1"
    }
  },
  "shared" : {
    "categories" : {
      "analysis" : {
        "description" : "Text describing category",
        "modules" : {
          "module-4" : true
        }
      },
      "routing" : {
        "description" : "Text describing category",
        "modules" : {
          "module-2" : true
        }
      },
      "security" : {
        "description" : "Text describing category",
        "modules" : {
          "module-3" : true
        }
      },
      "translation" : {
        "description" : "Text describing category",
        "modules" : {
          "module-1" : true
        }
      },
      "uncategorised" : {
        "description" : "Text describing category",
        "modules" : {
          "module-5" : true
        }
      }
    },
    "protocols" : {
      "protocol-1" : {
        "hue" : 112,
        "name" : "DCOM"
      },
      "protocol-2" : {
        "hue" : 190,
        "name" : "FTP"
      },
      "protocol-3" : {
        "hue" : 220,
        "name" : "IMAP"
      },
      "protocol-4" : {
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
        "mode": "in",
        "protocol": "protocol-3we4"
      },
      "host-0002": {
        "mode": "out",
        "protocol": "protocol-14rf"
      },
      "host-0003": {
        "mode": "bi",
        "protocol": "protocol-49iu"
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
    }
  }
}