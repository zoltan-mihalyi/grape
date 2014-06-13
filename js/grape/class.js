//TODOv2 duplicated methods with different modifiers
define(['./utils'], function (Utils) {
    var nextId = 0;
    var registeredKeywords = {};

    var classMethods = {
        extends: function (Class) {
            return !!this.allParentId[Class.id];
        },
        extend: function (name, methods) {
            if (typeof name === 'string') { //name given
                if (methods) { //avoid undefined arguments
                    return Class(name, this, methods);
                } else {
                    return Class(name, this);
                }
            } else {
                if (name) { //avoid undefined arguments
                    return Class(this, name);
                } else {
                    return Class(this);
                }
            }
        }
    };

    var instanceMethods = {
        instanceOf: function (clazz) {
            return (this instanceof clazz) || !!this.getClass().allParentId[clazz.id];
        },
        parent: function (clazz, method) {
            if (!this.instanceOf(clazz)) {
                throw new Error('Accessing parent member of not inherited class');
            }
            var m = clazz.prototype[method], that = this;
            if (Utils.isFunction(m)) {
                return function () {
                    return m.apply(that, arguments);
                };
            } else {
                return m;
            }
        },
        getClass: function () {
            return this.constructor;
        }
    };

    function empty() {
    }

    /*
     * TODO:
     * LEVEL 1:
     * mouse fix
     * which view is under mouse, mouse pos relative to views
     * check todos
     * tests
     * documentation, doc coverage check
     * npm, bower
     * readme update: build status, https://github.com/cainus/node-coveralls
     * examples
     * tutorials
     *
     * LEVEL 2:
     * phonegap
     * event order
     * update static partitions (remove and re-add objects)
     * example require config (nested require calls are ugly)
     * jscs
     * collision mask
     * move examples to different repositories
     * move node.js codes to grape.multiplayer
     * check if instance is at a place
     *      indexed by position
     * fullscreen
     * Entity-System pattern
     *      how systems work? get classes? tags? emit events?
     * avoid nested require calls?
     * no override: warning
     * rendering sometimes skip frames?
     * general loop class, turn based games
     * audio
     * environment information, features (audio, webgl, canvas, node...)
     * change layer to _layer, etc.
     * particle system
     * spatial partitioning in rendering, static rendering
     * deactivate instances
     * .hitTest function
     * move default options to prototype?
     * collision with two objects:
     *      bounce back?
     *      increase score and destroy?
     *          the only
     *          the two
     *
     * gui
     * layer, view order, depth
     * disable views, layers
     * prototype-based (single), /mix-in (multiple)?
     * karma on node: https://www.npmjs.org/package/jasmine-node-karma
     * multiplayer support
     *
     * LEVEL 3:
     * protocolbuffer-like way to compress data in communication
     * Backbone view
     * unsafe class creation
     * */


    /** TODOv2 doc
     * Creates a class.
     * @param name {string} The name of the class (mainly for debugging purposes)
     * @param parents {}
     * @param methods
     * @returns {*}
     * @constructor
     */
    function Class(name, parents, methods) {
        var classInfo = {}, constructor, i, id = ++nextId;

        for (i = 0; i < arguments.length; i++) {
            if (typeof arguments[i] === 'undefined') {
                throw new Error('Argument is undefined: ' + i);
            }
        }
        //parameter transformations
        if (typeof name !== 'string') { //no name
            methods = parents;
            parents = name;
            name = 'Class #' + id;
        }
        if (!Utils.isArray(parents)) {
            if (Utils.isFunction(parents)) { //single parent
                parents = [parents];
            } else { //no parent
                methods = parents;
                parents = [];
            }

        }
        if (!methods) { //no methods
            methods = {};
        }

        classInfo.className = name;
        classInfo.id = id;

        for (i in classMethods) { //plugins can use 'extends' check
            classInfo[i] = classMethods[i];
        }

        createParentInfo(classInfo, parents);
        createMethodDescriptors(classInfo, methods);

        initializeKeywords(classInfo);

        addParentMethods(classInfo); //left to right order
        addOwnMethods(classInfo);

        createConstructor(classInfo);

        finishKeywords(classInfo);

        constructor = classInfo.constructor;
        //extend prototype with methods
        for (i in classInfo.methods) {
            if (instanceMethods.hasOwnProperty(i)) {
                throw new Error('The method name "' + i + '" is reserved');
            }
            constructor.prototype[i] = classInfo.methods[i];
        }
        //extend constructor with class info
        for (i in classInfo) {
            constructor[i] = classInfo[i];
        }

        for (i in instanceMethods) {
            constructor.prototype[i] = instanceMethods[i];
        }

        constructor.prototype.init = constructor;
        constructor.toString = function () { //debug info
            return name;
        };

        constructor.prototype.constructor = constructor;

        return constructor;
    }

    function createParentInfo(classInfo, parents) {
        var i;
        classInfo.parents = parents;
        classInfo.allParent = getAllParent(parents);
        classInfo.allParentId = {};
        for (i = 0; i < classInfo.allParent.length; i++) {
            classInfo.allParentId[classInfo.allParent[i].id] = true;
        }
    }

    function createMethodDescriptors(classInfo, methods) {
        var methodDescriptors = {}, m;

        for (m in methods) {
            methodDescriptors[m] = parseMethod(m, methods[m], classInfo);
        }
        classInfo.methodDescriptors = methodDescriptors;
        classInfo.methods = {};
        classInfo.ownMethods = {};
        classInfo.init = null;
    }

    /**
     * We create a custom function for performance and debugging reasons.
     * @param classInfo
     */
    function createConstructor(classInfo) {
        /*jslint evil: true */
        var name = classInfo.className, initMethods = [], factory = [], i, parent, constructor;
        //add parent init methods
        for (i = 0; i < classInfo.allParent.length; i++) {
            parent = classInfo.allParent[i];
            if (parent.init) {
                initMethods.push(parent.init);
            }
        }
        //add own init method
        if (classInfo.init) {
            initMethods.push(classInfo.init);
        }

        for (i = 0; i < initMethods.length; i++) {
            factory.push('var init' + i + ' = inits[' + i + '];'); //var init0 = inits[0];
        }

        //With this trick we can see the name of the class while debugging.
        factory.push('this["' + name + '"] = function(){'); //this["MyClass"] = function(){
        for (i = 0; i < initMethods.length; i++) {
            factory.push('init' + i + '.apply(this, arguments);'); //init0.apply(this, arguments)
        }
        factory.push('};');
        factory.push('return this["' + name + '"];'); //return this["MyClass"];
        constructor = (new Function('inits', factory.join('\n'))).call({}, initMethods);
        classInfo.constructor = constructor;
    }

    function initializeKeywords(classInfo) {
        var keyword;
        for (keyword in registeredKeywords) {
            (registeredKeywords[keyword].onInit || empty)(classInfo);
        }
    }

    function finishKeywords(classInfo) {
        var keyword;
        for (keyword in registeredKeywords) {
            (registeredKeywords[keyword].onFinish || empty)(classInfo);
        }
    }

    function addParentMethods(classInfo) {
        var i = 0, allParent = classInfo.allParent, parentsNum = allParent.length, parent, m;
        for (; i < parentsNum; i++) {
            parent = allParent[i];
            for (m in parent.ownMethods) {
                classInfo.methods[m] = parent.ownMethods[m];
            }
        }
    }

    function addOwnMethods(classInfo) {
        var m, methodDescriptors = classInfo.methodDescriptors, methodDescriptor, modifiers, i, j, modifier, canAdd;
        for (m in methodDescriptors) {
            methodDescriptor = methodDescriptors[m];
            if (methodDescriptor.init) {
                classInfo.init = methodDescriptor.method;
            } else {

                modifiers = methodDescriptor.modifiers;
                canAdd = true;
                for (i = 0; i < modifiers.length; i++) {
                    modifier = modifiers[i];
                    if (registeredKeywords[modifier]) {
                        //iterate over other modifiers checking compatibility
                        for (j = i + 1; j < modifiers.length; j++) {
                            if (modifier === modifiers[j]) {
                                throw new Error('Modifier "' + modifier + '" duplicated.');
                            }
                            if (!registeredKeywords[modifier].matches[modifiers[j]]) {
                                throw new Error('Modifier "' + modifier + '" cannot use with "' + modifiers[j] + '".');
                            }
                        }

                        if ((registeredKeywords[modifier].onAdd)(classInfo, methodDescriptor) === false) {
                            canAdd = false;
                        }
                    } else {
                        throw new Error('Unknown modifier "' + modifier + '"');
                    }
                }
                if (canAdd) {
                    classInfo.methods[methodDescriptor.name] = methodDescriptor.method;
                    classInfo.ownMethods[methodDescriptor.name] = methodDescriptor.method;
                }
            }
        }
    }

    function parseMethod(name, method, source) {
        var all = name.split(' '),
            modifiers = all.slice(0, -1),
            realName = all.slice(-1)[0],
            is = {},
            init = false,
            i;

        if (realName === 'init') {
            init = true;
            if (modifiers.length !== 0) {
                throw new Error('init method cannot be marked with any modifiers.');
            }
        }

        for (i = modifiers.length - 1; i >= 0; i--) {
            is[modifiers[i]] = true;
        }

        return {
            modifiers: modifiers,
            is: is,
            name: realName,
            method: method,
            source: source,
            init: init
        };
    }

    /**
     * Leftmost iteration of parent tree.
     * @param {Array} parents The array of parents
     * @param {Object} directly The set of directly added parent ids.
     * @param {Object} acc The accumulated parents data as list and set
     * @returns {Array} Array of recursively added parents
     */
    function getAllParent(parents, directly, acc) {
        var i, parentsNum = parents.length, parent;
        if (!directly) {
            directly = {};
            for (i = 0; i < parentsNum; i++) {
                parent = parents[i];
                if (!parent) {
                    throw new Error('Parent #' + (i + 1) + ' is ' + parent + '.');
                }
                directly[parent.id] = true;
            }
            acc = {
                list: [],
                set: {}
            };
        }
        for (i = 0; i < parentsNum; i++) { //add all parents recursively
            parent = parents[i];
            if (!acc.set[parent.id]) { //not added yet
                getAllParent(parent.parents, directly, acc);
                acc.list.push(parent);
                acc.set[parent.id] = true;
            } else if (directly[parent.id]) { //added directly
                throw new Error('Class "' + parent.className + '" is set as parent twice, or implied by a parent class'); //TODOv2 format global string
            }
        }
        return acc.list;
    }

    function registerKeyword(name, handlers) {
        if (registeredKeywords[name]) {
            throw new Error('keyword "' + name + '" already registered');
        }
        handlers.matches = {};
        registeredKeywords[name] = handlers;
    }

    function registerKeywordMatching(k1, k2) {
        registeredKeywords[k1].matches[k2] = true;
        registeredKeywords[k2].matches[k1] = true;
    }

    registerKeyword('static', {
        onAdd: function (classInfo, methodDescriptor) {
            if (classInfo[methodDescriptor.name] || classMethods[methodDescriptor.name]) {
                throw new Error('Static method "' + methodDescriptor.name + '" hides a reserved attribute.');
            }
            classInfo[methodDescriptor.name] = methodDescriptor.method;
            return false;
        }
    });

    registerKeyword('override', {
        onAdd: function (classInfo, methodDescriptor) {
            var i, j, parent;
            if (!classInfo.methods[methodDescriptor.name]) { //we are not overriding an implemented method

                //check for abstract methods
                for (i = 0; i < classInfo.allParent.length; ++i) {
                    parent = classInfo.allParent[i];
                    for (j in parent.abstracts) {
                        if (j === methodDescriptor.name) {
                            return;
                        }
                    }
                }
                //no abstract method found
                throw new Error('Method "' + methodDescriptor.name + '" does not override a method from its superclass');
            }
        }
    });

    registerKeyword('abstract', {
        onInit: function (classInfo) {
            classInfo.abstracts = {};
            classInfo.isAbstract = false;
        },
        onAdd: function (classInfo, methodDescriptor) {
            classInfo.abstracts[methodDescriptor.name] = methodDescriptor.method;
            classInfo.isAbstract = true;
            if (classInfo.methods[methodDescriptor.name]) { //inherited method with the same name
                throw new Error('Method "' + methodDescriptor.name + '" cannot be abstract, because it is inherited from a parent.');
            }
            return false;
        },
        onFinish: function (classInfo) {
            var i, j, parent, oldToString;
            if (classInfo.isAbstract) {
                //replace constructor, this happens before extending it with anything
                oldToString = classInfo.constructor.toString;
                classInfo.constructor = function () {
                    throw new Error('Abstract class "' + classInfo.className + '" cannot be instantiated.');
                };
                classInfo.constructor.toString = oldToString;
                classInfo.constructor.prototype.constructor = classInfo.constructor;
            }

            //check all abstract parent methods are implemented, inherited, or marked abstract
            for (i = 0; i < classInfo.allParent.length; ++i) {
                parent = classInfo.allParent[i];
                for (j in parent.abstracts) {
                    if (!classInfo.methods[j] && classInfo.abstracts[j] === undefined) {
                        throw new Error('Method "' + j + '" is not implemented, inherited, or marked abstract'); //TODOv2 source?
                    }
                }
            }
        }
    });

    registerKeyword('final', {
        onInit: function (classInfo) {
            var parent, i, j, parentFinals = {};
            //iterate over parent methods checking not overwrite a final method by inheriting
            for (i = 0; i < classInfo.allParent.length; ++i) {
                parent = classInfo.allParent[i];

                for (j in parent.methods) {
                    if (parentFinals.hasOwnProperty(j) && parentFinals[j] !== parent.methods[j]) { //overriding final method by inheriting
                        throw new Error('Method "' + j + '" is final and cannot be overridden by inheriting from "' + parent.className + '"');
                    }
                }

                for (j in parent.finals) {
                    parentFinals[j] = parent.finals[j];
                }
            }
            classInfo.parentFinals = parentFinals;
            classInfo.finals = {};
        },
        onAdd: function (classInfo, methodDescriptor) {
            classInfo.finals[methodDescriptor.name] = methodDescriptor.method;
        },
        onFinish: function (classInfo) {
            var i;

            for (i in classInfo.parentFinals) {
                if (classInfo.methods[i] !== classInfo.parentFinals[i]) {
                    throw new Error('Overriding final method "' + i + '"');
                }
            }
        }
    });

    registerKeywordMatching('final', 'override');


    Class.registerKeyword = registerKeyword;
    Class.registerKeywordMatching = registerKeywordMatching;

    return Class;
});