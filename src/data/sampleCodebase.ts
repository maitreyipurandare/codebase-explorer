import type { Codebase } from "../types/Codebase";

export const sampleCodebase: Codebase = {
  files: [
    {
      id: "app",
      name: "App.ts",
      path: "src/App.ts",
      language: "TypeScript",
      code: `import { Login } from './Login';

        const login = new Login();
        
        console.log('Application started');`,
    },
    {
      id: "login",
      name: "Login.ts",
      path: "src/Login.ts",
      language: "TypeScript",
      code: `import { UserService } from './UserService';
      export class Login {
      constructor(private userService: UserService) {}
      login(username: string, password: string) {
      return this.userService.authenticate(username, password);
      }}`,
    },
    {
      id: "user-service",
      name: "UserService.ts",
      path: "src/UserService.ts",
      language: "TypeScript",
      code: `import { Database } from './Database';
      export class UserService {
      constructor(private database: Database) {}

      authenticate(username: string, password: string) {
      return this.database.findUser(username, password);
      }}`,
    },
    {
      id: "database",
      name: "Database.ts",
      path: "src/Database.ts",
      language: "TypeScript",
      code: `export class Database {
          findUser(username: string, password: string) {
            // Look up the user in the database
            return {
              username,
              authenticated: true,
            };
          }
        }`,
    },
    {
      id: "auth",
      name: "Auth.ts",
      path: "src/Auth.ts",
      language: "TypeScript",
      code: `export class Auth {
        isAuthenticated = false;
      
        login() {
          this.isAuthenticated = true;
        }
      
        logout() {
          this.isAuthenticated = false;
        }
      }`,
    },
  ],

  relationships: [
    {
      source: "login",
      target: "user-service",
      type: "imports",
    },
    {
      source: "user-service",
      target: "database",
      type: "imports",
    },
  ],
};
