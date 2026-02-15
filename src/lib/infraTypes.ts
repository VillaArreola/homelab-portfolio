export type InfraItem = {
  id: string;
  name: string;
  type: string;
  parent?: string;
  layer?: string;
  network?: string;
  purpose?: string;
  runtime?: string;
};

export type InfraTreeNode = InfraItem & {
  children: InfraTreeNode[];
};
