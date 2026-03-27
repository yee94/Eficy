# @eficy/shadcn-ui

shadcn/ui component library for Eficy. Next.js app that exports Radix-based components.

## STRUCTURE

```
├── components/ui/     # 46 shadcn/ui components
├── app/               # Next.js app (for dev/preview)
├── lib/               # Utilities (cn, utils)
└── dist/              # Built component exports
```

## WHERE TO LOOK

| Task              | Location             | Notes                       |
| ----------------- | -------------------- | --------------------------- |
| All UI components | `components/ui/`     | Button, Dialog, Table, etc. |
| Style utilities   | `lib/utils.ts`       | `cn()` for class merging    |
| Tailwind config   | `tailwind.config.ts` | Theme customization         |

## CONVENTIONS

### Component Pattern

- All components use Radix UI primitives
- Styling via Tailwind CSS v4 + `class-variance-authority`
- `cn()` helper for conditional classes

### Adding Components

```bash
# From shadcn/ui CLI or manual copy
# Components go in components/ui/
# Export from index if needed
```

### Class Naming

```tsx
import { cn } from '@/lib/utils';

const Component = ({ className, ...props }) => <div className={cn('base-classes', className)} {...props} />;
```

## NOTES

- This is a **Next.js 15** app (not just a library)
- Uses Tailwind CSS v4 (not v3)
- Exports are built via rslib
- 46 components: Accordion → Tooltip
