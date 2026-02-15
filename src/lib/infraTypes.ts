export type InfraItem = {
  id: string;
  name: string;
  type: string;
  parent?: string;
  layer?: string;
  network?: string;
  purpose?: string;
  runtime?: string;
  ip?: string;
  dns?: string;
  port?: string | number;
  url?: string;
};

export type InfraTreeNode = InfraItem & {
  children: InfraTreeNode[];
};
