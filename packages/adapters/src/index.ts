import { AdapterRegistry } from '../../shared/src';
import { AxiosAdapter } from './http/AxiosAdapter';
import { ExpressAdapter } from './frameworks/ExpressAdapter';
import { EnvAdapter } from './core/EnvAdapter';
import { DefaultControllerAdapter } from './frameworks/DefaultControllerAdapter';
import { VanillaHttpAdapter } from './frameworks/VanillaHttpAdapter';
import { TypeORMEntityAdapter } from './db/TypeORMEntityAdapter';
import { TypeORMRepositoryAdapter } from './db/TypeORMRepositoryAdapter';

export function bootstrapAdapters() {
    // Core & Env
    AdapterRegistry.registerStatementAdapter(new EnvAdapter());
    
    // HTTP & DB Clients
    AdapterRegistry.registerStatementAdapter(new AxiosAdapter());
    AdapterRegistry.registerStatementAdapter(new TypeORMRepositoryAdapter());
    
    // Frameworks & Routes
    AdapterRegistry.registerStatementAdapter(new ExpressAdapter());
    AdapterRegistry.registerControllerAdapter(new DefaultControllerAdapter());
    AdapterRegistry.registerControllerAdapter(new VanillaHttpAdapter());
    AdapterRegistry.registerControllerAdapter(new TypeORMEntityAdapter() as any);
    
    console.log('[Bootstrap] Adapters reorganized and registered: HTTP, Frameworks, Core, Vanilla, TypeORM');
}

export * from './http/AxiosAdapter';
export * from './frameworks/ExpressAdapter';
export * from './core/EnvAdapter';
export * from './frameworks/DefaultControllerAdapter';
export * from './frameworks/VanillaHttpAdapter';
