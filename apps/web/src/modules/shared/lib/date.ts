import { format, parseISO, differenceInDays, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDateBR(
  date: string | Date | null | undefined
): string {
  if (!date) return "-";
  
  try {
    let parsed: Date;
    
    if (typeof date === "string") {
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

export function toDateInputValue(date: Date | null | undefined): string {
  if (!date || !isValid(date)) return "";
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}

export function toStringDateInputValue(value?: string | null): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function toDateTimeInputValue(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDaysRemaining(
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
