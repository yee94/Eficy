import { injectable } from 'tsyringe'
import type { ILifecycleManager, ILifecycleContext } from '../interfaces'

@injectable()
export default class LifecycleManager implements ILifecycleManager {
  private hooks: Map<string, Array<{ target: any; method: string }>> = new Map()

  register(phase: string, target: any, method: string): void {
    if (!this.hooks.has(phase)) {
      this.hooks.set(phase, [])
    }
    this.hooks.get(phase)!.push({ target, method })
  }

  async execute(phase: string, context: ILifecycleContext): Promise<void> {
    const phaseHooks = this.hooks.get(phase)
    if (!phaseHooks) return

    for (const hook of phaseHooks) {
      const method = hook.target[hook.method]
      if (typeof method === 'function') {
        await method.call(hook.target, context, async () => {})
      }
    }
  }

  hasHooks(phase: string): boolean {
    return this.hooks.has(phase) && (this.hooks.get(phase)?.length ?? 0) > 0
  }
} 