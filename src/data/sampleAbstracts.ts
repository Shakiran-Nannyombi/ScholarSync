export interface SampleAbstract {
  id: string;
  title: string;
  field: string;
  authors: string;
  year: number;
  journal: string;
  doi: string;
  abstract: string;
}

export const SAMPLE_ABSTRACTS: SampleAbstract[] = [
  {
    id: "transformer-attention",
    title: "Attention Is All You Need",
    field: "Computer Science · Machine Learning",
    authors: "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I.",
    year: 2017,
    journal: "Advances in Neural Information Processing Systems (NeurIPS 30)",
    doi: "10.48550/arXiv.1706.03762",
    abstract: `The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs, a small fraction of the training costs of the best models from the literature. We show that the Transformer generalizes well to other tasks by applying it successfully to English constituency parsing both with large and limited training data.`
  },
  {
    id: "quantum-surface-codes",
    title: "Suppressing Quantum Errors by Scaling a Quantum Logical Qubit",
    field: "Quantum Physics · Hardware Architecture",
    authors: "Google Quantum AI & Collaborators",
    year: 2023,
    journal: "Nature, 614(7949), 676-681",
    doi: "10.1038/s41586-022-05434-1",
    abstract: `Practical quantum computing will require error rates that are substantially lower than those achievable with physical qubits. Quantum error correction promises to bridge this gap by encoding quantum information across multiple physical qubits to form a logical qubit. Here we demonstrate a superconducting quantum processor that implements surface code error correction, crossing the threshold where scaling the code distance from distance-3 (17 physical qubits) to distance-5 (49 physical qubits) suppresses the logical error per cycle from 3.02% to 2.91%. This represents an experimental realization of quantum error suppression via spatial scaling, demonstrating that scaling hardware beyond a critical fault-tolerance threshold can systematically overcome physical gate imperfections in multi-qubit systems.`
  },
  {
    id: "crispr-epigenome",
    title: "Programmable Epigenome Editing with dCas9 Conjugates for Stable Gene Repression",
    field: "Biomedical Engineering · Molecular Genetics",
    authors: "Chen, M. R., Sterling, J. T., Vance, K. E., & Nakamura, H.",
    year: 2024,
    journal: "Cell Chemical Biology, 31(4), 512-526",
    doi: "10.1016/j.chembiol.2024.01.008",
    abstract: `Targeted transcriptional modulation without inducing double-stranded DNA breaks remains a foundational objective in therapeutic genome engineering. We report the development of EpiSync-9, a catalytically deactivated Cas9 (dCas9) engineered with a tripartite DNA methyltransferase (DNMT3A-DNMT3L) and histone deacetylase (HDAC1) complex. Across 14 human primary cell lines, EpiSync-9 achieved targeted hypermethylation at gene promoter CpG islands with >94% locus-specific efficiency and undetectable off-target methylation via whole-genome bisulfite sequencing. Repressed target gene silencing persisted through >45 mitotic divisions without continuous transgene expression, establishing a durable epigenetic memory mechanism suitable for non-cleaving genetic interventions.`
  },
  {
    id: "carbon-border-economics",
    title: "Macroeconomic Incidence and Leakage Dynamics of Cross-Border Carbon Adjustments",
    field: "Environmental Economics · Global Trade",
    authors: "Lindqvist, E., Bauer, F., & Al-Hassan, T.",
    year: 2024,
    journal: "Journal of Environmental Economics and Management, 122, 102890",
    doi: "10.1016/j.jeem.2024.102890",
    abstract: `Unilateral carbon pricing mechanisms are structurally vulnerable to carbon leakage, wherein emissions-intensive manufacturing shifts toward unregulated jurisdictions. We construct an empirical multi-region dynamic stochastic general equilibrium (DSGE) model calibrated with OECD inter-country input-output data spanning 2010–2023 to evaluate the welfare and leakage mitigation effects of Border Carbon Adjustments (BCAs). Our findings indicate that full embodied-emissions BCAs suppress carbon leakage rates from 26.4% to under 4.1%, while preserving domestic industrial competitiveness in primary metals and chemicals. However, unilateral implementation imposes asymmetric terms-of-trade degradation on developing exporter economies, reducing their real GDP by 0.72% unless revenues are recycled into decarbonization technology transfer mechanisms.`
  }
];
