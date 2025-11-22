import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IVpsRepository } from './vps.repository.interface';
import { VpsInstance, CpuChartData, MemoryChartData, DiskChartData, NetworkChartData } from '../models/vps.models';
import { PeriodOption } from '../../../shared/services/period.service';

@Injectable({ providedIn: 'root' })
export class VpsRepository implements IVpsRepository {
  constructor(private http: HttpClient) {}

  getList(): Observable<VpsInstance[]> {
    return this.http.get<VpsInstance[]>(`${environment.apiUrl}/vps/list`);
  }

  getById(id: string): Observable<VpsInstance> {
    return this.http.get<VpsInstance>(`${environment.apiUrl}/vps/${id}`);
  }

  getCpuChart(id: string, period: PeriodOption): Observable<CpuChartData> {
    return this.http.get<CpuChartData>(`${environment.apiUrl}/vps/${id}/cpu-chart?period=${period}`);
  }

  getMemoryChart(id: string, period: PeriodOption): Observable<MemoryChartData> {
    return this.http.get<MemoryChartData>(`${environment.apiUrl}/vps/${id}/memory-chart?period=${period}`);
  }

  getDiskChart(id: string, period: PeriodOption): Observable<DiskChartData> {
    return this.http.get<DiskChartData>(`${environment.apiUrl}/vps/${id}/disk-chart?period=${period}`);
  }

  getNetworkChart(id: string, period: PeriodOption): Observable<NetworkChartData> {
    return this.http.get<NetworkChartData>(`${environment.apiUrl}/vps/${id}/network-chart?period=${period}`);
  }
}
