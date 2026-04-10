import java.math.BigDecimal;

// exceptions
class InvalidInputException extends Exception {
    public InvalidInputException(String message) {
        super(message);
    }
}

class InsufficientFundsException extends Exception {
    public InsufficientFundsException(String message) {
        super(message);
    }
}

// Interface - contract for interest calculation
interface InterestBearing {
    BigDecimal calculateInterest();
}

// Abstract base class - cannot create directly
abstract class Account {
    protected String number;
    protected String owner;
    protected BigDecimal balance;

    public Account(String number, String owner, BigDecimal balance) {
        this.number = number;
        this.owner = owner;
        this.balance = balance;
    }

    // Abstract methods - must implement in child classes
    public abstract void deposit(BigDecimal amount) throws InvalidInputException;
    public abstract void withdraw(BigDecimal amount) throws InvalidInputException, InsufficientFundsException;

    public BigDecimal getBalance() {
        return balance;
    }
}

// SavingsAccount - extends Account, implements interface
class SavingsAccount extends Account implements InterestBearing {
    private double rate; // interest rate

    public SavingsAccount(String n, String o, BigDecimal b, double r) {
        super(n, o, b);
        this.rate = r;
    }

    @Override
    public void deposit(BigDecimal amount) throws InvalidInputException {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidInputException("Amount must be positive");
        }
        balance = balance.add(amount);
    }

    @Override
    public void withdraw(BigDecimal amount) throws InvalidInputException, InsufficientFundsException {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidInputException("Amount must be positive");
        }
        if (amount.compareTo(balance) > 0) {
            throw new InsufficientFundsException("Insufficient funds");
        }
        balance = balance.subtract(amount);
    }

    @Override
    public BigDecimal calculateInterest() {
        return balance.multiply(BigDecimal.valueOf(rate));
    }
}

// CheckingAccount - extends Account only
class CheckingAccount extends Account {
    private BigDecimal overdraft;

    public CheckingAccount(String n, String o, BigDecimal b, BigDecimal over) {
        super(n, o, b);
        this.overdraft = over;
    }

    @Override
    public void deposit(BigDecimal amount) throws InvalidInputException {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidInputException("Amount must be positive");
        }
        balance = balance.add(amount);
    }

    @Override
    public void withdraw(BigDecimal amount) throws InvalidInputException, InsufficientFundsException {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidInputException("Amount must be positive");
        }
        BigDecimal available = balance.add(overdraft);
        if (amount.compareTo(available) > 0) {
            throw new InsufficientFundsException("Overdraft limit exceeded");
        }
        balance = balance.subtract(amount);
    }
}

// Main class to test
public class BankSystem {
    public static void main(String[] args) {
        // Create accounts
        SavingsAccount sav = new SavingsAccount("S001", "John", new BigDecimal("1000"), 0.05);
        CheckingAccount chk = new CheckingAccount("C001", "Jane", new BigDecimal("500"), new BigDecimal("200"));

        // Test Savings
        System.out.println("=== SAVINGS ===");
        try {
            System.out.println("Start: $" + sav.getBalance());
            sav.deposit(new BigDecimal("500"));
            System.out.println("After deposit: $" + sav.getBalance());
            System.out.println("Interest: $" + sav.calculateInterest());
            sav.withdraw(new BigDecimal("2000")); // Will fail
        } catch (InvalidInputException | InsufficientFundsException e) {
            System.out.println("ERROR: " + e.getMessage());
        }

        // Test Checking
        System.out.println("\n=== CHECKING ===");
        try {
            System.out.println("Start: $" + chk.getBalance());
            chk.withdraw(new BigDecimal("600")); // Uses overdraft
            System.out.println("After withdraw: $" + chk.getBalance());
            chk.deposit(new BigDecimal("-100")); // Will fail
        } catch (InvalidInputException | InsufficientFundsException e) {
            System.out.println("ERROR: " + e.getMessage());
        }
    }
}