import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../../ui/button';

interface BackButtonProps {
  label?: string;
  to?: string;
}

export default function BackButton({ label = 'Back', to }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="mb-4 flex items-center gap-2 bg-slate-200 text-slate-700 hover:bg-slate-300"
    >
      <ChevronLeft size={16} />
      {label}
    </Button>
  );
}
