using MongoDB.Driver;
var url = "mongodb+srv://sevketerenkurtul:eren123@cluster0.uponhxo.mongodb.net/?retryWrites=true&w=majority";
var client = new MongoClient(url);
foreach (var dbName in await client.ListDatabaseNames().ToListAsync())
{
    var db = client.GetDatabase(dbName);
    var cols = await db.ListCollectionNames().ToListAsync();
    if (cols.Count > 0) Console.WriteLine($"{dbName}: {string.Join(", ", cols)}");
}
