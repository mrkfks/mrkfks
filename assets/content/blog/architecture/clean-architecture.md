# Clean Architecture in Angular

Clean Architecture is more than a design pattern—it's a philosophy for building maintainable, testable, and scalable applications.

## Core Principles

### 1. **Separation of Concerns**
Each layer should have a single responsibility:
- **Presentation Layer:** Components, routing, UI logic
- **Domain Layer:** Business logic, entities, interfaces
- **Data Layer:** Services, repositories, API calls

### 2. **Dependency Inversion**
High-level modules should not depend on low-level modules. Both should depend on abstractions.

\`\`\`typescript
// ❌ Bad: Direct dependency on HttpClient
export class UserService {
  constructor(private http: HttpClient) {}
}

// ✅ Good: Depend on abstraction
export interface UserRepository {
  getUsers(): Observable<User[]>;
}

@Injectable()
export class UserService {
  constructor(private repo: UserRepository) {}
}
\`\`\`

### 3. **Testability**
Code should be easily testable with minimal mocking.

## Project Structure Example

\`\`\`
src/
├── app/
│   ├── core/                 # Singleton services, guards
│   ├── shared/              # Reusable components & directives
│   ├── features/            # Feature modules
│   │   ├── user/
│   │   │   ├── data/       # Services, repositories
│   │   │   ├── domain/     # Models, interfaces
│   │   │   └── ui/         # Components
│   └── config/             # Configuration
├── assets/
└── styles/
\`\`\`

## Benefits

✅ **Maintainability:** Clear structure makes code easier to understand  
✅ **Scalability:** Easy to add new features without breaking existing code  
✅ **Testability:** Isolated concerns are easier to unit test  
✅ **Reusability:** Shared components and services across features  

---

*Learn more in [Uncle Bob's Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)*
