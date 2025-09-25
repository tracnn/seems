import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class OrganizationConfigService {
  private readonly config: any;
  private readonly logger = new Logger(OrganizationConfigService.name);

  constructor() {
    const configPath = process.env.ORG_CONFIG_PATH || './configs/organization_config.json';
    try {
      this.config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      this.logger.log(`Loaded organization config from ${configPath}`);
    } catch (err) {
      this.logger.error(`Cannot load config at ${configPath}: ${err}`);
      this.config = {};
    }
  }

  get organizationCode(): string {
    return this.config.organizationCode || '';
  }
  get contact(): any {
    return this.config.contact || {};
  }
  get address(): string {
    return this.config.address || '';
  }
  get logo(): string {
    return this.config.logo || '';
  }
  get settings(): any {
    return this.config.settings || {};
  }
  get showTreatmentEndTypeName(): boolean {
    return this.settings.showTreatmentEndTypeName ?? true;
  }
  get showTreatmentResultName(): boolean {
    return this.settings.showTreatmentResultName ?? true;
  }
  get showResultWhenTreatmentFinished(): boolean {
    return this.settings.showResultWhenTreatmentFinished ?? true;
  }
  get showIcdSubCode(): boolean {
    return this.settings.showIcdSubCode ?? false;
  }
  get showIcdText(): boolean {
    return this.settings.showIcdText ?? false;
  }
  get invoiceType(): string {
    return this.config.invoiceType;
  }
  get hisConfig(): any {
    return this.config.HIS_CONFIG || {};
  }
  get secretKey(): string {
    return this.config.secretKey || '';
  }
  get vneidConfig(): any {
    return this.config.VNEID_CONFIG || {};
  }
  get firebaseConfig(): any {
    return this.config.FIREBASE_CONFIG || {};
  }
  get appointmentConfig(): any {
    return this.config.APPOINTMENT_CONFIG || {};
  }
}