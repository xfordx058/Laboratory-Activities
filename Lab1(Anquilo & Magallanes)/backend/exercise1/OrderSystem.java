import java.util.*;
import java.util.stream.Collectors;

// Record - immutable data class
record Order(Long orderId, String description, int amount) {}

public class OrderSystem {
    
    // Generate random orders
    static List<Order> orderGenerator(int n) {
        if (n < 100) throw new RuntimeException("Need at least 100");
        
        List<Order> list = new ArrayList<>();
        Random r = new Random();
        
        for (int i = 0; i < n; i++) {
            long id = r.nextInt(10);
            list.add(new Order(id, "Order " + id, r.nextInt(200)));
        }
        return list;
    }

    public static void main(String[] args) {
        // TASK 1: Generate 10 and print
        System.out.println("=== TASK 1: Print 10 Orders ===");
        List<Order> all = orderGenerator(100);
        List<Order> ten = all.subList(0, 10);
        
        for (Order o : ten) {
            System.out.println("ID:" + o.orderId() + " | " + o.description() + " | $" + o.amount());
        }

        // TASK 2: Add new, sort descending
        System.out.println("\n=== TASK 2: Add & Sort ===");
        List<Order> list2 = new ArrayList<>(ten);
        list2.add(new Order(99L, "New Order", 250));
        list2.sort(Comparator.comparingInt(Order::amount).reversed());
        
        for (Order o : list2) {
            System.out.println(o.description() + ": $" + o.amount());
        }

        // TASK 3: Filter > 150, get descriptions
        System.out.println("\n=== TASK 3: Filter > 150 ===");
        List<String> descs = list2.stream()
            .filter(o -> o.amount() > 150)
            .map(o -> o.description())
            .collect(Collectors.toList());
        
        descs.forEach(System.out::println);

        // TASK 4: Calculate average
        System.out.println("\n=== TASK 4: Average ===");
        double avg = list2.stream()
            .mapToInt(Order::amount)
            .average()
            .orElse(0.0);
        System.out.println("Average: $" + String.format("%.2f", avg));

        // TASK 5: Group by description, sum amounts
        System.out.println("\n=== TASK 5: Group & Sum ===");
        Map<String, Integer> sums = list2.stream()
            .collect(Collectors.groupingBy(
                Order::description,
                Collectors.summingInt(Order::amount)
            ));
        
        sums.forEach((k, v) -> System.out.println(k + " = $" + v));
    }
}