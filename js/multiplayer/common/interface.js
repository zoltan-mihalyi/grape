define([], function () {
    function identity(val) {
        return val;
    }

    var MessageBuffer = Grape.Class('Multiplayer.MessageBuffer', {
        init: function (interf, target, send) {
            this._interface = interf;
            this._target = target;
            this._send = send;
            this._messages = [];
        },
        addMessage: function (method, parameters) {
            var commandData = this._interface._methodsByName[method],
                ret = [],
                methodParameters, parameter;
            if (!commandData) {
                throw new Error('Message type "' + method + '" does not exist.');
            }
            methodParameters = commandData.parameters;

            ret.push(commandData.id); //first element is command id

            for (var i = 0; i < methodParameters.length; i++) { //todo optimize loop
                parameter = methodParameters[i];
                ret.push(parameter.compressor.call(this._target, parameters[parameter.name])); //other elements are the fixed parameters
            }
            this._messages.push(ret); //todo command order, merge
            //this.emit('messageAdded');
        },
        flushMessages: function () {
            if(this._messages.length) {
                this._send(JSON.stringify(this._messages));
                this._messages = [];
            }
        }
    });

    var Interface = Grape.Class('Multiplayer.Interface', {
        init: function () {
            this._nextId = 1;
            this._methodNamesById = {}; //todo rename to message type
            this._methodsByName = {};
        },
        addMethod: function (name, parameters) {
            var id = this._nextId++,
                params = [],
                i;
            if (this._methodsByName[name]) {
                throw 'Method "' + name + '" is already registered.';
            }

            for (i = 0; i < parameters.length; i++) {
                params.push({
                    name: parameters[i],
                    compressor: identity,
                    decompressor: identity
                });
            }

            this._methodsByName[name] = {
                id: id,
                parameters: params
            };

            this._methodNamesById[id] = name;
        },
        addParameterCompressor: function (name, parameter, compressor) {
            var params = this._methodsByName[name].parameters,
                i;
            for (i = 0; i < params.length; i++) {
                if (params[i].name === parameter) {
                    params[i].compressor = compressor;
                }
            }
        },
        addParameterDecompressor: function (name, parameter, decompressor) { //todo almost same as addP.compressor
            var params = this._methodsByName[name].parameters,
                i;
            for (i = 0; i < params.length; i++) {
                if (params[i].name === parameter) {
                    params[i].decompressor = decompressor;
                }
            }
        },
        receiveMessages:function(messages, target, onMessage){
            var i, j, compressed, methodName, methodData, methodParameters, parameters;
            messages = JSON.parse(messages);
            for (i = 0; i < messages.length; i++) { //todo only run on frame? (receive buffer)
                compressed = messages[i];
                methodName=this._methodNamesById[compressed[0]];
                methodData = this._methodsByName[methodName];
                methodParameters = methodData.parameters;
                parameters = [];
                for (j = 0; j < methodParameters.length; j++) { //todo optimize loop
                    parameters.push(methodParameters[j].decompressor.call(target, compressed[j + 1]));
                }
                onMessage(methodName, parameters);
            }
        },
        createBuffer: function (target, send) {
            return new MessageBuffer(this, target, send);
        }
    });

    return Interface;
});