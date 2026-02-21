using TradeMatrix.Server.Models;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Data
{
    public static class DbSeeder
    {
        public static void Seed(ApplicationDbContext context, IPasswordHashingService passwordHashing)
        {
            // Ensure Roles exist
            if (!context.Roles.Any())
            {
                var roles = new List<Role>
                {
                    new Role { Name = "SuperAdmin", Description = "Full system access", IsSystemRole = true, Permissions = "all" },
                    new Role { Name = "SystemAdmin", Description = "Administrative access", IsSystemRole = true, Permissions = "admin" },
                    new Role { Name = "Manager", Description = "Management access", IsSystemRole = true, Permissions = "manage" },
                    new Role { Name = "Cashier", Description = "POS access", IsSystemRole = true, Permissions = "pos" },
                    new Role { Name = "InventoryClerk", Description = "Inventory access", IsSystemRole = true, Permissions = "inventory" }
                };
                context.Roles.AddRange(roles);
                context.SaveChanges();
            }

            // Ensure SuperAdmin exists
            if (!context.Users.Any(u => u.Email == "superadmin@tmis.com"))
            {
                var superAdminRole = context.Roles.FirstOrDefault(r => r.Name == "SuperAdmin");
                if (superAdminRole != null)
                {
                    var superAdmin = new User
                    {
                        Name = "Super Admin",
                        Email = "superadmin@tmis.com",
                        PasswordHash = passwordHashing.HashPassword("Admin123!"), // Default password
                        RoleId = superAdminRole.Id,
                        IsActive = true
                    };
                    context.Users.Add(superAdmin);
                    context.SaveChanges();
                }
            }
        }
    }
}
