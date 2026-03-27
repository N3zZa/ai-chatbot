import { ThemeSwitcher } from "./theme-switcher";

export const Footer = () => {
  return (
    <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-10">
      <p>Powered by N3zZa</p>
      <ThemeSwitcher />
    </footer>
  );
};
