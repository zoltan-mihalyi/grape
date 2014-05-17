define(['common/interface'], function (Interface) { //todo rename to clientInterface

    function decompressInstanceOnServer(syncedId) {
        return this._game.getScene()._syncedInstances[syncedId];
    }

    function decompressInstanceOnClient(syncedId) {
        return this.getScene()._syncedInstances[syncedId];
    }

    function compressInstance(instance) {
        return instance._syncedId;
    }

    var serverInterface = new Interface();
    var clientInterface = new Interface();

    clientInterface.addMethod('startScene', ['sceneId', 'sceneParameters']);
    clientInterface.addMethod('syncAttrs', ['instance', 'attributes']);
    clientInterface.addMethod('setControllable', ['instance']); //todo params?
    clientInterface.addMethod('command', ['command', 'instance', 'parameters']);

    clientInterface.addParameterCompressor('syncAttrs', 'instance', compressInstance);
    clientInterface.addParameterCompressor('setControllable', 'instance', compressInstance);
    clientInterface.addParameterCompressor('command', 'instance', compressInstance);

    clientInterface.addParameterDecompressor('syncAttrs', 'instance', decompressInstanceOnClient);
    clientInterface.addParameterDecompressor('setControllable', 'instance', decompressInstanceOnClient);
    clientInterface.addParameterDecompressor('command', 'instance', decompressInstanceOnClient);


    serverInterface.addMethod('command', ['command', 'instance', 'parameters']);

    serverInterface.addParameterCompressor('command', 'instance', compressInstance);
    serverInterface.addParameterDecompressor('command', 'instance', decompressInstanceOnServer);

    return {
        serverInterface: serverInterface,
        clientInterface: clientInterface
    };
});