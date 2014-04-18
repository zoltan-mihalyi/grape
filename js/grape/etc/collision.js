define(['class', 'etc/system'], function (Class, System) {

    var block = 64;

    function createPartition(instances) {
        var partition, it, instance, bounds, boundsArray, leftCell, rightCell, bottomCell, topCell, i, j, cellItems, cellHash;
        partition = {};
        it = instances.iterator();
        while (it.hasNext()) {
            instance = it.next();
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

    function getAllCollisionFor(classData) {
        var clazz = classData.clazz, parents = clazz.allParent, i, parent, colls = [];
        for (i = 0; i < parents.length; i++) {
            parent = parents[i];
            if (parent.collisions) {
                colls = colls.concat(parent.collisions());
            }
        }
        if (clazz.collisions) {
            colls = colls.concat((clazz.collisions()));
        }
        return colls;
    }

    var CollisionSystem = Class('CollisionSystem', System, {
        'event frame': function () {
            var partitions = {};
            var classes = this.layer.getClasses(Collidable);
            var list = [];
            var i;
            var classId;
            var hasRealTarget;
            for (i in classes) {
                var colls = getAllCollisionFor(classes[i]);
                hasRealTarget = false;
                for (var j = 0; j < colls.length; j++) {
                    var coll = colls[j];
                    if (!classes[classId = coll.target.id]) { //target does not exist in the current layer
                        continue;
                    }
                    hasRealTarget = true;

                    if (!partitions[classId]) {
                        partitions[classId] = createPartition(classes[classId].instances);
                    }
                    if (coll.descendants) { //we need descendants
                        console.log(classes[classId]);
                        //create descendant partitions
                    }
                    list.push([classes[i], coll.target]);
                }
                if (hasRealTarget && !partitions[i]) {
                    partitions[i] = createPartition(classes[i].instances);
                }
            }
            //check partitions against each other
            console.log(partitions);
        }
    });

    var Collidable = Class('Collidable', {
        init: function () {
            this._hitTable = {};
        },
        onHit: function (otherClass, fn, descendants) {
            if (!this._hitTable[otherClass.id]) {
                this._hitTable[otherClass.id] = [];
            }
        }
    });

    return {
        Collidable: Collidable,
        CollisionSystem: CollisionSystem
    }
});