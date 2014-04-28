define(['class', 'etc/system', 'game/game-object'], function (Class, System, GameObject) {

    var block = 64;

    Class.registerKeyword('collision', {
        onInit: function (classInfo) {
            classInfo.collisions = [];
            classInfo.allCollision = [];
        },
        onAdd: function (classInfo, methodDescriptor) {
            if (!classInfo.allParentId[Collidable.id]) {
                throw 'To use "collision" keyword, inherit the Grape.Collidable class!';
            }
            classInfo.collisions.push(methodDescriptor.method);
        },
        onFinish: function (classInfo) {

            var parents = classInfo.allParent, i, parent, colls = [];
            for (i = 0; i < parents.length; i++) {
                parent = parents[i];
                if (parent.collisions) {
                    colls = colls.concat(parent.collisions);
                }
            }
            colls = colls.concat((classInfo.collisions));
            classInfo.allCollision = colls;
        }
    });

    function createPartition(classData) {
        var id, partition, instances, instance, bounds, boundsArray, leftCell, rightCell, bottomCell, topCell, i, j, cellItems, cellHash;
        partition = {
            size: classData.instanceNumber
        };
        instances = classData.instances;
        for (id = instances.length - 1; id >= 0; id--) {
            instance = instances[id];
            bounds = instance.getBounds();
            boundsArray = [bounds.left, bounds.right, bounds.top, bounds.bottom];
            leftCell = (boundsArray[0] / block) >> 0;
            rightCell = (boundsArray[1] / block) >> 0;
            topCell = (boundsArray[2] / block) >> 0;
            bottomCell = (boundsArray[3] / block) >> 0;
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
        'event frame': function () {
            var partitions = {}, classes = this.layer.getClasses(Collidable), list = [];
            var i, j, k, l, coll, colls, target, targetId, descendants, hasRealTarget, item, part1, part2, handler, invert, smaller, bigger, emitted, cell1, cell2, inst1, inst2, key, box1, box2;

            for (i in classes) {
                colls = classes[i].clazz.allCollision;
                hasRealTarget = false;
                for (j = 0; j < colls.length; j++) { //TODO melyek azok a classok, amelyek érdekesek, és a pályán vannak? ennek nagy a költsége
                    coll = colls[j];
                    targetId = (target = coll.target()).id;
                    if (coll.descendants) { //we need descendants
                        descendants = this.layer.getClasses(target);
                        for (k in descendants) {
                            if (!partitions[k]) {
                                partitions[k] = createPartition(descendants[k]);
                            }
                            hasRealTarget = true;
                            list.push([classes[i], classes[k], coll.handler]);
                        }
                    } else if (classes[targetId]) { //no descendants, and class is active at the scene
                        if (!partitions[targetId]) {
                            partitions[targetId] = createPartition(classes[targetId]);
                        }
                        hasRealTarget = true;
                        list.push([classes[i], classes[targetId], coll.handler]);
                    }
                }
                if (hasRealTarget && !partitions[i]) {
                    partitions[i] = createPartition(classes[i]);
                }
            }
            //check partitions against each other
            for (i = 0; i < list.length; i++) {
                item = list[i];
                emitted = {};
                part1 = partitions[item[0].id];
                part2 = partitions[item[1].id];
                handler = item[2];

                if (part1 === part2) {//better self-merge-algorithm
                    for (j in part1) {
                        if (j === 'size') {
                            continue;
                        }
                        cell1 = part1[j];
                        for (k = cell1.length - 1; k >= 0; --k) {
                            inst1 = cell1[k];
                            for (l = k - 1; l >= 0; --l) {
                                inst2 = cell1[l];

                                key = inst1[0].collisionId + '-' + inst2[0].collisionId;
                                if (emitted[key]) {
                                    continue;
                                }
                                box1 = inst1[1];
                                box2 = inst2[1];
                                if (box1[1] >= box2[0] && box2[1] >= box1[0] && box1[3] >= box2[2] && box2[3] >= box1[2]) { //intersect
                                    handler.call(inst1[0], inst2[0]);
                                    emitted[key] = true;
                                }
                            }
                        }
                    }

                    continue;
                }

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
                    for (k = cell1.length - 1; k >= 0; --k) { //todo optimize code
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
                            if (box1[1] >= box2[0] && box2[1] >= box1[0] && box1[3] >= box2[2] && box2[3] >= box1[2]) { //intersect
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
    var Collidable = Class('Collidable',GameObject, {
        init: function () {
            this.collisionId = nextId++;
        },
        'event add':function(){
            this.addTag('collidable');
        }
    });

    return {
        Collidable: Collidable,
        CollisionSystem: CollisionSystem
    };
});