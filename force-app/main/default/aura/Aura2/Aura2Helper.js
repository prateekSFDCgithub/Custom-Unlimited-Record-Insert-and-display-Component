({
   sortData : function(component,fieldName,sortDirection){
        var data = component.get("v.returnedRemainderList");
        //function to return the value stored in the field
        var key = function(a) { return a[fieldName]; }
        var reverse = sortDirection == 'asc' ? 1: -1;
         
        data.sort(function(a,b){
                var a = key(a) ? key(a) : '';
                var b = key(b) ? key(b) : '';
                return reverse * ((a>b) - (b>a));
            });
        component.set("v.returnedRemainderList",data);
    }
})