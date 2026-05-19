using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TradeMatrix.Server.Migrations
{
    /// <inheritdoc />
    public partial class FixOperationalRoleSystemFlags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Manager, Cashier, and InventoryClerk are operational roles, not system roles.
            // Only SuperAdmin is a true system role that cannot be archived.
            migrationBuilder.Sql("UPDATE Roles SET IsSystemRole = 0 WHERE Name IN ('Manager', 'Cashier', 'InventoryClerk')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE Roles SET IsSystemRole = 1 WHERE Name IN ('Manager', 'Cashier', 'InventoryClerk')");
        }
    }
}
