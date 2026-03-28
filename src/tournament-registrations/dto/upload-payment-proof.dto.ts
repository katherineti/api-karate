import { IsString, IsNotEmpty, IsOptional, IsIn, IsUrl } from 'class-validator';

/**
 * DTO para que un alumno suba comprobante de pago
 * 
 * Usada en: POST /tournament-registrations/:id/upload-payment
 * 
 * Flujo:
 * 1. Alumno selecciona método de pago (digital o efectivo)
 * 2. Si es digital: sube captura/recibo + referencia de transacción
 * 3. Si es efectivo: solo referencia (ej: número de recibo)
 * 4. Sistema cambia payment_status a 'en_espera' (espera validación del master)
 */
export class UploadPaymentProofDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['digital','Pago movil','Pago móvil','Trasferencia', 'efectivo'])
  payment_method: string; // 'digital' o 'efectivo'

  @IsString()
  @IsNotEmpty()
  payment_reference: string; // Número de transacción, referencia de efectivo, etc.

  @IsString()
  @IsOptional()
  @IsUrl()
  payment_proof_url?: string; // URL de la captura o comprobante (opcional para efectivo)
}
