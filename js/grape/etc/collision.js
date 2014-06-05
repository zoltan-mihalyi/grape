define(['class', 'etc/aabb', 'game/game-object', 'game/system'], function (Class, AABB, GameObject, System) {

    Class.registerKeyword('collision', {
        onInit: function (classInfo) {
            classInfo.collisions = {};
            classInfo.allCollision = {};
        },
        onAdd: function (classInfo, methodDescriptor) {
            if (!classInfo.extends(Collidable)) {
                throw 'To use "collision" keyword, inherit the Grape.Collidable class!';
            }
            classInfo.collisions[methodDescriptor.name] = methodDescriptor.method;
        },
        onFinish: function (classInfo) {
            var parents = classInfo.allParent, colls = classInfo.allCollision, parentsAndMe = parents.concat(classInfo),
                i, j, parent;
            for (i = 0; i < parentsAndMe.length; i++) {
                parent = parentsAndMe[i];
                if (parent.collisions) {
                    for (j in parent.collisions) {
                        if (colls[j]) {
                            colls[j].push(parent.collisions[j]);
                        } else {
                            colls[j] = [parent.collisions[j]];
                        }
                    }
                }
            }
            for (i in colls) {
                if (colls[i].length === 1) { //one handler for the collision
                    colls[i] = colls[i][0];
                } else {
                    colls[i] = createF(colls[i]);
                }
            }
        }
    });

    function createF(fns) { //todo optimize, better name
        var i;
        return function () {
            for (i = 0; i < fns.length; i++) {
                fns[i].apply(this, arguments);
            }
        };
    }

    function createPartition(instances, blockSize) {
        var partition = {
                size: instances.length
            },
            id, instance, bounds, boundsArray, leftCell, rightCell, bottomCell, topCell, i, j, cellItems, cellHash;

        for (id = instances.length - 1; id >= 0; id--) {
            instance = instances[id];
            bounds = instance.getBounds();
            boundsArray = [bounds.left, bounds.right, bounds.top, bounds.bottom];
            leftCell = (boundsArray[0] / blockSize) >> 0;
            rightCell = (boundsArray[1] / blockSize) >> 0;
            topCell = (boundsArray[2] / blockSize) >> 0;
            bottomCell = (boundsArray[3] / blockSize) >> 0;
            for (i = leftCell; i <= rightCell; ++i) {
                for (j = topCell; j <= bottomCell; ++j) {
                    if (!(cellItems = partition[cellHash = i + ';' + j])) { //no cell list
                        partition[cellHash] = [
                            [instance, boundsArray]
                        ];
                    } else {
                        cellItems.push([instance, boundsArray]);
                    }
                }
            }
        }
        return partition;
    }

    var CollisionSystem = Class('CollisionSystem', System, {
        init: function (settings) {
            settings = settings || {};
            this.blockSize = settings.blockSize || 64;
            this.ClassPartition = function () {
            };

            this.TagPartition = function () {
            };
        },
        createStaticPartition: function (name) {
            var instances;
            if (name.id) {//class
                instances = this._layer._activeClasses[name.id];
                this.ClassPartition.prototype[name.id] = createPartition(instances ? instances.instances : [], this.blockSize); //store static partition in prototype to speed up the lookup
            } else {//tag
                instances = this._layer._tags[name];
                this.TagPartition.prototype[name] = createPartition(instances || [], this.blockSize); //store static partition in prototype to speed up the lookup
            }
        },
        removeStaticPartition: function (name) {
            if (name.id) {//class
                delete this.ClassPartition.prototype[name.id];
            } else {//tag
                delete  this.TagPartition.prototype[name];
            }
        },
        'event frame': function () {
            //collision is defined between classes and tags TODO: what can we optimize this way? self collision?
            var classes = this._layer.getClasses(Collidable),
                partitionsByTag = new this.TagPartition(),
                partitionsByClass = new this.ClassPartition(),
                list = [],
                classId, tagName, colls, instances, hasRealTarget, i, j, k, l, item, emitted, part1, part2, handler, invert, bigger, smaller, cell1, cell2, inst1, inst2, key, box1, box2;
            for (classId in classes) {
                colls = classes[classId].clazz.allCollision;
                hasRealTarget = false;
                for (tagName in colls) {
                    if (!partitionsByTag[tagName]) {
                        instances = this._layer._tags[tagName];
                        if (instances && instances.length !== 0) {
                            partitionsByTag[tagName] = createPartition(instances, this.blockSize);
                            hasRealTarget = true;
                            list.push([classId, tagName, colls[tagName]]);
                        }
                    } else {
                        hasRealTarget = true;
                        list.push([classId, tagName, colls[tagName]]);
                    }
                }
                if (hasRealTarget && !partitionsByClass[classId]) {
                    partitionsByClass[classId] = createPartition(classes[classId].instances, this.blockSize);
                }
            }

            for (i = 0; i < list.length; i++) {
                item = list[i];
                emitted = {};
                part1 = partitionsByClass[item[0]];
                part2 = partitionsByTag[item[1]];
                handler = item[2];

                if (invert = part1.size > part2.size) {
                    bigger = part1;
                    smaller = part2;
                } else {
                    bigger = part2;
                    smaller = part1;
                }

                for (j in smaller) {
                    if (j === 'size' || !bigger[j]) { //other partition does not contain the cell
                        continue;
                    }

                    cell1 = invert ? bigger[j] : smaller[j];
                    cell2 = invert ? smaller[j] : bigger[j];
                    for (k = cell1.length - 1; k >= 0; --k) {
                        inst1 = cell1[k];
                        for (l = cell2.length - 1; l >= 0; --l) {
                            inst2 = cell2[l];
                            if (inst1[0] === inst2[0]) { //same instance
                                continue;
                            }
                            key = inst1[0].collisionId + '-' + inst2[0].collisionId;
                            if (emitted[key]) {
                                continue;
                            }
                            box1 = inst1[1];
                            box2 = inst2[1];
                            if (box1[1] > box2[0] && box2[1] > box1[0] && box1[3] > box2[2] && box2[3] > box1[2]) { //intersect
                                handler.call(inst1[0], inst2[0]);
                                emitted[key] = true;
                            }
                        }
                    }
                }
            }
        }
    });

    var nextId = 0;
    var Collidable = Class('Collidable', [GameObject, AABB], {
        init: function () {
            this.collisionId = nextId++;
        },
        'abstract getBounds': null,
        'abstract getLeft': null,
        'abstract getTop': null,
        'abstract getRight': null,
        'abstract getBottom': null,
        'abstract getWidth': null,
        'abstract getHeight': null
    });

    return {
        Collidable: Collidable,
        CollisionSystem: CollisionSystem
    };
});