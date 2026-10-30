import { useEffect, useState, type ComponentType } from 'react';

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

function resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | undefined {
  const functions = Object.values(mod).filter(
    (value) => typeof value === 'function',
  ) as ComponentType[];
  return (
    (mod.default as ComponentType) ||
    (mod.Preview as ComponentType) ||
    (mod[name] as ComponentType) ||
    functions[functions.length - 1]
  );
}

export default function ComponentPreviewPage({
  componentPath,
  modules,
}: {
  componentPath: string;
  modules: ModuleMap;
}) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setComponent(null);
    setError(null);

    async function loadComponent(): Promise<void> {
      const key = `./components/mockups/${componentPath}.tsx`;
      const loader = modules[key];
      if (!loader) {
        setError(`No component found at ${componentPath}.tsx`);
        return;
      }

      try {
        const mod = await loader();
        if (cancelled) return;
        const name = componentPath.split('/').pop()!;
        const component = resolveComponent(mod, name);
        if (!component) {
          setError(
            `No exported React component found in ${componentPath}.tsx\n\nMake sure the file has at least one exported function component.`,
          );
          return;
        }
        setComponent(() => component);
      } catch (exception) {
        if (cancelled) return;
        const message =
          exception instanceof Error ? exception.message : String(exception);
        setError(`Failed to load preview.\n${message}`);
      }
    }

    void loadComponent();
    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);

  if (error) {
    return (
      <pre style={{ color: 'red', padding: '2rem', fontFamily: 'system-ui' }}>
        {error}
      </pre>
    );
  }

  if (!Component) return null;
  return <Component />;
}
