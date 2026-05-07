import { HealthStatus } from '../domain/health';

export class CheckHealthUseCase {
    execute(): HealthStatus {
        return {
            status: 'ok',
            uptime: 100 // placeholder for process.uptime()
        };
    }
}
