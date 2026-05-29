# Entities Package

This package contains JPA Entity classes that map to database tables.

## Entities to Create:
- **Product.java** - Core product entity with @Entity, @Table, @Id annotations
- **Category.java** - Category entity (One-to-Many relationship with Product)
- **Order.java** - Order entity
- **OrderItem.java** - Order items entity (One-to-Many relationship with Order)

## Relationship Mappings:
- One-to-Many: Category -> Product
- One-to-Many: Order -> OrderItem
- Many-to-Many: (Optional) Product <-> Order through OrderItem junction table
