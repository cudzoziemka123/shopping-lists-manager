export class User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;

  constructor(data: {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
  }) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.createdAt = data.createdAt;
  }
}
