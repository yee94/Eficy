  /**
   * 解析ViewNode为React元素
   */
  private resolveToElement(viewNode: ViewNode): ReactElement {
    const resolverService = this.childContainer.resolve(TOKENS.RESOLVER_SERVICE);
    return resolverService.resolve(viewNode);
  } 