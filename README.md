# Conntrack Graphdat Plugin

**This is for Linux Only**

### Pre Reqs

The statistics are pulled from `$ sudo conntrack -L`.  If you run the command `$ sudo conntrack -L` and there is no output, you need to install the conntrack tools first.

For debian based OS's: `$ sudo apt-get install conntrack`
For redhat based OS's, follow the installation instructions on [pkgs.org](http://pkgs.org/download/conntrack-tools)

### Installation & Configuration

* The `source` to prefix the display in the legend for the Conntrack data.  It will default to the hostname of the server.
* The `mode` to prefix the display in the legend for the Conntrack data.  It will default to the hostname of the server.

#### Tracks the following metrics for [Conntrack](http://conntrack-tools.netfilter.org/)

The conntrack-tools are a set of free software userspace tools for Linux that allow system administrators interact with the Connection Tracking System, which is the module that provides stateful packet inspection for iptables. The conntrack-tools are the userspace daemon conntrackd and the command line interface conntrack.
