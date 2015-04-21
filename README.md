# Conntrack Plugin

The Conntrack plugin checks kernel level metrics provided by the Netfilter Conntrack tools

### Prerequisites

|     OS    | Linux | Windows | SmartOS | OS X |
|:----------|:-----:|:-------:|:-------:|:----:|
| Supported |   X   |    -    |    -    |  -   |

#### Boundary Meter Versions V4.0 Or Later

- To install new meter go to Settings->Installation or [see instructons|https://help.boundary.com/hc/en-us/sections/200634331-Installation]. 
- To upgrade the meter to the latest version - [see instructons|https://help.boundary.com/hc/en-us/articles/201573102-Upgrading-the-Boundary-Meter].


|  Runtime | node.js | Python | Java |
|:---------|:-------:|:------:|:----:|
| Required |         |        |      |

#### For Boundary Meter less than V4.0

NOT SUPPORTED!

### Plugin Setup

**If you run the command `$ sudo conntrack -L` and there is no output, you need to install the conntrack tools first.**

For debian based OS's: `$ sudo apt-get install conntrack`
For redhat based OS's, follow the installation instructions on [pkgs.org](http://pkgs.org/download/conntrack-tools) or this [gist](https://gist.github.com/codemoran/8309269)

### Plugin Configuration Fields

#### All Versions

|Field Name  |Field Title    |Description                                |
|:-----------|:--------------|:------------------------------------------|
|pollInterval|Poll Interval  |How often should the plugin poll conntrack |
|mode        |Reporting Level|Use basic or advanced mode with conntrack  |
|source      |Source         |Display name in the UI for this data       |

### Metrics Collected

#### All Versions

|Metric Name          |Display Name                 |Description                                                      |
|:--------------------|:----------------------------|:----------------------------------------------------------------|
|CONNTRACK_ASSURED    |Assured IP Connection Count  |Number of [ASSURED] IP Connections                               |
|CONNTRACK_CONNECTIONS|IP Connections               |Number of TCP and UDP connections                                |
|CONNTRACK_ESTABLISHED|TCP Established Count        |Number of TCP sockets in ESTABLISHED state                       |
|CONNTRACK_FINWAIT    |TCP Final Wait Count         |Number of TCP sockets in FIN_WAIT state                          |
|CONNTRACK_LIMIT      |IP Connection Limit          |Ratio of current IP connections to total available IP connections|
|CONNTRACK_SYNSENT    |TCP Synchronise Count        |Number of TCP sockets in SYN_SENT state                          |
|CONNTRACK_TIMEWAIT   |TCP Time Wait Count          |Number of TCP sockets in TIME_WAIT state                         |
|CONNTRACK_UDP        |UDP Connection Count         |Number of current UDP connections                                |
|CONNTRACK_UNREPLIED  |Unreplied IP Connection Count|Number of [UNREPLIED] IP Connections                             |

### Conntrack Information

The conntrack-tools are a set of free software userspace tools for Linux that allow system administrators interact with the Connection Tracking System, which is the module that provides stateful packet inspection for iptables. The conntrack-tools are the userspace daemon conntrackd and the command line interface conntrack.
