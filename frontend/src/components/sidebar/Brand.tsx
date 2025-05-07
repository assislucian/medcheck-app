import { useNavigate } from "react-router-dom";

export default function Brand() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate('/dashboard')}>
      <img src="/logo-medcheck.png" alt="MedCheck Logo" className="h-10 w-auto max-w-[40px] object-contain bg-transparent" />
      <span className="font-semibold text-lg tracking-tight text-brand">MedCheck</span>
    </div>
  );
} 