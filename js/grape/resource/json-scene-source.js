define(['../class', '../game/scene', './cacheable', '../utils'], function (Class, Scene, Cacheable, Utils) {
    /**
     * Represents a JSON scene source. After the scene source is loaded, you can instantiate the scene. The type of the
     * instances have to be defined in a type mapping.
     *
     * @class Grape.JSONSceneSource
     * @uses Grape.Cacheable
     * @constructor
     * @param {String} url JSON url
     * @param {Object} opts Initial properties
     */
    return Class('JSONSceneSource', Cacheable, { //TODOv2 unload unnecessary scenes?
        init: function (url, opts) {
            opts = opts || {};
            this.url = url;
            /**
             * The type mapping as key:class pairs.
             *
             * @property typeMapping
             * @type {Object}
             */
            this.typeMapping = opts.typeMapping || {};
            /**
             * The type(class) of the scene to create.
             *
             * @property type
             * @type Class
             * @default Grape.Scene
             */
            this.type = opts.type || Scene;
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
        /**
         * Instantiates the scene.
         *
         * @method create
         * @return {Scene} The new scene instance
         */
        create: function () {
            var i, j, scene, row, inst, clazz, data, typeProp, w, h, instances;
            if (this.data === null) {
                throw new Error('Scene not loaded yet.');
            }
            instances = this.data.instances ? this.data.instances.slice(0) : [];
            scene = new this.type();

            w = this.data.cellWidth || 1;
            h = this.data.cellHeight || 1;

            if (this.data.attributes) {
                for (i in this.data.attributes) {
                    scene[i] = this.data.attributes[i];
                }
            }

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
                        throw new Error('Type "' + inst[typeProp] + '" is not registered in the type mapping.');
                    }
                    scene.add(new clazz(data));
                }
            }

            return scene;
        }
    });
});