//Problem 1  Anquilo
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

// Problem 2 Anquilo

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

// Problem 3 Anquilo
function calculateTotal(...numbers) {
  
    for (let num of numbers) {
        if (typeof num !== 'number') {
            throw new TypeError("Invalid input: All arguments must be numbers");
        }
    }
    

    return numbers.reduce(function(sum, num) {
        return sum + num;
    }, 0);
}
console.log(calculateTotal(1, 2, 5));

// Problem 4 
function getTopScorers(playerList) {
  
    let highScorers = playerList.filter(function(player) {
        return player.score > 8;
    });
    
    
    let names = highScorers.map(function(player) {
        return player.name;
    });
    
   
    return names.join(", ");
}


let players = [
    {name: "ROCKY", score: 10},
    {name: "Judy", score: 5},
    {name: "Glen", score: 9},
    {name: "Dyona", score: 7},
    {name: "Yul", score: 12},
    {name: "Francis", score: 8},
    {name: "GracePoe", score: 15},
    {name: "HenryDict", score: 3},
    {name: "IvyCruz", score: 11},
    {name: "jenny", score: 6}
];

console.log(getTopScorers(players));

// problem 5 The Private Inventory
class Item {
    #discount = 0.1;  
    
    constructor(name, price) {
        this.name = name;
        this.price = price;
    }
    
    get finalPrice() {
        let discountAmount = this.price * this.#discount;
        return this.price - discountAmount;
    }
}

// Problem 5: The Private Inventory
class Item {
    #discount = 0.1;  
    
    constructor(name, price) {
        this.name = name;
        this.price = price;
    }
    
    get finalPrice() {
        let discountAmount = this.price * this.#discount;
        return this.price - discountAmount;
    }
}

let phone = new Item("Phone", 500);
console.log(phone.name);       
console.log(phone.price);       
console.log(phone.finalPrice);  

let phone = new Item("Phone", 500);
console.log(phone.name);        
console.log(phone.price);       
console.log(phone.finalPrice);  

// Problem 6: Robust Division
function safeDivide(a, b) {
    try {
        if (b === 0) {
            throw new Error("Cannot divide by zero");
        }
        let result = a / b;
        return result;
        
    } catch (error) {
        return error.message;
        
    } finally {
        console.log("Operation attempted");
    }
}


console.log(safeDivide(10, 2));   
console.log(safeDivide(10, 0));   
console.log(safeDivide(20, 4));   