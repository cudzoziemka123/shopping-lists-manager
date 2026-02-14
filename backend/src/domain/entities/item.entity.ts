export enum ItemStatus {
  PENDING = 'pending',
  PURCHASED = 'purchased',
}

export enum ItemPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class Item {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  unit: string | null;
  status: ItemStatus;
  priority: ItemPriority;
  addedById: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    listId: string;
    name: string;
    quantity: number;
    unit: string | null;
    status: ItemStatus;
    priority: ItemPriority;
    addedById: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.listId = data.listId;
    this.name = data.name;
    this.quantity = data.quantity;
    this.unit = data.unit;
    this.status = data.status;
    this.priority = data.priority;
    this.addedById = data.addedById;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
