define(['class', 'collections/array'], function(Class, Arr) {
    return Class('Bag', Arr, {
        add: Arr.prototype.push,
        remove: function(index) {
            if(index === this.length-1){
                this.pop();
            }else{
                return this[index] = this.pop();
            }
        }
    });
});