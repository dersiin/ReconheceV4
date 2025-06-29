using System.Collections.Generic;

public record AnalysisRequest(int ColaboradorId, string AnalysisType, Dictionary<string, int> Weights); 