using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using backend.Models;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly MongoDbService _mongoDb;

        public CategoriesController(MongoDbService mongoDb)
        {
            _mongoDb = mongoDb;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _mongoDb.Categories
                .Find(_ => true)
                .Limit(1000)
                .ToListAsync();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var category = await _mongoDb.Categories.Find(c => c.Id == id).FirstOrDefaultAsync();
            if (category == null)
                return NotFound();

            return Ok(category);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] Category category)
        {
            category.CreatedAt = DateTime.UtcNow;
            await _mongoDb.Categories.InsertOneAsync(category);
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(string id, [FromBody] Category category)
        {
            var existing = await _mongoDb.Categories.Find(c => c.Id == id).FirstOrDefaultAsync();
            if (existing == null)
                return NotFound();

            category.Id = id;
            category.CreatedAt = existing.CreatedAt;
            await _mongoDb.Categories.ReplaceOneAsync(c => c.Id == id, category);
            return Ok(category);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            var result = await _mongoDb.Categories.DeleteOneAsync(c => c.Id == id);
            if (result.DeletedCount == 0)
                return NotFound();

            return NoContent();
        }
    }
}