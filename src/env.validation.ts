import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number = 3000;

  @IsNotEmpty()
  @IsString()
  SERPAPI_APIKEY: string;

  @IsNotEmpty()
  @IsString()
  CORE_AC_UK_APIKEY: string;

  @IsNotEmpty()
  @IsString()
  OPENAI_APIKEY: string;

  @IsNotEmpty()
  @IsString()
  OPENAI_MODEL: string = 'gpt-3.5-turbo-0125';

  @IsNotEmpty()
  @IsString()
  DATABASE_URL: string;

  @IsNotEmpty()
  @IsString()
  SCRAPPERAPI_API_KEY: string;

  @IsNotEmpty()
  @IsString()
  CORS_ORIGINS: string;

  @IsNotEmpty()
  @IsString()
  JWT_SECRET: string;

  @IsNotEmpty()
  @IsString()
  JWT_EXPIRES: string;

  @IsNotEmpty()
  @IsString()
  SMTP_HOST: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  SMTP_PORT: number = 587;

  @IsNotEmpty()
  @IsBoolean()
  SMTP_SECURE: boolean = false;

  @IsNotEmpty()
  @IsString()
  SMTP_USER: string;

  @IsNotEmpty()
  @IsString()
  SMTP_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  AWS_REGION: string;

  @IsNotEmpty()
  @IsString()
  AWS_PUBLIC_BUCKET_NAME: string;

  @IsNotEmpty()
  @IsNumber()
  OTP_EXPIRES_MS: number = 1_800_000;

  @IsNotEmpty()
  @IsNumber()
  OTP_MAX_TIMES_SEND: number = 5;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
