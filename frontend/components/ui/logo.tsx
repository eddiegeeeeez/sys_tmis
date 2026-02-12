import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    width?: number;
    height?: number;
    light?: boolean;
    unoptimized?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
    className,
    width = 40,
    height = 40,
    light = false,
    unoptimized = false
}) => {
    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            <Image
                src="/logo.png"
                alt="TradeMatrix Logo"
                width={width}
                height={height}
                className="object-contain"
                priority
                unoptimized={unoptimized}
            />
        </div>
    );
};
