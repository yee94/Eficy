// 生命周期装饰器占位实现

export function Init(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  // 占位实现
  console.log('Init decorator registered:', target.constructor.name, propertyKey)
}

export function BuildViewNode(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  // 占位实现
  console.log('BuildViewNode decorator registered:', target.constructor.name, propertyKey)
} 