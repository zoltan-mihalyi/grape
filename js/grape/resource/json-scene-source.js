define(['class', 'game/scene', 'resource/cacheable', 'utils'], function (Class, Scene, Cacheable, Utils) {
    return Class('JSONSceneSource', Cacheable, { //TODO unload unnecessary scenes?
        init: function (url, settings) {
            this.url = url;
            this.typeMapping = settings.typeMapping || {};
            this.type = settings.type || Scene;
            this.data = null;
        },
        'override loadResource': function (onFinish, onError) {
            Utils.ajax(this.url, function (response) {
                onFinish(Utils.parseJSON(response));
            }, function () {
                onError();
            });
        },
        'override getResourceKey': function () {
            return this.url;
        },
        'override process': function (data) {
            this.data = data;
        },
        'create': function () {
            var i, j, scene, row, inst, clazz, data, typeProp, w, h, instances = this.data.instances ? this.data.instances.slice(0) : [];
            if (this.data === null) {
                throw 'Scene not loaded yet.';
            }
            scene = new this.type();

            w = this.data.cellWidth || 1;
            h = this.data.cellHeight || 1;

            if (this.data.matrix) {
                for (i = 0; i < this.data.matrix.length; i++) {
                    row = this.data.matrix[i];
                    for (j = 0; j < row.length; j++) {
                        instances.push([row[j], j * w, i * h]);
                    }
                }
            }

            for (i = 0; i < instances.length; i++) {
                inst = instances[i];
                if (inst.type) {//object format
                    typeProp = 'type';
                    data = inst.data;
                } else { //array format
                    typeProp = '0';
                    data = {x: inst[1], y: inst[2]};
                }

                clazz = this.typeMapping[inst[typeProp]];
                if (clazz !== null) {
                    if (!clazz) { //undefined
                        throw 'Type "' + inst[typeProp] + '" is not registered in the type mapping.';
                    }
                    scene.add(new clazz(data));
                }
            }

            return scene;
        }
    });
});