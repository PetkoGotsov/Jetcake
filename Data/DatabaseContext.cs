using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ToDoCRUD.Model;

namespace ToDoCRUD.Data
{
    public class DatabaseContext : DbContext
    {
        public DatabaseContext (DbContextOptions<DatabaseContext> options)
            : base(options)
        {
        }

        public DbSet<ToDoCRUD.Model.UserEntity> Users { get; set; }
        public DbSet<ToDoCRUD.Model.ImageEntity> Images { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Model.UserEntity>().ToTable("Users");
            modelBuilder.Entity<Model.ImageEntity>().ToTable("Images");
        }
    }
}
