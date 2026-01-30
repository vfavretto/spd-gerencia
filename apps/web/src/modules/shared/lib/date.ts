import { format, parseISO, differenceInDays, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formata uma data para exibição no formato brasileiro (dd/MM/yyyy)
 * Trata corretamente o timezone evitando problemas de -1 dia
 */
export function formatDateBR(
  date: string | Date | null | undefined
): string {
  if (!date) return "-";
  
  try {
    let parsed: Date;
    
    if (typeof date === "string") {
      // Se for apenas data (YYYY-MM-DD), adiciona T00:00:00 para evitar conversão UTC
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        parsed = new Date(date + "T00:00:00");
      } else {
        parsed = parseISO(date);
      }
    } else {
      parsed = date;
    }
    
    if (!isValid(parsed)) return "-";
    
    return format(parsed, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "-";
  }
}

/**
 * Formata uma data com hora para exibição
 */
export function formatDateTimeBR(
  date: string | Date | null | undefined
): string {
  if (!date) return "-";
  
  try {
    const parsed = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(parsed)) return "-";
    return format(parsed, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return "-";
  }
}

/**
 * Converte uma Date para formato YYYY-MM-DD para inputs type="date"
 * Usa data local, não UTC
 */
export function toDateInputValue(date: Date | null | undefined): string {
  if (!date || !isValid(date)) return "";
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}

/**
 * Converte string YYYY-MM-DD para Date local (sem conversão UTC)
 */
export function fromDateInputValue(value: string): Date | null {
  if (!value) return null;
  
  // Adiciona T00:00:00 para evitar conversão UTC
  const date = new Date(value + "T00:00:00");
  return isValid(date) ? date : null;
}

/**
 * Calcula dias restantes até uma data
 */
export function getDaysRemaining(
  targetDate: string | Date | null | undefined
): number | null {
  if (!targetDate) return null;
  
  try {
    const target = typeof targetDate === "string" 
      ? new Date(targetDate + (targetDate.length === 10 ? "T00:00:00" : ""))
      : targetDate;
    
    if (!isValid(target)) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return differenceInDays(target, today);
  } catch {
    return null;
  }
}

/**
 * Retorna cor do semáforo baseado nos dias restantes
 */
export function getTrafficLightFromDays(
  dias: number | null | undefined
): "green" | "yellow" | "red" {
  if (dias === null || dias === undefined || dias < 0) return "red";
  if (dias <= 30) return "yellow";
  return "green";
}

/**
 * Formata uma data relativa (ex: "há 2 dias", "em 5 dias")
 */
export function formatRelativeDate(
  date: string | Date | null | undefined
): string {
  if (!date) return "-";
  
  const dias = getDaysRemaining(date);
  if (dias === null) return "-";
  
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Amanhã";
  if (dias === -1) return "Ontem";
  if (dias > 0) return `em ${dias} dias`;
  return `há ${Math.abs(dias)} dias`;
}

