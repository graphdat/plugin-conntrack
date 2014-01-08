/*jshint multistr: true */

// log the error as soon as possible
process.on('uncaughtException', function(err) {
    console.error('msg %s, name %s, stack->\n%s', err.message, err.name, err.stack || 'NONE');
    process.exit(-1);
});

var _os = require('os');
var _param = require('./param.json');
var _child = require('child_process');

var CONNTRACK_NOT_INSTALLED = '\
It does not look like conntrack is installed, please install it and re-run the relay\n \
	- Debian users run: sudo apt-get install conntrack\n \
	- Redhat users run: https://gist.github.com/codemoran/8309269\n';
var DEFAULT_TOTAL_CONNECTIONS = (_os.totalmem()/1024) * 64;
var STATES = ['ESTABLISHED', 'FIN_WAIT', 'TIME_WAIT', 'SYN_SENT', 'UDP'];

var _maxConnections; // the maximum number of connection available
var _mode; // the level of detail to report
var _pollInterval; // the interval to poll the metrics
var _source; // the source of the metrics

// ==========
// VALIDATION
// ==========

// which mode should we report 'basic' or 'advanced'
var _mode = _param.mode || 'basic';

// how often should we poll
var _pollInterval = (_param.pollSeconds && parseFloat(_param.pollSeconds) * 1000) ||
										(_param.pollInterval) ||
										5000;

// if we do not have a source, then set it
var _source = (_param.source && _param.source.trim() !== '') ? _param.source : _os.hostname();

// to call conntrack we need root access
var _isRoot = process.env.USER === 'root';
if (!_isRoot)
{
	console.error('This plugin requires root/sudo access');
	//process.exit(1);
}

// get the max value from the system so we can view the ratio of used connections
function getMaximumConnections(cb)
{
	function handleOutput(err, stderr, stdout)
	{
		if (err)
			return cb(err);
		if (stderr || !stdout)
			return cb(CONNTRACK_NOT_INSTALLED);

		var value = parseInt((stdout.split('=')[1] || '').trim());
		if (isNaN(value))
			return cb(null, DEFAULT_TOTAL_CONNECTIONS);
		else
			return cb(null, value);
	}

	_child.exec('sysctl net.netfilter.nf_conntrack_max', function(err, stdout, stderr)
	{
		// try the other conntrack key
		if (!err && stderr && stderr.indexOf('is an unknown key') !== -1)
			_child.exec('sysctl net.ipv4.netfilter.ip_conntrack_max', handleOutput);
		else
			handleOutput(err, stderr, stdout);
	});
}

// get the conntrack connection values
function getConnTrackValues(cb)
{
	var stderr = '';

	var assured = 0;
	var total = 0;
	var unreplied = 0;

	var state = {};
	STATES.forEach(function(s) { state[s] = 0; });

	var conntrack = _child.spawn('conntrack', ['-L']);
	conntrack.stderr.on('data', function (data) { stderr += data.toString(); });
	conntrack.stdout.on('data', function (data)
	{
		// parse the output
		var lines = data.toString().split('\n');
		lines.forEach(function(line)
		{
			var match = line.match(/^(tcp|udp)\s+(\d+)\s+(\d+)\s+(\w+)/);
			if (!match)
				return;

			if (match[1] === 'tcp' && STATES.indexOf(match[3]) !== -1)
				state[match[3]]++;

			if (match[1] === 'udp')
				state.UDP++;

			if (line.match(/ASSURED/))
				assured++;

			if (line.match(/UNREPLIED/))
				unreplied++;

			total++;
		});
	});
	conntrack.on('error', function(err)
	{
		return cb(CONNTRACK_NOT_INSTALLED);
	});
	conntrack.on('close', function (code)
	{
		if (stderr && !stderr.match(/flow entries have been shown/))
			return cb(stderr);

		if (code !== 0)
			return cb('conntrack exited with code ' + code);

		return cb && cb(null, {
			assured: assured,
			unreplied: unreplied,
			total: total,
			state: state
		});
	});
}

function poll(cb)
{
	getConnTrackValues(function(err, ct)
	{
		if (err)
			return console.error(err);

		ct = ct || {};
		ct.state = ct.state || {};

		var ratio = (ct.total || 0) / _maxConnections;

		if (_mode === 'basic' || _mode === 'advanced')
		{
			console.log('CONNTRACK_CONNECTIONS %d %s', ct.total, _source);
			console.log('CONNTRACK_LIMIT %d %s', ratio, _source); // precentage
		}

		if (_mode === 'advanced')
		{
			console.log('CONNTRACK_ESTABLISHED %d %s', ct.state.ESTABLISHED || 0, _source);
			console.log('CONNTRACK_FINWAIT %d %s', ct.state.FIN_WAIT || 0, _source);
			console.log('CONNTRACK_TIMEWAIT %d %s', ct.state.TIME_WAIT || 0, _source);
			console.log('CONNTRACK_SYNSENT %d %s', ct.state.SYN_SENT || 0, _source);
			console.log('CONNTRACK_UDP %d %s', ct.state.UDP || 0, _source);

			console.log('CONNTRACK_ASSURED %d %s', ct.assured || 0, _source);
			console.log('CONNTRACK_UNREPLIED %d %s', ct.unreplied || 0, _source);
		}

    setTimeout(poll, _pollInterval);
   });
}

// get the max number of connections the system
// allows so we can calculate the ratio
getMaximumConnections(function(err, maxConnections)
{
	if (err)
	{
		console.error(err);
		process.exit(1);
	}

	_maxConnections = maxConnections;
	poll();
});
