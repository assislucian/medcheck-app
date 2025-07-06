interface ProfileStatsProps {
  analyses: number;
  recovered: number;
}

export const ProfileStats = ({ analyses, recovered }: ProfileStatsProps) => {
  return (
    <div className="w-full md:w-auto grid grid-cols-2 gap-8 text-center">
      <div>
        <p className="text-2xl font-bold">{analyses}</p>
        <p className="text-sm text-muted-foreground">Análises</p>
      </div>
      <div>
        <p className="text-2xl font-bold">R$ {recovered.toLocaleString('pt-BR')}</p>
        <p className="text-sm text-muted-foreground">Recuperados</p>
      </div>
    </div>
  );
};
