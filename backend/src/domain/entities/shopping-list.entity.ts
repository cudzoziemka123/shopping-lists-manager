export class ShoppingList {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    title: string;
    description: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.ownerId = data.ownerId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
