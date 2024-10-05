import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Icons } from '@/components/icons';
import { appConfig } from '@/config/app';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mainMenu } from '@/config/menu';
import { ChevronDownIcon, ViewVerticalIcon } from '@radix-ui/react-icons';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Logo } from '../logo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ModeToggle } from '@/components/common/ModeToggle';
import { useDispatch, useSelector } from 'react-redux';
import { LogoutUser } from '@/redux/auth/authActionCreators';
import { useLogoutMutation } from '@/redux/auth/authApi';
import SearchIcon from '@/assets/icons/SearchIcon';
import { Input } from '@/components/ui/input';

export function Header() {
    const [logout] = useLogoutMutation();
    const { user, refreshToken } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        logout({ refreshToken });
        dispatch(LogoutUser());
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    return (
        <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b">
            <div className="container px-4 md:px-8 flex h-14 items-center">
                {/* Desktop View */}
                <div className="mr-4 hidden md:flex">
                    <NavLink to="/" className="mr-6 flex items-center">
                        <Logo />
                    </NavLink>
                    <div className="flex items-center space-x-6 text-sm font-medium">
                        {mainMenu.map((menu, index) =>
                            menu.items !== undefined ? (
                                <DropdownMenu key={index}>
                                    <DropdownMenuTrigger
                                        className={cn(
                                            'flex items-center py-1 focus:outline-none text-sm font-medium transition-colors hover:text-primary',
                                            menu.items
                                                .filter((subitem) => subitem.to !== undefined)
                                                .map((subitem) => subitem.to)
                                                .includes(location.pathname)
                                                ? 'text-foreground'
                                                : 'text-foreground/60',
                                        )}
                                    >
                                        {menu.title}
                                        <ChevronDownIcon className="ml-1 -mr-1 h-3 w-3 text-muted-foreground" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-48" align="start" forceMount>
                                        {menu.items.map((subitem, subindex) =>
                                            subitem.to !== undefined ? (
                                                <NavLink key={subindex} to={subitem.to}>
                                                    <DropdownMenuItem
                                                        className={cn('hover:cursor-pointer', {
                                                            'bg-muted': subitem.to === location.pathname,
                                                        })}
                                                    >
                                                        {subitem.title}
                                                    </DropdownMenuItem>
                                                </NavLink>
                                            ) : subitem.label ? (
                                                <DropdownMenuLabel key={subindex}>{subitem.title}</DropdownMenuLabel>
                                            ) : (
                                                <DropdownMenuSeparator key={subindex} />
                                            ),
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <NavLink
                                    key={index}
                                    to={menu.to ?? ''}
                                    className={({ isActive }) =>
                                        cn(
                                            'text-xl font-medium transition-colors hover:text-foreground pl-14',
                                            isActive ? '!text-primary' : 'text-foreground/60',
                                        )
                                    }
                                >
                                    {menu.title}
                                </NavLink>
                            ),
                        )}
                    </div>
                    <div className="flex items-center space-x-4 ml-24 ">
                        <Input
                            placeholder="Tìm kiếm tên chiến dịch ..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="max-w-sm"
                            endIcon={<SearchIcon />}
                        />
                    </div>
                </div>

                {/* mobile */}
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            className="mr-4 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                        >
                            <ViewVerticalIcon className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="pr-0 sm:max-w-xs">
                        <NavLink to="/" onClick={() => setOpen(false)} className="flex items-center space-x-2">
                            <Logo />
                        </NavLink>
                        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-8 pl-8">
                            <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                                defaultValue={
                                    'item-' +
                                    mainMenu.findIndex((item) =>
                                        item.items !== undefined
                                            ? item.items
                                                .filter((subitem) => subitem.to !== undefined)
                                                .map((subitem) => subitem.to)
                                                .includes(location.pathname)
                                            : false,
                                    )
                                }
                            >
                                <div className="flex flex-col space-y-3">
                                    {mainMenu.map((menu, index) =>
                                        menu.items !== undefined ? (
                                            <AccordionItem
                                                key={index}
                                                value={`item-${index}`}
                                                className="border-b-0 pr-6"
                                            >
                                                <AccordionTrigger
                                                    className={cn(
                                                        'py-1 hover:no-underline hover:text-primary [&[data-state=open]]:text-primary',
                                                        menu.items
                                                            .filter((subitem) => subitem.to !== undefined)
                                                            .map((subitem) => subitem.to)
                                                            .includes(location.pathname)
                                                            ? 'text-foreground'
                                                            : 'text-foreground/60',
                                                    )}
                                                >
                                                    <div className="flex">{menu.title}</div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pb-1 pl-4">
                                                    <div className="mt-1">
                                                        {menu.items.map((submenu, subindex) =>
                                                            submenu.to !== undefined ? (
                                                                <NavLink
                                                                    key={subindex}
                                                                    to={submenu.to}
                                                                    onClick={() => setOpen(false)}
                                                                    className={({ isActive }) =>
                                                                        cn(
                                                                            'block justify-start py-1 h-auto font-normal hover:text-primary',
                                                                            isActive
                                                                                ? 'text-foreground'
                                                                                : 'text-foreground/60',
                                                                        )
                                                                    }
                                                                >
                                                                    {submenu.title}
                                                                </NavLink>
                                                            ) : submenu.label !== '' ? null : (
                                                                <div className="px-3">{/* <Separator /> */}</div>
                                                            ),
                                                        )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ) : (
                                            <NavLink
                                                key={index}
                                                to={menu.to ?? ''}
                                                onClick={() => setOpen(false)}
                                                className={({ isActive }) =>
                                                    cn(
                                                        'py-1 text-sm font-medium transition-colors hover:text-foreground',
                                                        isActive ? 'text-primary' : 'text-foreground/60',
                                                    )
                                                }
                                            >
                                                {menu.title}
                                            </NavLink>
                                        ),
                                    )}
                                </div>
                            </Accordion>
                        </ScrollArea>
                    </SheetContent>
                </Sheet>

                <a href="/" className="mr-6 flex items-center space-x-2 md:hidden">
                    <Icons.logo className="h-6 w-6" />
                    <span className="font-bold inline-block">{appConfig.name}</span>
                </a>

                {/* Right Section */}
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">{/* <CommandMenu /> */}</div>
                    <nav className="flex items-center space-x-2">
                        <div className="hidden md:block">
                            <ModeToggle />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.imageUrl} alt={user?.fullname} />
                                        <AvatarFallback>{user?.fullname?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.fullname}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <NavLink to="/guarantee">
                                    <DropdownMenuItem>Nhà bảo lãnh</DropdownMenuItem>
                                </NavLink>
                                <NavLink to="/profile">
                                    <DropdownMenuItem>Xem thông tin cá nhân</DropdownMenuItem>
                                </NavLink>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>Đăng xuất</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </nav>
                </div>
            </div>
        </nav>
    );
}
