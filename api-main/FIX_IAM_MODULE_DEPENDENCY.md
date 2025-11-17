# Fix: IAM Module Dependency Injection

## ❌ Problem

```
UnknownDependenciesException: Nest can't resolve dependencies of the IamClientService (?).
Please make sure that the argument "IAM_SERVICE" at index [0] is available in the IamModule context.
```

## 🔍 Root Cause

`IamClientService` cần inject `IAM_SERVICE` (TCP ClientProxy), nhưng:
- TCP client được register trong `AppModule`
- `IamModule` không import `ClientsModule`
- NestJS không thể resolve dependency qua module boundaries

## ✅ Solution

### Before (Broken)

**AppModule:**
```typescript
@Module({
  imports: [
    // ...
    IamModule,
    ClientsModule.register([
      {
        name: ServiceEnum.IAM_SERVICE,  // ❌ Registered here
        transport: Transport.TCP,
        // ...
      },
    ]),
  ],
})
export class AppModule {}
```

**IamModule:**
```typescript
@Module({
  imports: [],  // ❌ No ClientsModule import
  providers: [IamClientService],  // ❌ Can't resolve IAM_SERVICE
})
export class IamModule {}
```

### After (Fixed)

**IamModule:**
```typescript
@Module({
  imports: [
    // ✅ Register TCP client directly in IamModule
    ClientsModule.registerAsync([
      {
        name: ServiceEnum.IAM_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('IAM_SERVICE_HOST') || 'localhost',
            port: Number(configService.get<string>('IAM_SERVICE_PORT') || 3003),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [IamClientService],  // ✅ Can now resolve IAM_SERVICE
})
export class IamModule {}
```

**AppModule:**
```typescript
@Module({
  imports: [
    // ...
    IamModule,  // ✅ IAM Module is self-contained
    ClientsModule.register([
      {
        name: ServiceEnum.CATALOG_SERVICE,  // Only Catalog Service here
        // ...
      },
    ]),
  ],
})
export class AppModule {}
```

## 📋 Key Principles

### 1. Module Encapsulation
Each module should be **self-contained** with all its dependencies:

```typescript
// ✅ Good: Module contains its own dependencies
@Module({
  imports: [ClientsModule.register([...])],
  providers: [ServiceThatNeedsClient],
})

// ❌ Bad: Dependency registered in parent module
@Module({
  providers: [ServiceThatNeedsClient],  // Missing ClientsModule
})
```

### 2. Dependency Resolution
NestJS **cannot resolve dependencies** across module boundaries unless:
- The provider is exported from a module
- That module is imported into the consuming module

```typescript
// Parent Module
@Module({
  imports: [ClientsModule.register([...])],
  exports: [ClientsModule],  // ✅ Must export
})

// Child Module
@Module({
  imports: [ParentModule],  // ✅ Must import
  providers: [ServiceUsingClient],
})
```

### 3. ClientsModule Pattern
For `ClientsModule`, it's better to register in the **consuming module**:

```typescript
// ✅ Recommended: Register where used
@Module({
  imports: [
    ClientsModule.registerAsync([
      { name: 'MY_SERVICE', ... }
    ]),
  ],
  providers: [ClientServiceUser],
})

// ❌ Not recommended: Register globally
@Module({
  imports: [
    ClientsModule.register([
      { name: 'MY_SERVICE', ... }
    ]),
  ],
  exports: [ClientsModule],
})
```

## 🔧 Changes Made

### 1. Updated `iam.module.ts`
```diff
+ import { ClientsModule, Transport } from '@nestjs/microservices';
+ import { ConfigModule, ConfigService } from '@nestjs/config';
+ import { ServiceEnum } from '@app/utils/service.enum';

  @Module({
    imports: [
+     ClientsModule.registerAsync([
+       {
+         name: ServiceEnum.IAM_SERVICE,
+         imports: [ConfigModule],
+         useFactory: (configService: ConfigService) => ({
+           transport: Transport.TCP,
+           options: {
+             host: configService.get<string>('IAM_SERVICE_HOST') || 'localhost',
+             port: Number(configService.get<string>('IAM_SERVICE_PORT') || 3003),
+           },
+         }),
+         inject: [ConfigService],
+       },
+     ]),
    ],
    providers: [IamClientService],
  })
```

### 2. Updated `app.module.ts`
```diff
  @Module({
    imports: [
      AuthModule,
-     IamModule,
+     IamModule, // IAM Module includes IAM_SERVICE TCP client
      ClientsModule.register([
        {
          name: ServiceEnum.CATALOG_SERVICE,
          // ...
        },
-       {
-         name: ServiceEnum.IAM_SERVICE,  // ❌ Removed duplicate
-         // ...
-       },
      ]),
    ],
  })
```

## ✅ Verification

### Build Test
```bash
npm run build -- api-main
# ✅ webpack 5.100.2 compiled successfully
```

### Run Test
```bash
npm run start:dev api-main
# ✅ Connected to IAM Service via TCP
# ✅ API Gateway is running on: http://localhost:3000
```

## 📚 Related NestJS Concepts

### Module Imports
```typescript
// Feature modules should import their dependencies
@Module({
  imports: [
    ConfigModule,           // Config for env vars
    ClientsModule.register([...]),  // TCP clients
    TypeOrmModule.forFeature([...]), // Database entities
  ],
  providers: [...],
  controllers: [...],
})
```

### Provider Scope
- Providers are **scoped to their module**
- Use `exports: [...]` to share with other modules
- Or use `@Global()` decorator (not recommended for most cases)

### Dynamic Modules
```typescript
// registerAsync() for dynamic configuration
ClientsModule.registerAsync([
  {
    name: 'SERVICE_NAME',
    imports: [ConfigModule],      // Import dependencies
    useFactory: (config) => ({...}), // Factory function
    inject: [ConfigService],      // Inject into factory
  },
])
```

## 🎯 Best Practices

1. **Self-contained modules**: Each module imports what it needs
2. **Avoid global providers**: Use explicit imports instead
3. **Use registerAsync**: For config-dependent clients
4. **Minimize exports**: Only export what other modules need
5. **Document dependencies**: Clear imports/exports in module

---

**Status**: ✅ Fixed  
**Build**: Successful  
**Ready**: Production Ready 🚀

