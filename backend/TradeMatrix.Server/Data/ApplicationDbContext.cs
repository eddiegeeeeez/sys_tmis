using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<SystemSetting> SystemSettings { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
        public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<PayrollRecord> PayrollRecords { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<TransactionItem> TransactionItems { get; set; }
        public DbSet<StockMovement> StockMovements { get; set; }
        public DbSet<BackupRecord> BackupRecords { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── Users ──────────────────────────────────────────────
            modelBuilder.Entity<User>(e =>
            {
                e.HasIndex(u => u.Email).IsUnique();
                e.HasIndex(u => u.RoleId);
                e.Property(u => u.PasswordHash).HasMaxLength(200);
                e.Property(u => u.CreatedBy).HasMaxLength(100);
                e.Property(u => u.UpdatedBy).HasMaxLength(100);
                e.Property(u => u.PasswordResetToken).HasMaxLength(200);
            });

            // ── Roles ──────────────────────────────────────────────
            modelBuilder.Entity<Role>(e =>
            {
                e.HasIndex(r => r.Name).IsUnique();
            });

            // ── Products ───────────────────────────────────────────
            modelBuilder.Entity<Product>(e =>
            {
                e.HasIndex(p => p.SKU).IsUnique();
                e.HasIndex(p => p.Category);
                e.HasIndex(p => p.IsActive);
            });

            // ── Suppliers ──────────────────────────────────────────
            modelBuilder.Entity<Supplier>(e =>
            {
                e.HasIndex(s => s.CompanyName);
                e.HasIndex(s => s.IsActive);
            });

            // ── Purchase Orders ────────────────────────────────────
            modelBuilder.Entity<PurchaseOrder>(e =>
            {
                e.HasIndex(po => po.PONumber).IsUnique();
                e.HasIndex(po => po.OrderDate);
                e.HasIndex(po => po.Status);
                // Prevent cascade-delete from destroying order history
                e.HasOne(po => po.Supplier)
                 .WithMany()
                 .HasForeignKey(po => po.SupplierId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ── Employees ──────────────────────────────────────────
            modelBuilder.Entity<Employee>(e =>
            {
                e.HasIndex(emp => emp.Email).IsUnique();
                e.HasIndex(emp => emp.Department);
                e.HasIndex(emp => emp.IsActive);
            });

            // ── Attendances ────────────────────────────────────────
            modelBuilder.Entity<Attendance>(e =>
            {
                e.HasIndex(a => new { a.EmployeeId, a.Date });
                e.HasIndex(a => a.Date);
            });

            // ── Payroll Records ────────────────────────────────────
            modelBuilder.Entity<PayrollRecord>(e =>
            {
                e.HasIndex(pr => pr.PayPeriodStart);
                e.HasIndex(pr => pr.Status);
            });

            // ── Customers ──────────────────────────────────────────
            modelBuilder.Entity<Customer>(e =>
            {
                e.HasIndex(c => c.CustomerName);
                e.HasIndex(c => c.IsActive);
            });

            // ── Expenses ───────────────────────────────────────────
            modelBuilder.Entity<Expense>(e =>
            {
                e.HasIndex(ex => ex.ExpenseDate);
                e.HasIndex(ex => ex.ExpenseCategory);
                e.HasIndex(ex => ex.Status);
            });

            // ── Transactions ───────────────────────────────────────
            modelBuilder.Entity<Transaction>(e =>
            {
                e.HasIndex(t => t.TransactionNumber).IsUnique();
                e.HasIndex(t => t.TransactionDate);
                e.HasIndex(t => t.Status);
            });

            // ── Audit Logs ─────────────────────────────────────────
            modelBuilder.Entity<AuditLog>(e =>
            {
                e.HasIndex(a => a.Timestamp);
                e.HasIndex(a => a.ActorEmail);
                e.HasIndex(a => a.Event);
                e.HasIndex(a => a.Severity);
            });

            // ── Stock Movements ─────────────────────────────────────
            modelBuilder.Entity<StockMovement>(e =>
            {
                e.HasIndex(sm => sm.ProductId);
                e.HasIndex(sm => sm.MovementType);
                e.HasIndex(sm => sm.CreatedAt);
                e.HasIndex(sm => sm.Reference);
            });

            // ── Backup Records ──────────────────────────────────────
            modelBuilder.Entity<BackupRecord>(e =>
            {
                e.HasIndex(b => b.CreatedAt);
                e.HasIndex(b => b.Status);
            });
        }
    }
}
