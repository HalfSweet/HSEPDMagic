import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { ThemeSwitch } from "@/components/theme-switch";
import { LanguageSwitch } from "@/components/language-switch";

export const AppNavbar = () => {
  return (
    <HeroUINavbar maxWidth="xl" position="sticky" className="bg-background/70 backdrop-blur-md">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center"
            color="foreground"
            href="/"
          >
            <p className="font-bold text-inherit">HS EPD Magic</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="flex gap-2">
          <LanguageSwitch />
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
  );
};
