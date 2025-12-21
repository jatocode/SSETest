using System.Runtime.CompilerServices;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddCors(options => options.AddDefaultPolicy(
        policy => policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials()
));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapGet("/", () => "SSE Test!");

// Den här kommer direkt från Microsofts exempel på SSE med .NET 10
// flyttade ut metoden bara 
app.MapGet("/json-item", (CancellationToken cancellationToken) =>
{
    return TypedResults.ServerSentEvents(GetHeartRate(cancellationToken),
                                                  eventType: "heartRate");
});

app.UseCors();
app.Run();

async IAsyncEnumerable<HeartRateRecord> GetHeartRate(
    [EnumeratorCancellation] CancellationToken cancellationToken)
{
    while (!cancellationToken.IsCancellationRequested)
    {
        var heartRate = Random.Shared.Next(60, 100);
        yield return HeartRateRecord.Create(heartRate);
        await Task.Delay(2000, cancellationToken);
    }
}