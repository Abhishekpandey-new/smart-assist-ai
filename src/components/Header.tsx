import smartAssistLogo from "@/assets/smartassist-logo.png";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-center px-4">
        <img
          src={smartAssistLogo}
          alt="SmartAssist"
          className="h-10 w-auto object-contain"
        />
      </div>
    </header>
  );
};

export default Header;
