import { ApiService } from './api.service';
import { PreviewApiService } from './preview-api.service';

export const apiProvider = { provide: ApiService, useClass: PreviewApiService };
