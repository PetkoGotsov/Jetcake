using System;
using System.Collections;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using ToDoCRUD.Data;
using ToDoCRUD.Model;

namespace ToDoCRUD.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly DatabaseContext _context;

        public UsersController(DatabaseContext context)
        {
            _context = context;
        }

        [HttpPost("/api/Login")]
        public IActionResult LoginUser([FromForm]UserEntity userEntity)
        {
            //Get user details for the user who is trying to login
            var user = this._context.Users.FirstOrDefault(x => x.Username == userEntity.Username);

            //Authenticate User, Check if it’s a registered user in Database
            if (user == null)
                return BadRequest();

            //If it's registered user, check user password stored in Database 
            //For demo, password is not hashed. Simple string comparison 
            //In real, password would be hashed and stored in DB. Before comparing, hash the password
            if (userEntity.Password == user.Password)
            {
                var token = GenerateToken(user);

                if (user.ProfileImageEntityId != 0)
                {
                    var profileImage = _context.Images.FirstOrDefault(image => image.Id == user.ProfileImageEntityId);
                    user.ProfileImageEntity = profileImage;
                }
                return new JsonResult(new { token = token, user = user });
            }
            else
            {
                return Unauthorized();
            }
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserEntity>> GetUserEntity(Guid id)
        {
            var userEntity = await _context.Users.FindAsync(id);

            if (userEntity == null)
            {
                return NotFound();
            }

            return userEntity;
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUserEntity(int id, [FromForm]UserEntity userEntity)
        {
            if(id != userEntity.ID)
            {
                return BadRequest();
            }
            //check if profile image changed, if not get it from context to avoid traffic
            if (userEntity.ProfileImage != null)
            {
                if (userEntity.ProfileImage.Length > 0)
                {
                    SaveUserImage(userEntity);
                }
            }

            _context.Entry(userEntity).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserEntityExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            userEntity.ProfileImageEntity = _context.Images.FirstOrDefault(image => image.Id == userEntity.ProfileImageEntityId);
            var token = GenerateToken(userEntity);

            return new JsonResult(new { token = token, user = userEntity });
        }

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult> PostUserEntity([FromForm]UserEntity userEntity)
        {
            if (userEntity != null) 
            {
                var duplicate = _context.Users.FirstOrDefault(user => (user.Email == userEntity.Email) || (user.Username == userEntity.Username));
                if(duplicate != null)
                {
                    string responseMsg = duplicate.Email == userEntity.Email && duplicate.Username == userEntity.Username ?
                        "These email and username are already taken" : duplicate.Email == userEntity.Email ? "This email is already taken" :
                        duplicate.Username == userEntity.Username ? "This username is already taken" : "";
                    return new JsonResult(responseMsg);
                }
                if (userEntity.ProfileImage.Length > 0)
                {
                    SaveUserImage(userEntity);
                }
                _context.Users.Add(userEntity);
                await _context.SaveChangesAsync();
                return Ok();
            }
            return BadRequest();
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<UserEntity>> DeleteUsersEntity(Guid id)
        {
            var userEntity = await _context.Users.FindAsync(id);
            if (userEntity == null)
            {
                return NotFound();
            }

            _context.Users.Remove(userEntity);
            await _context.SaveChangesAsync();

            return userEntity;
        }
        private IEnumerable<Claim> GetUserClaims(UserEntity user)
        {
            IEnumerable<Claim> claims = new Claim[]
            {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim("USERID", user.ID.ToString()),
            new Claim("EMAILID", user.Email),
            new Claim("PHONE", user.PhoneNumber)
            };
            return claims;
        }

        private bool UserEntityExists(int id)
        {
            return _context.Users.Any(e => e.ID == id);
        }

        private void SaveUserImage(UserEntity userEntity)
        {
            using (var ms = new MemoryStream())
            {
                userEntity.ProfileImage.CopyTo(ms);
                var fileBytes = ms.ToArray();
                ImageEntity imageEntity = new ImageEntity { ImageTitle = userEntity.ProfileImage.FileName, ImageData = fileBytes };
                _context.Images.Add(imageEntity);
                userEntity.ProfileImageEntityId = _context.Images.Count() + 1;
            }
        }

        private string GenerateToken(UserEntity userEntity)
        {
            //Authentication successful, Issue Token with user credentials
            //Provide the security key
            var key = Encoding.ASCII.GetBytes
                      ("YourKey-2374-OFFKDI940NG7:56753253-tyuw-5769-0921-kfirox29zoxv");
            //Generate Token for user 
            var JWToken = new JwtSecurityToken(
                issuer: "http://localhost:45092/",
                audience: "http://localhost:45092/",
                claims: GetUserClaims(userEntity),
                notBefore: new DateTimeOffset(DateTime.Now).DateTime,
                expires: new DateTimeOffset(DateTime.Now).DateTime.AddDays(1),
                //Using HS256 Algorithm to encrypt Token
                signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key),
                                    "HS256")
            );
            var token = new JwtSecurityTokenHandler().WriteToken(JWToken);
            return token;
        }
    }
}
