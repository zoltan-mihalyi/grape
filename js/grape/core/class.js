/*
 * TODO
 * duplicated methods with different modifiers
 * init calls
 * .extend
 * parent methods
 */
define(['utils'], function (Utils) {
    var nextId = 0;
    var registeredKeywords = {};

    function empty() {
    }

    //TODO parse name?
    // prototype-based (single)?
    //mix-in (multiple)?
    //
    function Class(name, parents, methods) {
        var classInfo = {}, constructor, i, id = ++nextId;

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
        createParentInfo(classInfo, parents);
        createMethodDescriptors(classInfo, methods);
        createConstructor(classInfo);

        initializeKeywords(classInfo);

        addParentMethods(classInfo); //left to right order
        addOwnMethods(classInfo);

        finishKeywords(classInfo);

        constructor = classInfo.constructor;
        //extend prototype with methods
        for (i in classInfo.methods) {
            constructor.prototype[i] = classInfo.methods[i];
        }
        //extend constructor with class info
        for (i in classInfo) {
            constructor[i] = classInfo[i];
        }

        //TODO to separate place, check overwrite
        constructor.prototype.getClass = function () {
            return constructor;
        };
        constructor.toString = function () { //debug info
            return name;
        };
        constructor.extend = function (name, methods) {
            if (typeof name === 'string') { //name given
                return Class(name, constructor, methods);
            } else {
                return Class(constructor, name);
            }
        };
        constructor.prototype.constructor = constructor;

        return constructor;
    }

    function createParentInfo(classInfo, parents) {
        classInfo.parents = parents;
        classInfo.allParent = getAllParent(parents);
    }

    function createMethodDescriptors(classInfo, methods) {
        var methodDescriptors = {}, m;

        for (m in methods) {
            methodDescriptors[m] = parseMethod(m, methods[m], classInfo);
        }
        classInfo.methodDescriptors = methodDescriptors;
        classInfo.methods = {};
    }

    function createConstructor(classInfo) {
        var name = classInfo.className;

        //with this trick we can see the name of the class while debugging
        var constructor = (new Function('', 'this["' + name + '"]=function(){};return this["' + name + '"];')).call({});
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
            for (m in parent.methods) {
                classInfo.methods[m] = parent.methods[m];
            }
        }
    }

    function addOwnMethods(classInfo) {
        var m, methodDescriptors = classInfo.methodDescriptors, methodDescriptor, modifiers, i, j, modifier, canAdd;
        for (m in methodDescriptors) {
            methodDescriptor = methodDescriptors[m];
            modifiers = methodDescriptor.modifiers;
            canAdd = true;
            for (i = 0; i < modifiers.length; i++) {
                modifier = modifiers[i];
                if (registeredKeywords[modifier]) {
                    //iterate over other modifiers checking compatibility
                    for (j = i + 1; j < modifiers.length; j++) {
                        if (modifier === modifiers[j]) {
                            throw 'Modifier "' + modifier + '" duplicated.';
                        }
                        if (!registeredKeywords[modifier].matches[modifiers[j]]) {
                            throw 'Modifier "' + modifier + '" cannot use with "' + modifiers[j] + '".';
                        }
                    }

                    if ((registeredKeywords[modifier].onAdd || empty)(classInfo, methodDescriptor) === false) {
                        canAdd = false;
                    }
                } else {
                    throw 'Unknown modifier "' + modifier + '"';
                }
            }
            if (canAdd) {
                classInfo.methods[methodDescriptor.name] = methodDescriptor.method;
            }
        }
    }

    function parseMethod(name, method, source) {
        var all = name.split(' ');
        var modifiers = all.slice(0, -1);
        var realName = all.slice(-1)[0];
        var is = {};
        var i;

        for (i = modifiers.length - 1; i >= 0; i--) {
            is[modifiers[i]] = true;
        }

        return {
            modifiers: modifiers,
            is: is,
            name: realName,
            method: method,
            source: source
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
                directly[parents[i].id] = true;
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
                throw 'Class "' + parent.className + '" is set as parent twice, or implied by a parent class'; //TODO format global string
            }
        }
        return acc.list;
    }

    function registerKeyword(name, handlers) {
        if (registeredKeywords[name]) {
            throw 'keyword "' + name + '" already registered';
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
            if (classInfo[methodDescriptor.name]) {
                throw 'Static method "' + methodDescriptor.name + '" hides a reserved attribute.';
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
                throw 'Method "' + methodDescriptor.name + '" does not override a method from its superclass';
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
                throw 'Method "' + methodDescriptor.name + '" cannot be abstract, because it is inherited from a parent.';
            }
            return false;
        },
        onFinish: function (classInfo) {
            var i, j, parent, oldToString;
            if (classInfo.isAbstract) {
                //replace constructor, this happens before extending it with anything
                oldToString = classInfo.constructor.toString;
                classInfo.constructor = function () {
                    throw 'Abstract class "' + classInfo.className + '" cannot be instantiated.'
                };
                classInfo.constructor.toString = oldToString;
                classInfo.constructor.prototype.constructor = classInfo.constructor;
            }

            //check all abstract parent methods are implemented, inherited, or marked abstract
            for (i = 0; i < classInfo.allParent.length; ++i) {
                parent = classInfo.allParent[i];
                for (j in parent.abstracts) {
                    if (!classInfo.methods[j] && !classInfo.abstracts[j]) {
                        throw 'Method "' + j + '" is not implemented, inherited, or marked abstract'; //TODO source?
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
                    if (parentFinals[j] && parentFinals[j] !== parent.methods[j]) { //overriding final method by inheriting
                        throw 'Method "' + j + '" is final and cannot be overridden by inheriting from "' + parent.className + '"';
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
                    throw 'Overriding final method "' + i + '"';
                }
            }
        }
    });

    registerKeywordMatching('final', 'override');


    Class.registerKeyword = registerKeyword;
    Class.registerKeywordMatching = registerKeywordMatching;

    return Class;
});