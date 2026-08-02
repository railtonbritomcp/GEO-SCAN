/**
 * GEO SCAN | Inteligência Territorial - Types
 * State-managed cascade model for electoral monitoring in Amapá
 */

export interface CandidateInfo {
  adminCoordinatorName: string;
  candidateName: string;
  ballotNumber: string;
  activationCode: string;
}

export interface UserSession {
  email: string;
}

export interface Lideranca {
  id: string;
  nome: string;
  ocupacao?: string; // e.g. "Presidente", "Líder de associação", "Líder de comunidade", etc.
  municipio: string;
  bairro: string;
  metaMacro: number; // Macro goal (Target votes)
  calculoMeta: "lider" | "eleitor"; // Option to set goal by "lider" (manual input) or "eleitor" (sum of voters)
  telefone?: string;
  createdAt: string;
  coordenadorRegionalId?: string; // Linked Coordenador Regional
}

export interface CoordenadorRegional {
  id: string;
  nome: string;
  municipio: string;
  bairro?: string;
  telefone?: string;
  metaVotos?: number;
  createdAt: string;
}

export interface Eleitor {
  id: string;
  liderancaId: string; // Linked lideranca
  nome: string;
  telefone?: string;
  zonaEleitoral?: string;
  createdAt: string;
}

// Hierarchical cascade definitions for Amapá
export interface BairroDefinition {
  nome: string;
}

export interface MunicipioDefinition {
  nome: string;
  bairros: string[];
  metaVotos?: number;
}
