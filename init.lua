local boundary = require("boundary")
local timer = require("timer")
local fs = require("fs")
local spawn = require("childprocess").spawn

local param = boundary.param or {
    pollInterval = 5000,
    mode = "basic"
}

local analyse = function(tbl)
    local states = {}
    local total = 0
    local assured = 0
    local unreplied = 0
    for line in string.gmatch(tbl, "[^\n]+") do
        local tokens = {}
        -- return 1 if one of the tokens is s otherwise 0
        local findtoken = function(s)
            for i, v in ipairs(tokens) do
                if v == s then return 1 end
            end
            return 0
        end
        -- tokenise
        for t in string.gmatch(line, "[^ ]+") do table.insert(tokens, t) end
        -- analyse
        if tokens[1] == "tcp" or tokens[1] == "udp" then
            total = total + 1
            if tokens[1] == "tcp" then
                states[tokens[4]] = (states[tokens[4]] or 0) + 1
            elseif tokens[1] == "udp" then
                states.UDP = (states.UDP or 0) + 1
            end
            assured   = assured   + findtoken("[ASSURED]")
            unreplied = unreplied + findtoken("[UNREPLIED]")
        end
    end
    return { states = states, total = total, assured = assured, unreplied = unreplied }
end

local maxConnections

local show = function(stats)
    print(string.format('CONNTRACK_CONNECTIONS %d %s', stats.total, param.source))
    print(string.format('CONNTRACK_LIMIT %f %s', stats.total / maxConnections, param.source))
    if param.mode == 'advanced' then
        print(string.format('CONNTRACK_ESTABLISHED %d %s', stats.states.ESTABLISHED or 0, param.source))
        print(string.format('CONNTRACK_FINWAIT %d %s', stats.states.FIN_WAIT or 0, param.source))
        print(string.format('CONNTRACK_TIMEWAIT %d %s', stats.states.TIME_WAIT or 0, param.source))
        print(string.format('CONNTRACK_SYNSENT %d %s', stats.states.SYN_SENT or 0, param.source))
        print(string.format('CONNTRACK_UDP %d %s', stats.states.UDP or 0, param.source))
        print(string.format('CONNTRACK_ASSURED %d %s', stats.assured or 0, param.source))
        print(string.format('CONNTRACK_UNREPLIED %d %s', stats.unreplied or 0, param.source))
    end
end

-- probably could use execFile here but not sure about error handling
-- in luvit version fc9be1fa48a9d5
local exec = function(progname, args, callback)
    local data = {}
    local c = spawn(progname, args)
    c.stdout:on("data", function(chunk) table.insert(data, chunk) end)
    c.stdout:once("end", function() callback(table.concat(data)) end)
    c:on("exit", function(code, signal)
        if code == -1 then
            error(string.format("Unable to run %s.", progname))
        elseif code > 0 then
            error(string.format("%s error (errno %d)", progname, code))
        end
    end)
end

print("_bevent:Boundary conntrack plugin up : version 1.0|t:info|tags:lua,conntrack,plugin")

exec("sysctl", {"-n", "net.netfilter.nf_conntrack_max"}, function(maxconn)
    maxConnections = maxconn
    local conntrack = function()
        exec("conntrack", {"-L"}, function(connections)
            show(analyse(connections))
        end)
    end 
    local setupPoll = function()
        timer.setInterval(param.pollInterval, conntrack)
        conntrack()
    end
    if param.source then
        setupPoll()
    else
        exec("hostname", {}, function(hostname)
            param.source = string.sub(hostname, 1, -2)
            setupPoll()
        end)
    end
end)

