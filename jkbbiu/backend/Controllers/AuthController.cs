using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using BCrypt.Net;
using backend.Models;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly MongoDbService _mongoDb;
        private readonly JwtService _jwtService;

        public AuthController(MongoDbService mongoDb, JwtService jwtService)
        {
            _mongoDb = mongoDb;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var existingUser = await _mongoDb.Users.Find(u => u.Username == dto.Username || u.Email == dto.Email).FirstOrDefaultAsync();
            if (existingUser != null)
            {
                return BadRequest(new { message = "Kullanıcı adı veya email zaten kullanımda." });
            }

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FullName = dto.FullName,
                Phone = dto.Phone,
                Role = dto.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _mongoDb.Users.InsertOneAsync(user);

            var token = _jwtService.GenerateToken(user);

            return Ok(new LoginResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id!,
                    Username = user.Username,
                    Email = user.Email,
                    FullName = user.FullName,
                    Phone = user.Phone,
                    Role = user.Role,
                    IsActive = user.IsActive
                }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _mongoDb.Users.Find(u => u.Username == dto.Username).FirstOrDefaultAsync();
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Kullanıcı adı veya şifre hatalı." });
            }

            if (!user.IsActive)
            {
                return Unauthorized(new { message = "Hesabınız devre dışı bırakılmış." });
            }

            user.LastLogin = DateTime.UtcNow;
            await _mongoDb.Users.ReplaceOneAsync(u => u.Id == user.Id, user);

            var token = _jwtService.GenerateToken(user);

            return Ok(new LoginResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id!,
                    Username = user.Username,
                    Email = user.Email,
                    FullName = user.FullName,
                    Phone = user.Phone,
                    Role = user.Role,
                    IsActive = user.IsActive
                }
            });
        }
    }
}