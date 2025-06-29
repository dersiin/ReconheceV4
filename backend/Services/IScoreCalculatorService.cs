using ReconheceAi.Api.Models;
using System.Collections.Generic;

namespace ReconheceAi.Api.Services
{
    public interface IScoreCalculatorService
    {
        double CalcularScore(Employee colaborador, List<Employee> todosColaboradores, Dictionary<string, int> weights);
        Dictionary<string, double> CalcularScoreDetalhado(Employee colaborador, List<Employee> todosColaboradores, Dictionary<string, int> weights);
        double CalcularScoreNormalizado(Employee colaborador, List<Employee> todosColaboradores);
        List<string> IdentificarAreasMelhoria(Employee colaborador, List<Employee> todosColaboradores);
    }
}