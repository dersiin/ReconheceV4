using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ReconheceAi.Api.Services;
using System;

namespace ReconheceAi.Api.Configuration
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // Serviços principais
            services.AddScoped<IDataService, DataService>();
            services.AddScoped<IScoreCalculatorService, ScoreCalculatorService>();
            services.AddScoped<ILlmService, LlmService>();
            services.AddScoped<ISentimentService, SentimentService>();
            services.AddScoped<IAnomalyDetectorService, AnomalyDetectorService>();
            
            // Cache em memória
            services.AddMemoryCache(options =>
            {
                options.SizeLimit = 100; // Limite de 100 entradas
                options.CompactionPercentage = 0.25; // Remove 25% quando atinge o limite
            });
            
            return services;
        }

        public static IServiceCollection AddApiConfiguration(this IServiceCollection services)
        {
            // CORS
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", builder =>
                {
                    builder.AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader();
                });
                
                options.AddPolicy("Production", builder =>
                {
                    builder.WithOrigins("https://your-frontend-domain.com")
                           .AllowAnyMethod()
                           .AllowAnyHeader()
                           .AllowCredentials();
                });
            });

            // Configuração de JSON
            services.ConfigureHttpJsonOptions(options =>
            {
                options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                options.SerializerOptions.WriteIndented = true;
            });

            // Rate limiting (se necessário)
            services.AddRateLimiter(options =>
            {
                options.GlobalLimiter = System.Threading.RateLimiting.PartitionedRateLimiter.Create<HttpContext, string>(
                    httpContext => System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: httpContext.User.Identity?.Name ?? httpContext.Request.Headers.Host.ToString(),
                        factory: partition => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 100,
                            Window = TimeSpan.FromMinutes(1)
                        }));
            });

            return services;
        }

        public static IServiceCollection AddHealthChecks(this IServiceCollection services)
        {
            services.AddHealthChecks()
                .AddCheck<DataIntegrityHealthCheck>("data-integrity")
                .AddCheck<CsvFileHealthCheck>("csv-file");
                
            return services;
        }
    }
}