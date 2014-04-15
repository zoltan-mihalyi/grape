define(['class'], function (Class) {
    Class.registerKeyword('chainable', {
        onAdd: function (classInfo, methodDescriptor) {
            var originalMethod;
            originalMethod = methodDescriptor.method;
            methodDescriptor.method = function () {
                originalMethod.apply(arguments);
                return this;
            };
            if (methodDescriptor.is.final) { //on final methods we replace the final reference too
                classInfo.finals[methodDescriptor.name] = methodDescriptor.method;
            }
        }
    });

    Class.registerKeywordMatching('chainable', 'final');
    Class.registerKeywordMatching('chainable', 'override');

    return null;
});