using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using backend.Services;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Driver;

LoadEnvFile();

var builder = WebApplication.CreateBuilder(args);

var mongoConventions = new ConventionPack
{
    new IgnoreExtraElementsConvention(true)
};
ConventionRegistry.Register("market-automation-conventions", mongoConventions, _ => true);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger/OpenAPI configuration with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Market Automation API", Version = "v1" });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Register MongoDB service
builder.Services.AddSingleton<MongoDbService>();
builder.Services.AddSingleton<JwtService>();
builder.Services.AddSingleton<DatabaseSeedService>();

// JWT Authentication - Priority: Environment variables > appsettings.json
var jwtSecretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") 
    ?? builder.Configuration["JWT:SecretKey"];
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") 
    ?? builder.Configuration["JWT:Issuer"];
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") 
    ?? builder.Configuration["JWT:Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey!))
    };
});

builder.Services.AddAuthorization();

// CORS configuration - Priority: Environment variables > appsettings.json
var corsOrigins = Environment.GetEnvironmentVariable("CORS_ORIGINS") 
    ?? builder.Configuration["CORS:Origins"] 
    ?? "*";
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (corsOrigins == "*")
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            policy.WithOrigins(corsOrigins.Split(','))
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    });
});

var app = builder.Build();

try
{
    var mongoDb = app.Services.GetRequiredService<MongoDbService>();
    app.Logger.LogInformation("MongoDB hedefi: {Database}.products", mongoDb.DatabaseName);
    var connected = false;
    long productCount = 0;

    for (var attempt = 1; attempt <= 3; attempt++)
    {
        try
        {
            productCount = await mongoDb.Products.CountDocumentsAsync(FilterDefinition<backend.Models.Product>.Empty);
            connected = true;
            app.Logger.LogInformation("MongoDB bağlantısı başarılı. Ürün sayısı: {ProductCount}", productCount);
            break;
        }
        catch (Exception ex) when (attempt < 3)
        {
            app.Logger.LogWarning(ex, "MongoDB bağlantı denemesi {Attempt}/3 başarısız, tekrar denenecek...", attempt);
            await Task.Delay(TimeSpan.FromSeconds(3));
        }
    }

    if (!connected)
    {
        throw new InvalidOperationException("MongoDB Atlas'a 3 denemede bağlanılamadı.");
    }

    var adminUser = await mongoDb.Users.Find(u => u.Username == "admin").FirstOrDefaultAsync();
    if (adminUser == null)
    {
        adminUser = new backend.Models.User
        {
            Username = "admin",
            Email = "admin@market.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            FullName = "Sistem Yönetici",
            Role = backend.Models.UserRole.Admin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        await mongoDb.Users.InsertOneAsync(adminUser);
        app.Logger.LogInformation("Varsayılan admin kullanıcısı oluşturuldu.");
    }
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "MongoDB bağlantısı kurulamadı. .env içindeki MONGO_URL değerini kontrol edin.");
}

// Fake data seeding is opt-in to avoid polluting real project data.
var shouldSeedFakeData =
    (Environment.GetEnvironmentVariable("SEED_FAKE_DATA")
        ?? builder.Configuration["Database:SeedFakeData"]
        ?? "false")
    .Equals("true", StringComparison.OrdinalIgnoreCase);

if (shouldSeedFakeData)
{
    var seedService = app.Services.GetRequiredService<DatabaseSeedService>();
    await seedService.SeedAsync();
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => Results.Redirect("http://localhost:3000"));

app.MapGet("/api/health", async (MongoDbService mongoDb) =>
{
    try
    {
        var productCount = await mongoDb.Products.CountDocumentsAsync(FilterDefinition<backend.Models.Product>.Empty);
        return Results.Ok(new
        {
            status = "ok",
            productCount,
            appUrl = "http://localhost:3000",
            message = "Ürünleri görmek için uygulamayı açın, giriş yapın ve Ürünler menüsüne gidin."
        });
    }
    catch (Exception ex)
    {
        return Results.Json(new { status = "error", message = ex.Message }, statusCode: 503);
    }
});

app.MapControllers();

app.Run("http://0.0.0.0:8001");

static void LoadEnvFile()
{
    var envFile = Path.Combine(Directory.GetCurrentDirectory(), ".env");
    if (!File.Exists(envFile))
        return;

    foreach (var rawLine in File.ReadAllLines(envFile))
    {
        var line = rawLine.Trim();
        if (line.Length == 0 || line.StartsWith('#'))
            continue;

        var separatorIndex = line.IndexOf('=');
        if (separatorIndex <= 0)
            continue;

        var key = line[..separatorIndex].Trim();
        var value = line[(separatorIndex + 1)..].Trim();
        Environment.SetEnvironmentVariable(key, value);
    }
}
