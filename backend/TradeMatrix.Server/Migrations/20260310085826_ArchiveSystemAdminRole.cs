using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TradeMatrix.Server.Migrations
{
    /// <inheritdoc />
    public partial class ArchiveSystemAdminRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Archive the SystemAdmin role — this role is not part of the active role set
            // and cannot be removed from the UI because it's a system role.
            migrationBuilder.Sql("UPDATE Roles SET IsArchived = 1 WHERE Name = 'SystemAdmin'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE Roles SET IsArchived = 0 WHERE Name = 'SystemAdmin'");
        }
    }
}
