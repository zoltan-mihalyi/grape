//TODOv2 duplicated methods with different modifiers
define(['./utils'], function (Utils) {
    var nextId = 0;
    var registeredKeywords = {};

    /**
     * A fake class to represent default class methods
     *
     * @class Grape.Object
     */
    var classMethods = {
        /**
         * Tells whether the given class is a parent of the current class.
         *
         * @method extends
         * @static
         * @param {Class} clazz The class
         * @return {boolean} true, if the given class is a parent
         */
        extends: function (clazz) {
            return !!this.allParentId[clazz.id];
        },
        /**
         * Creates a new class, which extends this class. X.extend(a, b) is the same as Grape.Class(a,X,b)
         *
         * @method extend
         * @static
         * @param {String} [name] The class name
         * @param {Object} [methods] Class methods
         * @return {Class} The new class
         */
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
        /**
         * Tells that the current instance is an instance of a class, or it's descendants.
         *
         * @method instanceOf
         * @param {Class} clazz
         * @return {boolean} true, if yes.
         */
        instanceOf: function (clazz) {
            return (this instanceof clazz) || !!this.getClass().allParentId[clazz.id];
        },
        /**
         * Creates a proxy for calling a parent method
         *
         * @method parent
         * @param {Class} clazz The parent, whose method will be called
         * @param {String} method Method name
         * @return {Function} Method proxy. When called, calls the parent method with the parameters, and original
         * context.
         */
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
        /**
         * Returns the instance's constructor class
         *
         * @method getClass
         * @return {Class}
         */
        getClass: function () {
            return this.constructor;
        }
    };

    function empty() {
    }

    /*
     * TODO:
     * LEVEL 1:
     * tests
     * npm, bower
     * readme update
     * examples
     * tutorials
     * release
     *
     * LEVEL 2:
     * phonegap
     * tiled layer
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

    /**
     * A static class for storing keyword related functions. To see how to create a class, check the Class method in the
     * Grape class.
     *
     * @class Grape.Class
     */

    /**
     * Creates a class by optionally copying prototype methods of one or more class.
     *
     * @for Grape
     * @method Class
     * @static
     * @param {String} [name] The name of the class (mainly for debugging purposes)
     * @param {Array|Class} [parents] Parent class or classes
     * @param {Object} methods An object containing methods. If method name contains space, the keyword parts are parsed
     * and keyword specific tasks are executed.
     * @return {*}
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


        /**
         * The name of the class if set, or a generated string.
         *
         * @for Grape.Object
         * @property className
         * @static
         * @type {String}
         */
        classInfo.className = name;

        /**
         * An unique number for the class, mainly for indexing purposes
         *
         * @for Grape.Object
         * @property id
         * @static
         * @type {Number}
         */
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

    /*
     * We create a custom function for performance and debugging reasons.
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

    /*
     * Leftmost iteration of parent tree.
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

    /**
     * Registers a new keyword (like 'final' or 'static').
     * Todov2 callback params
     *
     * @for Grape.Class
     * @method registerKeyword
     * @static
     * @param {String} name
     * @param {Object} handlers The functions called during the class creation
     * @param {Function} [handlers.onInit] Called when a new class is about to create
     * @param {Function} [handlers.onAdd] Called when a method with the keyword is added to the class
     * @param {Function} [handlers.onFinish] Called when the class is ready
     */
    function registerKeyword(name, handlers) {
        if (registeredKeywords[name]) {
            throw new Error('keyword "' + name + '" already registered');
        }
        handlers.matches = {};
        registeredKeywords[name] = handlers;
    }

    /**
     * Tells to the Grape class system that two keywords can be used together. If not explicitly told, a keyword cannot
     * be used with other ones. The order of keywords is irrelevant.
     *
     * @for Grape.Class
     * @static
     * @method registerKeywordMatching
     * @param {String} k1 Keyword 1
     * @param {String} k2 Keyword 2
     */
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