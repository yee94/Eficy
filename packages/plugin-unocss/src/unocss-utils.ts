import type { UnoGenerator, UserConfig } from '@unocss/core';

let cachedGenerator: UnoGenerator | null = null;
let cachedConfig: UserConfig | null = null;

export async function createUnocssGenerator(config?: UserConfig): Promise<UnoGenerator> {
  if (cachedGenerator && cachedConfig === config) {
    return cachedGenerator;
  }

  const { createGenerator } = await import('@unocss/core');
  const { presetUno } = await import('@unocss/preset-uno');
  const { presetAttributify } = await import('@unocss/preset-attributify');

  const userConfig: UserConfig = {
    presets: [
      presetUno({
        preflight: false,
      }),
      presetAttributify(),
    ],
    ...config,
  };

  cachedGenerator = await createGenerator(userConfig);
  cachedConfig = config ?? null;

  return cachedGenerator;
}

export function extractClassNames(code: string): Set<string> {
  const classes = new Set<string>();

  const patterns = [
    /className\s*=\s*"([^"]+)"/g,
    /className\s*=\s*'([^']+)'/g,
    /className\s*=\s*\{`([^`]+)`\}/g,
    /className\s*=\s*\{`([^$`]+)/g,
    /\bclass\s*=\s*"([^"]+)"/g,
    /\bclass\s*=\s*'([^']+)'/g,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null = pattern.exec(code);
    while (match !== null) {
      const classString = match[1];
      const individualClasses = classString.split(/\s+/).filter(Boolean);
      individualClasses.forEach((cls) => {
        if (!cls.includes('${') && !cls.startsWith('$')) {
          classes.add(cls);
        }
      });
      match = pattern.exec(code);
    }
  }

  return classes;
}

export async function generateCSS(classes: Set<string> | string[], generator?: UnoGenerator): Promise<string> {
  const gen = generator ?? (await createUnocssGenerator());
  const classArray = Array.isArray(classes) ? classes : Array.from(classes);

  if (classArray.length === 0) {
    return '';
  }

  const result = await gen.generate(classArray.join(' '));
  return result.css || '';
}

export async function extractAndGenerateCSS(
  code: string,
  config?: UserConfig,
): Promise<{
  classes: string[];
  css: string;
}> {
  const classes = extractClassNames(code);
  const generator = await createUnocssGenerator(config);
  const css = await generateCSS(classes, generator);

  return {
    classes: Array.from(classes),
    css,
  };
}

export function resetGenerator(): void {
  cachedGenerator = null;
  cachedConfig = null;
}
