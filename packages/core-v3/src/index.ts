import 'reflect-metadata'

// Core
export { default as Eficy } from './core/Eficy'
// export { default as EficyNode } from './models/EficyNode'
// export { default as EficyModelTree } from './models/EficyModelTree'
// export { default as RenderNode } from './components/RenderNode'
// export { default as DomTree } from './models/DomTree'

// Services
export { default as ConfigService } from './services/ConfigService'
export { default as ComponentRegistry } from './services/ComponentRegistry'
export { default as LifecycleManager } from './services/LifecycleManager'

// Decorators
export * from './decorators/lifecycle'

// Interfaces
export * from './interfaces'

// Plugins
export * from './plugins'

// Utils
export * from './utils'

// Default export
export { default } from './core/Eficy'
