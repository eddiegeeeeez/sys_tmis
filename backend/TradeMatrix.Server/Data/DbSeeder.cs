using TradeMatrix.Server.Models;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Data
{
    public static class DbSeeder
    {
        public static void Seed(ApplicationDbContext context, IPasswordHashingService passwordHashing)
        {
            // 1. Seed Roles
            if (!context.Roles.Any())
            {
                var roles = new List<Role>
                {
                    new Role { Name = "SuperAdmin", Description = "Full system access" },
                    new Role { Name = "SystemAdmin", Description = "System configuration and user management" },
                    new Role { Name = "Manager", Description = "Store operations and reports" },
                    new Role { Name = "Cashier", Description = "POS and basic sales" },
                    new Role { Name = "InventoryClerk", Description = "Stock management" }
                };
                context.Roles.AddRange(roles);
                context.SaveChanges();
            }

            if (context.Users.Any())
            {
                return; // DB has been seeded with users
            }

            var passwordHash = passwordHashing.HashPassword("Password123!");
            
            // fetch roles from DB to get IDs
            var superAdminRole = context.Roles.First(r => r.Name == "SuperAdmin");
            var systemAdminRole = context.Roles.First(r => r.Name == "SystemAdmin");
            var managerRole = context.Roles.First(r => r.Name == "Manager");
            var cashierRole = context.Roles.First(r => r.Name == "Cashier");
            var clerkRole = context.Roles.First(r => r.Name == "InventoryClerk");

            var users = new User[]
            {
                new User
                {
                    Name = "Super Admin",
                    Email = "superadmin@tmis.com",
                    PasswordHash = passwordHash,
                    Role = superAdminRole,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Name = "System Admin",
                    Email = "admin@tmis.com",
                    PasswordHash = passwordHash,
                    Role = systemAdminRole,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Name = "Manager",
                    Email = "manager@tmis.com",
                    PasswordHash = passwordHash,
                    Role = managerRole,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Name = "Cashier",
                    Email = "cashier@tmis.com",
                    PasswordHash = passwordHash,
                    Role = cashierRole,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Name = "Inventory Clerk",
                    Email = "clerk@tmis.com",
                    PasswordHash = passwordHash,
                    Role = clerkRole,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.Users.AddRange(users);
            context.SaveChanges();

            // 3. Seed System Settings
            if (!context.SystemSettings.Any())
            {
                var settings = new List<SystemSetting>
                {
                    new SystemSetting { Key = "CompanyName", Value = "TradeMatrix Inc.", Description = "Legal name of the business", Group = "General" },
                    new SystemSetting { Key = "SupportEmail", Value = "support@tmis.com", Description = "Customer support contact address", Group = "General" },
                    new SystemSetting { Key = "Currency", Value = "PHP", Description = "System currency symbol", Group = "General" },
                    new SystemSetting { Key = "TaxRate", Value = "12.0", Description = "Default VAT/Tax rate percentage", Group = "General" },
                    new SystemSetting { Key = "SMTP_Host", Value = "smtp.mailtrap.io", Description = "Outgoing mail server", Group = "Email" },
                    new SystemSetting { Key = "SMTP_Port", Value = "587", Description = "Mail server port", Group = "Email" },
                    new SystemSetting { Key = "SMTP_User", Value = "admin@tmis.com", Description = "Mail server username", Group = "Email" }
                };
                context.SystemSettings.AddRange(settings);
                context.SaveChanges();
            }
        }
    }
}
