define([],function(){
    var objToString=Object.prototype.toString;
    return {
        isArray:function(obj){
            return objToString.call(obj)==='[object Array]';
        },
        isFunction:function(obj){
            return objToString.call(obj)==='[object Function]';
        }
    };
});