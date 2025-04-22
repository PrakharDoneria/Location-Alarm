import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  onInfoClick: () => void;
}

const AppHeader = ({ onInfoClick }: AppHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-white font-semibold text-lg md:text-xl">Location Tracker</h1>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-full"
            onClick={onInfoClick}
          >
            <i className="ri-information-line text-xl"></i>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
