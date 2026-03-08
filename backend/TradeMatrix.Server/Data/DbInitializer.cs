using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger)
    {
        // Only seed tables that are completely empty — never overwrite existing data
        var seeded = false;

        if (!await context.Suppliers.AnyAsync())
        {
            context.Suppliers.AddRange(
                new Supplier { CompanyName = "PhilTech Distributors", ContactPerson = "Ricardo Lim", ContactNumber = "0917-888-1234", Email = "sales@philtech.ph", Address = "Quezon City, Metro Manila" },
                new Supplier { CompanyName = "Manila Food Supply Corp.", ContactPerson = "Elena Villanueva", ContactNumber = "0918-777-5678", Email = "orders@manilafood.ph", Address = "Pasig City, Metro Manila" },
                new Supplier { CompanyName = "Global Home Essentials", ContactPerson = "Mark Tan", ContactNumber = "0919-666-9012", Email = "procurement@globalhome.ph", Address = "Makati City, Metro Manila" },
                new Supplier { CompanyName = "Visayas Beverage Co.", ContactPerson = "Christine Go", ContactNumber = "0920-555-3456", Email = "supply@visayasbev.ph", Address = "Cebu City, Cebu" }
            );
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} suppliers", 4);
            seeded = true;
        }

        if (!await context.Products.AnyAsync())
        {
            // Look up supplier IDs for linking
            var philtech = await context.Suppliers.FirstOrDefaultAsync(s => s.CompanyName == "PhilTech Distributors");
            var manilaFood = await context.Suppliers.FirstOrDefaultAsync(s => s.CompanyName == "Manila Food Supply Corp.");
            var globalHome = await context.Suppliers.FirstOrDefaultAsync(s => s.CompanyName == "Global Home Essentials");
            var visayasBev = await context.Suppliers.FirstOrDefaultAsync(s => s.CompanyName == "Visayas Beverage Co.");

            context.Products.AddRange(
                new Product { Name = "Samsung Galaxy A15", SKU = "ELEC-0001", Category = "Electronics", CostPrice = 5500.00m, SellingPrice = 7499.00m, Stock = 25, ReorderLevel = 5, UnitOfMeasure = "pcs", Barcode = "8806095483290", SupplierId = philtech?.Id },
                new Product { Name = "Lucky Me Pancit Canton Original", SKU = "GROC-0001", Category = "Grocery", CostPrice = 8.50m, SellingPrice = 12.00m, Stock = 200, ReorderLevel = 50, UnitOfMeasure = "pcs", Barcode = "4800024792310", SupplierId = manilaFood?.Id },
                new Product { Name = "Coca-Cola 1.5L PET", SKU = "BEVE-0001", Category = "Beverages", CostPrice = 42.00m, SellingPrice = 55.00m, Stock = 100, ReorderLevel = 30, UnitOfMeasure = "pcs", Barcode = "5449000054227", SupplierId = visayasBev?.Id },
                new Product { Name = "Bear Brand Adult Plus Milk 33g", SKU = "DAIR-0001", Category = "Dairy", CostPrice = 12.00m, SellingPrice = 16.00m, Stock = 150, ReorderLevel = 40, UnitOfMeasure = "pcs", Barcode = "4800361413381", SupplierId = manilaFood?.Id },
                new Product { Name = "Tide Powder Detergent 80g", SKU = "HOUS-0001", Category = "Household", CostPrice = 9.00m, SellingPrice = 13.00m, Stock = 120, ReorderLevel = 30, UnitOfMeasure = "pcs", Barcode = "4902430892391", SupplierId = globalHome?.Id },
                new Product { Name = "Kopiko Brown Coffee 25g", SKU = "BEVE-0002", Category = "Beverages", CostPrice = 6.00m, SellingPrice = 9.00m, Stock = 300, ReorderLevel = 80, UnitOfMeasure = "pcs", Barcode = "8886001592858", SupplierId = visayasBev?.Id },
                new Product { Name = "Argentina Corned Beef 260g", SKU = "CANN-0001", Category = "Canned Goods", CostPrice = 42.00m, SellingPrice = 58.00m, Stock = 80, ReorderLevel = 20, UnitOfMeasure = "pcs", Barcode = "4800036306109", SupplierId = manilaFood?.Id },
                new Product { Name = "Safeguard Soap Lemon Fresh 135g", SKU = "PERS-0001", Category = "Personal Care", CostPrice = 28.00m, SellingPrice = 38.00m, Stock = 60, ReorderLevel = 15, UnitOfMeasure = "pcs", Barcode = "4902430553711", SupplierId = globalHome?.Id },
                new Product { Name = "UFC Banana Ketchup 320g", SKU = "COND-0001", Category = "Condiments", CostPrice = 25.00m, SellingPrice = 35.00m, Stock = 75, ReorderLevel = 20, UnitOfMeasure = "pcs", Barcode = "4800015543230", SupplierId = manilaFood?.Id },
                new Product { Name = "Oishi Prawn Crackers 60g", SKU = "SNAC-0001", Category = "Snacks", CostPrice = 14.00m, SellingPrice = 20.00m, Stock = 90, ReorderLevel = 25, UnitOfMeasure = "pcs", Barcode = "4800194155601", SupplierId = manilaFood?.Id },
                new Product { Name = "Joy Dishwashing Liquid Lemon 250ml", SKU = "HOUS-0002", Category = "Household", CostPrice = 30.00m, SellingPrice = 42.00m, Stock = 55, ReorderLevel = 15, UnitOfMeasure = "pcs", Barcode = "4902430613835", SupplierId = globalHome?.Id },
                new Product { Name = "Energizer AA Battery 2-Pack", SKU = "ELEC-0002", Category = "Electronics", CostPrice = 45.00m, SellingPrice = 65.00m, Stock = 40, ReorderLevel = 10, UnitOfMeasure = "pcs", Barcode = "039800011329", SupplierId = philtech?.Id }
            );
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} products", 12);
            seeded = true;
        }

        if (!await context.Employees.AnyAsync())
        {
            context.Employees.AddRange(
                new Employee { FirstName = "Juan", LastName = "Dela Cruz", Email = "juan.dc@tradematrix.com", ContactNumber = "0917-123-4567", Department = "Operations", Position = "Store Manager", EmploymentStatus = "Full-time", BasicSalary = 35000m, HireDate = new DateTime(2024, 1, 15) },
                new Employee { FirstName = "Maria", LastName = "Santos", Email = "maria.s@tradematrix.com", ContactNumber = "0918-234-5678", Department = "Sales", Position = "Senior Cashier", EmploymentStatus = "Full-time", BasicSalary = 22000m, HireDate = new DateTime(2024, 3, 1) },
                new Employee { FirstName = "Jose", LastName = "Rizal", Email = "jose.r@tradematrix.com", ContactNumber = "0919-345-6789", Department = "Warehouse", Position = "Inventory Supervisor", EmploymentStatus = "Full-time", BasicSalary = 25000m, HireDate = new DateTime(2024, 2, 10) },
                new Employee { FirstName = "Ana", LastName = "Reyes", Email = "ana.r@tradematrix.com", ContactNumber = "0920-456-7890", Department = "Sales", Position = "Cashier", EmploymentStatus = "Full-time", BasicSalary = 18000m, HireDate = new DateTime(2024, 6, 1) },
                new Employee { FirstName = "Carlos", LastName = "Garcia", Email = "carlos.g@tradematrix.com", ContactNumber = "0921-567-8901", Department = "Warehouse", Position = "Stock Clerk", EmploymentStatus = "Contract", BasicSalary = 16000m, HireDate = new DateTime(2025, 1, 15) },
                new Employee { FirstName = "Sofia", LastName = "Cruz", Email = "sofia.c@tradematrix.com", ContactNumber = "0922-678-9012", Department = "Finance", Position = "Bookkeeper", EmploymentStatus = "Full-time", BasicSalary = 28000m, HireDate = new DateTime(2024, 4, 20) }
            );
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} employees", 6);
            seeded = true;
        }

        if (!await context.Customers.AnyAsync())
        {
            context.Customers.AddRange(
                new Customer { CustomerName = "Maria Clara", CustomerType = "Retail", ContactNumber = "0917-111-2222", Email = "maria.clara@email.com" },
                new Customer { CustomerName = "SM Supermarket - Branch 42", CustomerType = "Corporate", ContactNumber = "028-123-4567", Email = "branch42@smsupermarket.ph" },
                new Customer { CustomerName = "Pedro Penduko", CustomerType = "Retail", ContactNumber = "0918-333-4444", Email = "pedro.p@email.com" },
                new Customer { CustomerName = "Jollibee Foods Corp.", CustomerType = "Wholesale", ContactNumber = "028-987-6543", Email = "supply@jollibee.ph" },
                new Customer { CustomerName = "Aling Nena Sari-Sari Store", CustomerType = "Wholesale", ContactNumber = "0919-555-6666", Email = "nena.store@email.com" }
            );
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} customers", 5);
            seeded = true;
        }

        if (!await context.Expenses.AnyAsync())
        {
            context.Expenses.AddRange(
                new Expense { ExpenseCategory = "Utilities", Description = "March Electricity Bill - Meralco", Amount = 8500.00m, ExpenseDate = new DateTime(2026, 3, 1), Status = "Paid" },
                new Expense { ExpenseCategory = "Utilities", Description = "March Water Bill - Maynilad", Amount = 2200.00m, ExpenseDate = new DateTime(2026, 3, 1), Status = "Paid" },
                new Expense { ExpenseCategory = "Rent", Description = "March Store Rental", Amount = 45000.00m, ExpenseDate = new DateTime(2026, 3, 1), Status = "Paid" },
                new Expense { ExpenseCategory = "Supplies", Description = "Receipt Paper & Ink Cartridges", Amount = 1850.00m, ExpenseDate = new DateTime(2026, 3, 5), Status = "Approved" },
                new Expense { ExpenseCategory = "Maintenance", Description = "POS Terminal Repair", Amount = 3500.00m, ExpenseDate = new DateTime(2026, 3, 3), Status = "Paid" },
                new Expense { ExpenseCategory = "Marketing", Description = "Facebook Ads - March Campaign", Amount = 5000.00m, ExpenseDate = new DateTime(2026, 3, 2), Status = "Approved" },
                new Expense { ExpenseCategory = "Transportation", Description = "Delivery Van Fuel - Week 1", Amount = 4200.00m, ExpenseDate = new DateTime(2026, 3, 7), Status = "Pending" }
            );
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} expenses", 7);
            seeded = true;
        }

        if (!seeded)
            logger.LogInformation("Database already has data — skipping seed");
    }
}
