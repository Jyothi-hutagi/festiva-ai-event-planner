import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "inline-flex min-h-11 shrink-0 items-center justify-center rounded-[4px] border border-transparent px-4 text-center text-base font-semibold select-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-pressed",
        outline: "border-border bg-background text-foreground",
        secondary: "border-border bg-background text-foreground",
        ghost: "bg-transparent text-foreground",
        destructive: "bg-destructive text-white",
        link: "min-h-11 text-foreground underline underline-offset-4",
      },
      size: {
        default: "",
        xs: "",
        sm: "",
        lg: "",
        icon: "size-11 px-0",
        "icon-xs": "size-11 px-0",
        "icon-sm": "size-11 px-0",
        "icon-lg": "size-11 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, className }),
        "print:hidden",
      )}
      {...props}
    />
  );
}

export { Button };
