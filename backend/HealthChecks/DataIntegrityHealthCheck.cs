using Microsoft.Extensions.Diagnostics.HealthChecks;
using ReconheceAi.Api.Services;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ReconheceAi.Api.Configuration
{
    public class DataIntegrityHealthCheck : IHealthCheck
    {
        private readonly IDataService _dataService;

        public DataIntegrityHealthCheck(IDataService dataService)
        {
            _dataService = dataService;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context, 
            CancellationToken cancellationToken = default)
        {
            try
            {
                var isValid = await _dataService.ValidateDataIntegrityAsync();
                
                if (isValid)
                {
                    return HealthCheckResult.Healthy("Integridade dos dados validada com sucesso");
                }
                
                return HealthCheckResult.Degraded("Problemas detectados na integridade dos dados");
            }
            catch (Exception ex)
            {
                return HealthCheckResult.Unhealthy("Erro ao validar integridade dos dados", ex);
            }
        }
    }

    public class CsvFileHealthCheck : IHealthCheck
    {
        public Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context, 
            CancellationToken cancellationToken = default)
        {
            try
            {
                var projectRootPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
                var csvPath = Path.Combine(projectRootPath, "data", "Hackaton.csv");
                
                if (File.Exists(csvPath))
                {
                    var fileInfo = new FileInfo(csvPath);
                    return Task.FromResult(HealthCheckResult.Healthy($"Arquivo CSV encontrado. Tamanho: {fileInfo.Length} bytes"));
                }
                
                return Task.FromResult(HealthCheckResult.Unhealthy("Arquivo CSV não encontrado"));
            }
            catch (Exception ex)
            {
                return Task.FromResult(HealthCheckResult.Unhealthy("Erro ao verificar arquivo CSV", ex));
            }
        }
    }
}