//Problem 1
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

// Problem 2

function generateIDs(count) {
    const Std_ids = [];

    for (let i = 0; i < count; i++) {
        if (i === 5){
            continue;
        }

        Std_ids.push(`ID-${i}`)
    }

    return Std_ids;

    
}

