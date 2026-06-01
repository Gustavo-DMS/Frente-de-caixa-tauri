type Produtos = {
  SKU: string;
  nome: string;
  preco: GLfloat;
};

type Vendas = {
  id: number;
  data_venda: String;
  desconto: GLfloat;
  valor_total: GLfloat;
  valor_desconto: GLfloat;
};

type ItensVenda = {
  id: number;
  venda_id: number;
  produto_sku: string;
  quantidade: number;
};

type Onboarding = {
  id: number;
  step: number;
  completed: boolean;
};
