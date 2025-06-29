using CsvHelper.Configuration.Attributes;

public class ColaboradorCsvRecord
{
    [Name("nome")]
    public string? Nome { get; set; }

    [Name("cargo")]
    public string? Cargo { get; set; }

    [Name("desempenho")]
    public string? Desempenho { get; set; }

    [Name("risco_perda")]
    public string? RiscoPerda { get; set; }

    [Name("impacto_perda")]
    public string? ImpactoPerda { get; set; }

    [Name("tempo_casa")]
    public double TempoCasa { get; set; }

    [Name("tempo_cargo")]
    public double TempoCargo { get; set; }

    [Name("advertencias")]
    public int Advertencias { get; set; }

    [Name("feedback_ultima_avaliacao")]
    public string? FeedbackUltimaAvaliacao { get; set; }

    [Name("absenteismo_m1")]
    public string? AbsenteismoM1 { get; set; }

    [Name("absenteismo_m2")]
    public string? AbsenteismoM2 { get; set; }

    [Name("absenteismo_m3")]
    public string? AbsenteismoM3 { get; set; }

    [Name("absenteismo_m4")]
    public string? AbsenteismoM4 { get; set; }

    [Name("absenteismo_m5")]
    public string? AbsenteismoM5 { get; set; }

    [Name("absenteismo_m6")]
    public string? AbsenteismoM6 { get; set; }
    [Name("absenteismo_m7")] public string? AbsenteismoM7 { get; set; }
    [Name("absenteismo_m8")] public string? AbsenteismoM8 { get; set; }
    [Name("absenteismo_m9")] public string? AbsenteismoM9 { get; set; }
    [Name("absenteismo_m10")] public string? AbsenteismoM10 { get; set; }
    [Name("absenteismo_m11")] public string? AbsenteismoM11 { get; set; }
    [Name("absenteismo_m12")] public string? AbsenteismoM12 { get; set; }
}