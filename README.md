# Conntrack Graphdat Plugin

DO NOT INSTALL! Conntrack plugin is going to be removed as it is not supported under new Boudnary Meter. The similar functionality is planned to be added instead in near term. 

### Prerequisites

|     OS    | Linux | Windows | SmartOS | OS X |
|:----------|:-----:|:-------:|:-------:|:----:|
| Supported |   -   |    -    |    -    |  -   |


|  Runtime | node.js | Python | Java |
|:---------|:-------:|:------:|:----:|
| Required |    +    |        |      |

[How to install node.js?](https://help.boundary.com/hc/articles/202360701)

### Plugin Setup

**If you run the command `$ sudo conntrack -L` and there is no output, you need to install the conntrack tools first.**

For debian based OS's: `$ sudo apt-get install conntrack`
For redhat based OS's, follow the installation instructions on [pkgs.org](http://pkgs.org/download/conntrack-tools) or this [gist](https://gist.github.com/codemoran/8309269)

#### Installation & Configuration

* The `source` to prefix the display in the legend for the Conntrack data.  It will default to the hostname of the server.
* The `mode` to prefix the display in the legend for the Conntrack data.  It will default to the hostname of the server.

#### Tracks the following metrics for [Conntrack](http://conntrack-tools.netfilter.org/)

The conntrack-tools are a set of free software userspace tools for Linux that allow system administrators interact with the Connection Tracking System, which is the module that provides stateful packet inspection for iptables. The conntrack-tools are the userspace daemon conntrackd and the command line interface conntrack.
