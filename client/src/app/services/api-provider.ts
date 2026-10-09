import { ApiService } from './api.service';

export const apiProvider = { provide: ApiService, useClass: ApiService };
