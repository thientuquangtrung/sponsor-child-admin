import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, startIcon, endIcon, ...props }, ref) => {
    return (
        <div
            className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3.5 py-2 text-sm",
                className,
            )}
        >
            {startIcon &&
                React.cloneElement(startIcon, {
                    className: cn(
                        "flex h-full shrink-0 items-center justify-center text-muted-foreground mr-1",
                        startIcon.props.className,
                    ),
                })}
            <input
                type={type}
                className={cn(
                    "flex-1 min-w-0 rounded-none bg-transparent ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ",
                    startIcon && "rounded-l-md",
                    endIcon && "rounded-r-md",
                )}
                ref={ref}
                {...props}
            />
            {endIcon &&
                React.cloneElement(endIcon, {
                    className: cn(
                        "flex h-full shrink-0 items-center justify-center text-muted-foreground ml-1",
                        endIcon.props.className,
                    ),
                })}
        </div>
    );
});
Input.displayName = "Input";

export { Input };
