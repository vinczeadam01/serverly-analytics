import { Observable } from 'rxjs';
import { PeriodOption } from '../../../shared/services/period.service';
import { VpsInstance, CpuChartData, MemoryChartData, DiskChartData, NetworkChartData } from '../models/vps.models';

export interface IVpsRepository {
  getList(): Observable<VpsInstance[]>;
  getById(id: string): Observable<VpsInstance>;
  getCpuChart(id: string, period: PeriodOption): Observable<CpuChartData>;
  getMemoryChart(id: string, period: PeriodOption): Observable<MemoryChartData>;
  getDiskChart(id: string, period: PeriodOption): Observable<DiskChartData>;
  getNetworkChart(id: string, period: PeriodOption): Observable<NetworkChartData>;
}
