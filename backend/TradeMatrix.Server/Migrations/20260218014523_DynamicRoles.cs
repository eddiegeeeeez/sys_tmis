using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TradeMatrix.Server.Migrations
{
    /// <inheritdoc />
    public partial class DynamicRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Role",
                table: "Users",
                newName: "RoleId");

            // Columns already added in 20260211000000_AddUserSecurityAndAuditColumns
            /*
            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
            ...
            */

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Permissions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsSystemRole = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            // Seed Roles
            migrationBuilder.Sql("SET IDENTITY_INSERT Roles ON");
            migrationBuilder.Sql("INSERT INTO Roles (Id, Name, Description, Permissions, IsSystemRole, CreatedAt) VALUES (1, 'SuperAdmin', 'Full system access', '', 1, GETUTCDATE())");
            migrationBuilder.Sql("INSERT INTO Roles (Id, Name, Description, Permissions, IsSystemRole, CreatedAt) VALUES (2, 'SystemAdmin', 'System configuration and user management', '', 1, GETUTCDATE())");
            migrationBuilder.Sql("INSERT INTO Roles (Id, Name, Description, Permissions, IsSystemRole, CreatedAt) VALUES (3, 'Manager', 'Store operations and reports', '', 0, GETUTCDATE())");
            migrationBuilder.Sql("INSERT INTO Roles (Id, Name, Description, Permissions, IsSystemRole, CreatedAt) VALUES (4, 'Cashier', 'POS and basic sales', '', 0, GETUTCDATE())");
            migrationBuilder.Sql("INSERT INTO Roles (Id, Name, Description, Permissions, IsSystemRole, CreatedAt) VALUES (5, 'InventoryClerk', 'Stock management', '', 0, GETUTCDATE())");
            migrationBuilder.Sql("SET IDENTITY_INSERT Roles OFF");

            // Update existing Users to map old Enum values (0-based) to new IDs (1-based)
            migrationBuilder.Sql("UPDATE Users SET RoleId = RoleId + 1");

            migrationBuilder.CreateTable(
                name: "SystemSettings",
                columns: table => new
                {
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Group = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemSettings", x => x.Key);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Roles_RoleId",
                table: "Users",
                column: "RoleId",
                principalTable: "Roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Roles_RoleId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "SystemSettings");

            migrationBuilder.DropIndex(
                name: "IX_Users_RoleId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FailedLoginAttempts",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastLogin",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LockoutUntil",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PasswordResetExpiry",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PasswordResetToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "RoleId",
                table: "Users",
                newName: "Role");
        }
    }
}
