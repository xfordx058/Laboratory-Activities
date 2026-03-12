function checkVariable(input) {
    const type = typeof input;
    
    switch (type) {
        case "string":
            return "string";
        case "number":
            return "number";
        case "boolean":
            return "boolean";
        case "bigint":
            return "bigint";
        case "undefined":
            return "undefined";
        case "object":
            
            if (input === null) {
                return "null";
            }
       
            return "object";
        case "function":
            return "function";
        case "symbol":
            return "symbol";
        default:
            return "unknown";
    }
}

// Testing 
console.log(checkVariable("hello"));      
console.log(checkVariable(42));        
console.log(checkVariable(true));         
console.log(checkVariable(9007199254740991n));
console.log(checkVariable(undefined));    
console.log(checkVariable(null));         
console.log(checkVariable({}));           