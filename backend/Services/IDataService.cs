using ReconheceAi.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ReconheceAi.Api.Services
{
    public interface IDataService
    {
        Task<List<Employee>> LoadEmployeesFromCsvAsync();
        Task<Employee?> GetEmployeeByIdAsync(int id);
        Task<List<Employee>> GetEmployeesByDepartmentAsync(string department);
        Task<List<Employee>> GetHighRiskEmployeesAsync();
        Task<Dictionary<string, object>> GetDashboardMetricsAsync();
        Task<bool> ValidateDataIntegrityAsync();
    }
}