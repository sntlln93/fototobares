import { Icon } from '@/components/icon';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { activeItemStyles, mainNavItems } from './nav-items';

export function DesktopNav({ currentUrl }: { currentUrl: string }) {
    return (
        <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
            <NavigationMenu className="flex h-full items-stretch">
                <NavigationMenuList className="flex h-full items-stretch space-x-2">
                    {mainNavItems.map((item, index) => (
                        <NavigationMenuItem
                            key={index}
                            className="relative flex h-full items-center"
                        >
                            <Link
                                href={item.url}
                                className={cn(
                                    navigationMenuTriggerStyle(),
                                    currentUrl === item.url && activeItemStyles,
                                    'h-9 cursor-pointer px-3',
                                )}
                            >
                                {item.icon && (
                                    <Icon
                                        iconNode={item.icon}
                                        className="mr-2 h-4 w-4"
                                    />
                                )}
                                {item.title}
                            </Link>
                            {currentUrl === item.url && (
                                <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                            )}
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}
