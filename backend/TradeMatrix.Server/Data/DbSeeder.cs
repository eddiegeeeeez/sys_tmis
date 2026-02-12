using TradeMatrix.Server.Models;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Data
{
    public static class DbSeeder
    {
        public static void Seed(ApplicationDbContext context, IPasswordHashingService passwordHashing)
        {
            if (context.Users.Any())
            {
                return; // DB has been seeded
            }

            var passwordHash = passwordHashing.HashPassword("Password123!");

            var users = new User[]
            {
                new User 
                { 
                    Name = "Super Admin", 
                    Email = "superadmin@tmis.com", 
                    PasswordHash = passwordHash, 
                    Role = UserRole.SuperAdmin,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User 
                { 
                    Name = "System Admin", 
                    Email = "admin@tmis.com", 
                    PasswordHash = passwordHash, 
                    Role = UserRole.SystemAdmin,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User 
                { 
                    Name = "Manager", 
                    Email = "manager@tmis.com", 
                    PasswordHash = passwordHash, 
                    Role = UserRole.Manager,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User 
                { 
                    Name = "Cashier", 
                    Email = "cashier@tmis.com", 
                    PasswordHash = passwordHash, 
                    Role = UserRole.Cashier,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User 
                { 
                    Name = "Inventory Clerk", 
                    Email = "clerk@tmis.com", 
                    PasswordHash = passwordHash, 
                    Role = UserRole.InventoryClerk,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.Users.AddRange(users);
            context.SaveChanges();
        }
    }
}
