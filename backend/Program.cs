using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ReconheceAi.Api.Configuration;
using ReconheceAi.Api.Middleware;
using System;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication(builder =>
    {
        // Middleware personalizado
        builder.UseMiddleware<RequestLoggingMiddleware>();
        builder.UseMiddleware<ErrorHandlingMiddleware>();
    })
    .ConfigureServices(services =>
    {
        // Configuração de logging
        services.AddLogging(builder =>
        {
            builder.AddConsole();
            builder.AddApplicationInsights();
            builder.SetMinimumLevel(LogLevel.Information);
        });

        // Application Insights
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();

        // Serviços da aplicação
        services.AddApplicationServices();
        services.AddApiConfiguration();
        services.AddHealthChecks();

        // HTTP Client Factory
        services.AddHttpClient();

        // Configuração de ambiente
        var environment = Environment.GetEnvironmentVariable("AZURE_FUNCTIONS_ENVIRONMENT") ?? "Development";
        
        if (environment == "Development")
        {
            services.AddLogging(builder => builder.SetMinimumLevel(LogLevel.Debug));
        }
    })
    .ConfigureLogging(logging =>
    {
        // Remove o provider padrão do Azure Functions para ter controle total
        logging.Services.Configure<LoggerFilterOptions>(options =>
        {
            var defaultRule = options.Rules.FirstOrDefault(rule => 
                rule.ProviderName == "Microsoft.Extensions.Logging.ApplicationInsights.ApplicationInsightsLoggerProvider");
            
            if (defaultRule is not null)
            {
                options.Rules.Remove(defaultRule);
            }
        });
    })
    .Build();

// Log de inicialização
var logger = host.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("ReconheceAI API iniciada com sucesso");
logger.LogInformation("Ambiente: {Environment}", Environment.GetEnvironmentVariable("AZURE_FUNCTIONS_ENVIRONMENT"));

host.Run();

// Classe Program para referência
public partial class Program { }