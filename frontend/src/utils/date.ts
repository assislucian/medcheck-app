export function calcularDiasParaContestar(data: string) {
  // Accepts dates in DD/MM/YYYY or YYYY-MM-DD or Date parsable string
  let dataBase: Date;
  if (/\d{2}\/\d{2}\/\d{4}/.test(data)) {
    const [dia, mes, ano] = data.split('/');
    dataBase = new Date(Number(ano), Number(mes) - 1, Number(dia));
  } else if (/\d{4}-\d{2}-\d{2}/.test(data)) {
    const [ano, mes, dia] = data.split('-');
    dataBase = new Date(Number(ano), Number(mes) - 1, Number(dia));
  } else {
    // Fallback to native Date parsing
    dataBase = new Date(data);
  }
  const hoje = new Date();
  const diffMs = hoje.getTime() - dataBase.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, 30 - diffDays);
}
