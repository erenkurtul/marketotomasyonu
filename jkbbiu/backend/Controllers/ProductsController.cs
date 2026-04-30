using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using backend.Models;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly MongoDbService _mongoDb;

        public ProductsController(MongoDbService mongoDb)
        {
            _mongoDb = mongoDb;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _mongoDb.Products
                .Find(_ => true)
                .Limit(1000)
                .ToListAsync();
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var product = await _mongoDb.Products.Find(p => p.Id == id).FirstOrDefaultAsync();
            if (product == null)
                return NotFound();

            return Ok(product);
        }

        [HttpGet("barcode/{barcode}")]
        public async Task<IActionResult> GetByBarcode(string barcode)
        {
            var product = await _mongoDb.Products.Find(p => p.Barcode == barcode).FirstOrDefaultAsync();
            if (product == null)
                return NotFound(new { message = "Ürün bulunamadı." });

            return Ok(product);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] ProductDto dto)
        {
            var existingProduct = await _mongoDb.Products.Find(p => p.Barcode == dto.Barcode).FirstOrDefaultAsync();
            if (existingProduct != null)
            {
                return BadRequest(new { message = "Bu barkod numarası zaten kayıtlı." });
            }

            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Barcode = dto.Barcode,
                CategoryId = dto.CategoryId,
                PurchasePrice = dto.PurchasePrice,
                SalePrice = dto.SalePrice,
                TaxRate = dto.TaxRate,
                StockQuantity = dto.StockQuantity,
                MinimumStockLevel = dto.MinimumStockLevel,
                Unit = dto.Unit,
                ImageUrl = dto.ImageUrl,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _mongoDb.Products.InsertOneAsync(product);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(string id, [FromBody] ProductDto dto)
        {
            var product = await _mongoDb.Products.Find(p => p.Id == id).FirstOrDefaultAsync();
            if (product == null)
                return NotFound();

            product.Name = dto.Name;
            product.Description = dto.Description;
            product.Barcode = dto.Barcode;
            product.CategoryId = dto.CategoryId;
            product.PurchasePrice = dto.PurchasePrice;
            product.SalePrice = dto.SalePrice;
            product.TaxRate = dto.TaxRate;
            product.StockQuantity = dto.StockQuantity;
            product.MinimumStockLevel = dto.MinimumStockLevel;
            product.Unit = dto.Unit;
            product.ImageUrl = dto.ImageUrl;
            product.UpdatedAt = DateTime.UtcNow;

            await _mongoDb.Products.ReplaceOneAsync(p => p.Id == id, product);
            return Ok(product);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            var result = await _mongoDb.Products.DeleteOneAsync(p => p.Id == id);
            if (result.DeletedCount == 0)
                return NotFound();

            return NoContent();
        }

        [HttpGet("low-stock")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetLowStock()
        {
            var lowStockProducts = await _mongoDb.Products
                .Find(p => p.StockQuantity <= p.MinimumStockLevel && p.IsActive)
                .ToListAsync();

            return Ok(lowStockProducts);
        }
    }
}