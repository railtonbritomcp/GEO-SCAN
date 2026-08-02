import { MunicipioDefinition, Lideranca, CoordenadorRegional, Eleitor } from "../types";

export const AMAPA_MUNICIPIOS: MunicipioDefinition[] = [
  {
    nome: "Macapá",
    bairros: [
      "Centro",
      "Laguinho",
      "Trem",
      "Buritizal",
      "Zerão",
      "Fazendinha (Distrito)",
      "Coração (Distrito)",
      "São Joaquim do Pacuí (Distrito)",
      "Congós",
      "Pacoval",
      "Jardim Marco Zero",
      "Novo Horizonte",
      "Muca",
      "Alvorada",
      "Beirol",
      "Cabralzinho",
      "Marabaixo I",
      "Marabaixo II",
      "Marabaixo III",
      "Jardim Felicidade",
      "Novo Buritizal",
      "Pedrinhas",
      "Santa Rita",
      "Perpétuo Socorro",
      "Bailique (Distrito)",
      "Carapanantuba (Distrito)"
    ]
  },
  {
    nome: "Santana",
    bairros: [
      "Centro",
      "Paraíso",
      "Vila Amazonas",
      "Fonte Nova",
      "Nova Brasília",
      "Mutirão",
      "Provetec",
      "Inajá",
      "Igarapé da Fortaleza"
    ]
  },
  {
    nome: "Laranjal do Jari",
    bairros: [
      "Centro",
      "Sarney",
      "Malvinas",
      "Agreste",
      "Nazaré",
      "Samaúma"
    ]
  },
  {
    nome: "Oiapoque",
    bairros: [
      "Centro",
      "Planalto",
      "Infraero",
      "Nova Esperança",
      "Paraíso",
      "Universitário"
    ]
  },
  {
    nome: "Mazagão",
    bairros: [
      "Centro",
      "União",
      "Olaria",
      "Mazagão Velho",
      "Bela Vista"
    ]
  },
  {
    nome: "Porto Grande",
    bairros: [
      "Centro",
      "Nova Esperança",
      "Ayrton Senna",
      "Malvinas"
    ]
  },
  {
    nome: "Tartarugalzinho",
    bairros: [
      "Centro",
      "Novo Horizonte",
      "Bairro das Flores"
    ]
  },
  {
    nome: "Vitória do Jari",
    bairros: [
      "Centro",
      "Vila Santa Maria",
      "Vila de Beiradão"
    ]
  },
  {
    nome: "Pedra Branca do Amapari",
    bairros: [
      "Centro",
      "Amapari",
      "Guanabara",
      "Nova Vida"
    ]
  },
  {
    nome: "Amapá",
    bairros: [
      "Centro",
      "Piraçu",
      "Setor Comercial"
    ]
  },
  {
    nome: "Calçoene",
    bairros: [
      "Centro",
      "Vila do Cabo Orange",
      "Liberdade"
    ]
  },
  {
    nome: "Ferreira Gomes",
    bairros: [
      "Centro",
      "Porto do Sol",
      "Bela Vista"
    ]
  },
  {
    nome: "Cutias",
    bairros: [
      "Centro",
      "Distrito de Cutias",
      "Bairro Novo"
    ]
  },
  {
    nome: "Itaubal",
    bairros: [
      "Centro",
      "Itaubalinho",
      "Carmo"
    ]
  },
  {
    nome: "Serra do Navio",
    bairros: [
      "Centro",
      "Vila Staff",
      "Vila Primária",
      "Vila Intermediária"
    ]
  },
  {
    nome: "Pracuúba",
    bairros: [
      "Centro",
      "Pracuúbinha",
      "Bairro Novo"
    ]
  }
];

export const INITIAL_COORDENADORES: CoordenadorRegional[] = [
  {
    id: "coord-1",
    nome: "Dra. Eliana Melo",
    municipio: "Macapá",
    telefone: "(96) 99188-1212",
    createdAt: "2026-05-01T08:00:00Z"
  },
  {
    id: "coord-2",
    nome: "Raimundo Abreu",
    municipio: "Santana",
    telefone: "(96) 98111-2323",
    createdAt: "2026-05-02T10:00:00Z"
  },
  {
    id: "coord-3",
    nome: "Hamilton Gurgel",
    municipio: "Laranjal do Jari",
    telefone: "(96) 99122-4545",
    createdAt: "2026-05-03T11:30:00Z"
  },
  {
    id: "coord-4",
    nome: "Wellington Cabral",
    municipio: "Oiapoque",
    telefone: "(96) 99245-7878",
    createdAt: "2026-05-04T09:00:00Z"
  }
];

export const INITIAL_LIDERANCAS: Lideranca[] = [
  {
    id: "lid-1",
    nome: "Tenente Silva",
    municipio: "Macapá",
    bairro: "Laguinho",
    metaMacro: 500,
    calculoMeta: "lider",
    telefone: "(96) 99112-3456",
    coordenadorRegionalId: "coord-1",
    createdAt: "2026-05-10T10:00:00Z"
  },
  {
    id: "lid-2",
    nome: "Professora Maria",
    municipio: "Macapá",
    bairro: "Trem",
    metaMacro: 300,
    calculoMeta: "lider",
    telefone: "(96) 99144-8899",
    coordenadorRegionalId: "coord-1",
    createdAt: "2026-05-12T14:30:00Z"
  },
  {
    id: "lid-3",
    nome: "Dona Joana",
    municipio: "Santana",
    bairro: "Paraíso",
    metaMacro: 400,
    calculoMeta: "lider",
    telefone: "(96) 98122-4455",
    coordenadorRegionalId: "coord-2",
    createdAt: "2026-05-15T09:15:00Z"
  },
  {
    id: "lid-4",
    nome: "Pastor Carlos",
    municipio: "Santana",
    bairro: "Vila Amazonas",
    metaMacro: 250,
    calculoMeta: "lider",
    telefone: "(96) 98801-1122",
    coordenadorRegionalId: "coord-2",
    createdAt: "2026-05-16T11:00:00Z"
  },
  {
    id: "lid-5",
    nome: "Dr. Robson",
    municipio: "Laranjal do Jari",
    bairro: "Agreste",
    metaMacro: 600,
    calculoMeta: "lider",
    telefone: "(96) 99177-3344",
    coordenadorRegionalId: "coord-3",
    createdAt: "2026-05-18T16:45:00Z"
  },
  {
    id: "lid-6",
    nome: "Cabo Amarante",
    municipio: "Oiapoque",
    bairro: "Nova Esperança",
    metaMacro: 200,
    calculoMeta: "lider",
    telefone: "(96) 99201-9988",
    coordenadorRegionalId: "coord-4",
    createdAt: "2026-05-20T08:20:00Z"
  }
];

export const INITIAL_ELEITORES: Eleitor[] = [
  {
    id: "el-1",
    liderancaId: "lid-1",
    nome: "João Batista",
    telefone: "(96) 99123-1001",
    zonaEleitoral: "10ª Zona - Macapá",
    createdAt: "2026-05-20T10:00:00Z"
  },
  {
    id: "el-2",
    liderancaId: "lid-1",
    nome: "Maria das Graças",
    telefone: "(96) 99123-1002",
    zonaEleitoral: "10ª Zona - Macapá",
    createdAt: "2026-05-20T11:00:00Z"
  },
  {
    id: "el-3",
    liderancaId: "lid-2",
    nome: "Pedro Alves",
    telefone: "(96) 99123-1003",
    zonaEleitoral: "2ª Zona - Macapá",
    createdAt: "2026-05-21T09:30:00Z"
  }
];
