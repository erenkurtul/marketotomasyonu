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
    public class CustomersController : ControllerBase
    {
        private readonly MongoDbService _mongoDb;

        public CustomersController(MongoDbService mongoDb)
        {
            _mongoDb = mongoDb;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var customers = await _mongoDb.Customers
                .Find(_ => true)
                .Limit(1000)
                .ToListAsync();
            return Ok(customers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var customer = await _mongoDb.Customers.Find(c => c.Id == id).FirstOrDefaultAsync();
            if (customer == null)
                return NotFound();

            return Ok(customer);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Customer customer)
        {
            customer.CreatedAt = DateTime.UtcNow;
            await _mongoDb.Customers.InsertOneAsync(customer);
            return CreatedAtAction(nameof(GetById), new { id = customer.Id }, customer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Customer customer)
        {
            var existing = await _mongoDb.Customers.Find(c => c.Id == id).FirstOrDefaultAsync();
            if (existing == null)
                return NotFound();

            customer.Id = id;
            customer.CreatedAt = existing.CreatedAt;
            await _mongoDb.Customers.ReplaceOneAsync(c => c.Id == id, customer);
            return Ok(customer);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(string id)
        {
            var result = await _mongoDb.Customers.DeleteOneAsync(c => c.Id == id);
            if (result.DeletedCount == 0)
                return NotFound();

            return NoContent();
        }
    }
}