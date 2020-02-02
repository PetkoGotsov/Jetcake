using ToDoCRUD.Data;
using ToDoCRUD.Model;
using System;
using System.Linq;
using System.Collections.Generic;

namespace ToDoCRUD.Data
{
    public static class DbInitializer
    {
        public static void Initialize(DatabaseContext context)
        {
            context.Database.EnsureCreated();
            context.SaveChanges();
        }
    }
}